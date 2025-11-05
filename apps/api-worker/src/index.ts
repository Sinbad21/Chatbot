import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerKnowledgeRoutes } from './routes/knowledge';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: ['https://chatbot-studio.pages.dev', 'https://chatbot-5o5.pages.dev', 'https://chatbot-studio-29k.pages.dev', 'http://localhost:3000'],
  credentials: true,
}));

// Database connection helper
const getDB = (databaseUrl: string) => {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
};

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

registerKnowledgeRoutes(app as any, getDB, authMiddleware);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Chatbot Studio API'
  });
});

app.get('/debug/env', (c) => {
  return c.json({
    DATABASE_URL_exists: !!c.env.DATABASE_URL,
    DATABASE_URL_length: c.env.DATABASE_URL?.length || 0,
    DATABASE_URL_preview: c.env.DATABASE_URL?.substring(0, 20) + '...' || 'NOT_SET',
    JWT_SECRET_exists: !!c.env.JWT_SECRET,
    JWT_REFRESH_SECRET_exists: !!c.env.JWT_REFRESH_SECRET,
    all_env_keys: Object.keys(c.env)
  });
});

// Database connection health check
app.get('/api/v1/debug/db', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    
    // Test basic connection with raw query
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test that we can access tables
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    const botCount = await prisma.bot.count();
    const docCount = await prisma.document.count();
    
    return c.json({
      ok: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount,
        organizations: orgCount,
        bots: botCount,
        documents: docCount,
      }
    });
  } catch (error: any) {
    console.error('[DEBUG /db] Database connection failed:', error);
    return c.json({
      ok: false,
      error: 'Database connection failed',
      code: error.code || 'UNKNOWN',
      message: error.message || String(error),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/v1/auth/register', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { email, password, name } = await c.req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create slug for organization
    const slugBase = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workspace`;
    let slug = slugBase;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter}`;
      counter++;
    }

    // Multi-tenant: Create user + organization + membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create personal organization
      const organization = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          slug,
          plan: 'free',
        },
      });

      // 2. Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // 3. Create organization membership with OWNER role
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      return { user, organization };
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role },
      c.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: result.user.id, tokenId: result.user.id },
      c.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return c.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
      tokens: { accessToken, refreshToken },
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/auth/login', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { email, password } = await c.req.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: user.id },
      c.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// BOT ROUTES
// ============================================

app.get('/api/v1/bots', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');

    // Multi-tenant: Get user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    // Get all bots in user's organization (not just created by user)
    const bots = await prisma.bot.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        _count: {
          select: {
            conversations: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(bots);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/bots', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const { name, description, systemPrompt, welcomeMessage, color } = await c.req.json();

    // Multi-tenant: Get user's organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true, role: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    // Create bot with auto-propagated organizationId
    const bot = await prisma.bot.create({
      data: {
        name,
        description,
        organizationId: membership.organizationId, // Auto-propagated from user
        userId: user.userId,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
        welcomeMessage: welcomeMessage || 'Hello! How can I help you?',
        color: color || '#6366f1',
      },
    });

    return c.json(bot, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/v1/bots/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const id = c.req.param('id');

    const bot = await prisma.bot.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            conversations: true,
            documents: true,
            intents: true,
            faqs: true,
          },
        },
      },
    });

    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    return c.json(bot);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.patch('/api/v1/bots/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();

    // Verify bot belongs to user
    const existingBot = await prisma.bot.findUnique({
      where: { id },
    });

    if (!existingBot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    if (existingBot.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update bot
    const bot = await prisma.bot.update({
      where: { id },
      data: updates,
    });

    return c.json(bot);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/api/v1/bots/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const id = c.req.param('id');

    // Verify bot belongs to user
    const existingBot = await prisma.bot.findUnique({
      where: { id },
    });

    if (!existingBot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    if (existingBot.userId !== user.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Delete bot (cascade will handle related records)
    await prisma.bot.delete({
      where: { id },
    });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// DOCUMENTS ROUTES
// ============================================

app.get('/api/v1/bots/:botId/documents', authMiddleware, async (c) => {
  try {
    console.log('[GET /documents] Starting request');
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    console.log('[GET /documents] Request details:', {
      userId: user?.userId,
      botId,
    });

    // Verify user has organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true, role: true },
    });

    console.log('[GET /documents] User membership:', {
      found: !!membership,
      organizationId: membership?.organizationId || 'NULL',
      role: membership?.role || 'NULL',
    });

    if (!membership || !membership.organizationId) {
      console.log('[GET /documents] ⚠️  User has no organization - returning empty array');
      // Return empty array instead of error to allow UI to load
      return c.json([], 200);
    }

    // Verify bot exists and user has access
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true, organizationId: true, name: true },
    });

    console.log('[GET /documents] Bot details:', {
      found: !!bot,
      organizationId: bot?.organizationId || 'NULL',
      name: bot?.name || 'NULL',
    });

    if (!bot) {
      console.log('[GET /documents] ❌ Bot not found');
      return c.json({ error: 'Bot not found' }, 404);
    }

    if (!bot.organizationId) {
      console.log('[GET /documents] ❌ Bot has no organizationId - database inconsistency!');
      return c.json({
        error: 'Bot configuration error',
        message: 'This bot is not associated with any organization',
        code: 'BOT_NO_ORGANIZATION'
      }, 500);
    }

    if (bot.organizationId !== membership.organizationId) {
      console.log('[GET /documents] ❌ Organization mismatch:', {
        botOrg: bot.organizationId,
        userOrg: membership.organizationId,
      });
      return c.json({
        error: 'Access denied',
        message: 'This bot belongs to a different organization',
        code: 'ORGANIZATION_MISMATCH'
      }, 403);
    }

    console.log('[GET /documents] ✅ Tenant check passed - fetching documents...');

    // Fetch documents
    const documents = await prisma.document.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        size: true,
        url: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[GET /documents] ✅ Found documents:', documents.length);

    // Transform documents to match frontend interface
    const transformedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.title,
      content: doc.content,
      status: doc.status.toLowerCase(),
      createdAt: doc.createdAt,
    }));

    return c.json(transformedDocuments);
  } catch (error: any) {
    console.error('[GET /documents] ❌ EXCEPTION:', error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[GET /documents] Prisma error code:', error.code);
      console.error('[GET /documents] Prisma meta:', error.meta);

      if (error.code === 'P2025') {
        // Record not found
        console.error('[GET /documents] Record not found');
        return c.json([], 200); // Return empty array for not found
      }

      if (error.code === 'P2021') {
        // Table does not exist
        console.error('[GET /documents] Table does not exist - migration needed!');
        return c.json({
          error: 'Database not initialized',
          message: 'Documents table does not exist. Run: npx prisma migrate deploy',
          code: 'TABLE_NOT_FOUND',
          prismaCode: error.code,
        }, 500);
      }

      // Other Prisma errors
      console.error('[GET /documents] Unhandled Prisma error');
      return c.json({
        error: 'Database error',
        message: error.message,
        code: 'PRISMA_ERROR',
        prismaCode: error.code,
      }, 500);
    }

    // Generic errors
    console.error('[GET /documents] Generic error:', error.message);
    console.error('[GET /documents] Stack:', error.stack);
    return c.json({
      error: 'Internal server error',
      message: error.message,
      details: c.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
});

app.post('/api/v1/bots/:botId/documents', authMiddleware, async (c) => {
  try {
    console.log('[POST /documents] Starting request');
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    // Parse and validate request body
    let body;
    try {
      body = await c.req.json();
    } catch {
      console.log('[POST /documents] Failed to parse JSON body');
      return c.json({ error: 'Invalid JSON in request body' }, 400);
    }

    const { name, content } = body;

    console.log('[POST /documents] Request details:', {
      userId: user?.userId,
      botId,
      nameLength: name?.length,
      contentLength: content?.length,
    });

    // Validate required fields
    if (!name || typeof name !== 'string') {
      console.log('[POST /documents] Invalid name field');
      return c.json({ error: 'name is required and must be a string' }, 422);
    }

    if (!content || typeof content !== 'string') {
      console.log('[POST /documents] Invalid content field');
      return c.json({ error: 'content is required and must be a string' }, 422);
    }

    // Validate field lengths
    const MAX_NAME_LENGTH = 200;
    const MAX_CONTENT_LENGTH = 200000; // ~200KB

    if (name.length > MAX_NAME_LENGTH) {
      console.log('[POST /documents] Name too long:', name.length);
      return c.json({
        error: 'Document name too long',
        message: `Name must be less than ${MAX_NAME_LENGTH} characters`
      }, 422);
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      console.log('[POST /documents] Content too large:', content.length);
      return c.json({
        error: 'Document content too large',
        message: `Content must be less than ${MAX_CONTENT_LENGTH} characters (~200KB)`
      }, 413);
    }

    if (name.trim().length === 0) {
      console.log('[POST /documents] Name is empty after trim');
      return c.json({ error: 'Document name cannot be empty' }, 400);
    }

    if (content.trim().length === 0) {
      console.log('[POST /documents] Content is empty after trim');
      return c.json({ error: 'Document content cannot be empty' }, 400);
    }

    // Verify user has organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true, role: true },
    });

    console.log('[POST /documents] User membership:', {
      found: !!membership,
      organizationId: membership?.organizationId || 'NULL',
      role: membership?.role || 'NULL',
    });

    if (!membership || !membership.organizationId) {
      console.log('[POST /documents] ❌ User has no organization - needs onboarding');
      return c.json({
        error: 'User not associated with any organization',
        message: 'Please run the multi-tenant fix script: npm run db:fix-multi-tenant',
        code: 'NO_ORGANIZATION'
      }, 403);
    }

    // Verify bot exists and user has access
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true, organizationId: true, name: true },
    });

    console.log('[POST /documents] Bot details:', {
      found: !!bot,
      organizationId: bot?.organizationId || 'NULL',
      name: bot?.name || 'NULL',
    });

    if (!bot) {
      console.log('[POST /documents] ❌ Bot not found');
      return c.json({ error: 'Bot not found' }, 404);
    }

    if (!bot.organizationId) {
      console.log('[POST /documents] ❌ Bot has no organizationId - database inconsistency!');
      return c.json({
        error: 'Bot configuration error',
        message: 'This bot is not associated with any organization. Please run: npm run db:fix-multi-tenant',
        code: 'BOT_NO_ORGANIZATION'
      }, 500);
    }

    if (bot.organizationId !== membership.organizationId) {
      console.log('[POST /documents] ❌ Organization mismatch:', {
        botOrg: bot.organizationId,
        userOrg: membership.organizationId,
      });
      return c.json({
        error: 'Access denied',
        message: 'This bot belongs to a different organization',
        code: 'ORGANIZATION_MISMATCH'
      }, 403);
    }

    console.log('[POST /documents] ✅ Tenant check passed - creating document...');
    console.log('[POST /documents] Final validation:', {
      userOrg: membership.organizationId,
      botOrg: bot.organizationId,
      match: membership.organizationId === bot.organizationId,
    });

    const document = await prisma.document.create({
      data: {
        botId,
        title: name.trim(),
        content: content.trim(),
        type: 'text',
        size: content.trim().length,
        url: '',
        status: 'COMPLETED',
      },
    });

    console.log('[POST /documents] ✅ Document created successfully:', document.id);

    // Transform document to match frontend interface
    const transformedDocument = {
      id: document.id,
      name: document.title,
      content: document.content,
      status: document.status.toLowerCase(),
      createdAt: document.createdAt,
    };

    return c.json(transformedDocument, 201);
  } catch (error: any) {
    console.error('[POST /documents] ❌ EXCEPTION:', error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[POST /documents] Prisma error code:', error.code);
      console.error('[POST /documents] Prisma meta:', error.meta);

      if (error.code === 'P2003') {
        // Foreign key constraint failed
        console.error('[POST /documents] Foreign key constraint violation - likely organizationId mismatch');
        return c.json({
          error: 'Database constraint violation',
          message: 'Foreign key/tenant mismatch. Please run: npm run db:fix-multi-tenant',
          code: 'FK_CONSTRAINT',
          prismaCode: error.code,
        }, 409);
      }

      if (error.code === 'P2025') {
        // Record not found
        console.error('[POST /documents] Record not found in database');
        return c.json({
          error: 'Record not found',
          message: 'The referenced record does not exist',
          code: 'NOT_FOUND',
          prismaCode: error.code,
        }, 404);
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        console.error('[POST /documents] Unique constraint violation');
        return c.json({
          error: 'Duplicate record',
          message: 'A record with this data already exists',
          code: 'DUPLICATE',
          prismaCode: error.code,
        }, 409);
      }

      // Other Prisma errors
      console.error('[POST /documents] Unhandled Prisma error');
      return c.json({
        error: 'Database error',
        message: error.message,
        code: 'PRISMA_ERROR',
        prismaCode: error.code,
      }, 500);
    }

    // Generic errors
    console.error('[POST /documents] Generic error:', error.message);
    console.error('[POST /documents] Stack:', error.stack);
    return c.json({
      error: 'Internal server error',
      message: error.message,
      details: c.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
});

app.delete('/api/v1/documents/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const id = c.req.param('id');

    // Get document with bot organization
    const document = await prisma.document.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    });

    if (!document) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Verify user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership || document.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    await prisma.document.delete({ where: { id } });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// WEB SCRAPING ROUTE
// ============================================

app.post('/api/v1/bots/:botId/scrape', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const { url } = await c.req.json();

    console.log('🌐 [SCRAPE] Request:', { botId, url });

    // Validate URL
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'URL is required' }, 400);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return c.json({ error: 'Invalid URL format' }, 400);
    }

    // Verify bot access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization' }, 403);
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { organizationId: true },
    });

    if (!bot || bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Bot not found or access denied' }, 404);
    }

    console.log('🌐 [SCRAPE] Fetching URL:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatbotStudio/1.0; +https://chatbotstudio.com)',
      },
    });

    if (!response.ok) {
      return c.json({
        error: 'Failed to fetch URL',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }, 502);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return c.json({
        error: 'Invalid content type',
        message: 'URL must point to an HTML page',
      }, 400);
    }

    const html = await response.text();

    // Simple text extraction from HTML
    // Remove script and style tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Limit content to 50,000 characters
    if (text.length > 50000) {
      text = text.substring(0, 50000) + '... [Content truncated]';
    }

    if (text.length < 50) {
      return c.json({
        error: 'Insufficient content',
        message: 'Could not extract enough text from the webpage',
      }, 400);
    }

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const pageTitle = titleMatch
      ? titleMatch[1].replace(/\s+/g, ' ').trim()
      : parsedUrl.hostname;

    // Create document from scraped content
    const document = await prisma.document.create({
      data: {
        botId,
        title: `${pageTitle.substring(0, 190)} [Web]`,
        content: text,
        type: 'web',
        size: text.length,
        url: url,
        status: 'COMPLETED',
      },
    });

    console.log('✅ [SCRAPE] Document created:', document.id);

    return c.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        url: document.url,
        size: document.size,
      },
    });
  } catch (error: any) {
    console.error('❌ [SCRAPE] Error:', error);
    return c.json({
      error: 'Scraping failed',
      message: error.message || 'Unknown error',
    }, 500);
  }
});

// ============================================
// INTENTS ROUTES
// ============================================

app.get('/api/v1/bots/:botId/intents', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    // Verify bot access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization' }, 403);
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { organizationId: true },
    });

    if (!bot || bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Bot not found or access denied' }, 404);
    }

    const intents = await prisma.intent.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(intents);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/bots/:botId/intents', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const { name, patterns, response, enabled = true } = await c.req.json();

    // Verify bot access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization' }, 403);
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { organizationId: true },
    });

    if (!bot || bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Bot not found or access denied' }, 404);
    }

    const intent = await prisma.intent.create({
      data: {
        botId,
        name,
        patterns,
        response,
        enabled,
      },
    });

    return c.json(intent, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/api/v1/intents/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const id = c.req.param('id');

    // Get intent with bot organization
    const intent = await prisma.intent.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    });

    if (!intent) {
      return c.json({ error: 'Intent not found' }, 404);
    }

    // Verify user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership || intent.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    await prisma.intent.delete({ where: { id } });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// FAQs ROUTES
// ============================================

app.get('/api/v1/bots/:botId/faqs', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    // Verify bot access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization' }, 403);
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { organizationId: true },
    });

    if (!bot || bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Bot not found or access denied' }, 404);
    }

    const faqs = await prisma.fAQ.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(faqs);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/bots/:botId/faqs', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const { question, answer, category, enabled = true } = await c.req.json();

    // Verify bot access
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return c.json({ error: 'User has no organization' }, 403);
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { organizationId: true },
    });

    if (!bot || bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Bot not found or access denied' }, 404);
    }

    const faq = await prisma.fAQ.create({
      data: {
        botId,
        question,
        answer,
        category,
        enabled,
      },
    });

    return c.json(faq, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/api/v1/faqs/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const id = c.req.param('id');

    // Get FAQ with bot organization
    const faq = await prisma.fAQ.findUnique({
      where: { id },
      include: { bot: { select: { organizationId: true } } },
    });

    if (!faq) {
      return c.json({ error: 'FAQ not found' }, 404);
    }

    // Verify user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.userId },
      select: { organizationId: true },
    });

    if (!membership || faq.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    await prisma.fAQ.delete({ where: { id } });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// CHAT ROUTES (PUBLIC)
// ============================================

app.post('/api/v1/chat', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { botId, message, sessionId, metadata } = await c.req.json();

    // Validate required fields
    if (!botId || !message) {
      return c.json({ error: 'botId and message are required' }, 400);
    }

    console.log('💬 [CHAT] Request:', { botId, message, sessionId });

    // Get bot with documents
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        documents: {
          where: { status: 'COMPLETED' },
          select: { title: true, content: true }
        },
        intents: { where: { enabled: true } },
        faqs: { where: { enabled: true } }
      },
    });

    if (!bot || !bot.published) {
      return c.json({ error: 'Bot not found or not published' }, 404);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { botId, sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10  // Last 10 messages for context
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          botId,
          sessionId,
          source: metadata?.source || 'widget',
          metadata,
        },
        include: { messages: true }
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: 'USER',
      },
    });

    // Build context from documents
    let documentsContext = '';
    if (bot.documents.length > 0) {
      documentsContext = '\n\n# Knowledge Base\n\n';
      for (const doc of bot.documents) {
        documentsContext += `## ${doc.title}\n\n${doc.content}\n\n`;
      }
    }

    // Build context from intents
    let intentsContext = '';
    if (bot.intents.length > 0) {
      intentsContext = '\n\n# Intents\n\n';
      for (const intent of bot.intents) {
        intentsContext += `- ${intent.name}: ${intent.response}\n`;
      }
    }

    // Build context from FAQs
    let faqsContext = '';
    if (bot.faqs.length > 0) {
      faqsContext = '\n\n# Frequently Asked Questions\n\n';
      for (const faq of bot.faqs) {
        faqsContext += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      }
    }

    // Build conversation history
    const conversationHistory = conversation.messages
      .reverse()
      .map((msg: any) => ({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content
      }));

    // Build system prompt
    const systemPrompt = `${bot.systemPrompt}${documentsContext}${intentsContext}${faqsContext}

You are ${bot.name}, an AI assistant. Use the knowledge base, intents, and FAQs provided above to answer questions accurately and concisely.

Important guidelines:
- Give direct, brief answers (2-3 sentences max when possible)
- If you need more information to give a good answer, ask a specific clarifying question
- If the information is not in the knowledge base, use your general knowledge but indicate that
- Be conversational and helpful`;

    console.log('🤖 [CHAT] Calling OpenAI GPT-5 Mini...');

    // Call OpenAI GPT-5 Mini API directly using fetch (Workers-compatible)
    // Using gpt-5-mini for faster responses
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('❌ [CHAT] OpenAI API Error:', errorData);

      // Check if it's a bad request error (invalid parameters, etc.)
      const isBadRequest = errorData.error?.type === 'invalid_request_error' ||
                           errorData.error?.code === 'unsupported_parameter';

      return c.json({
        error: 'OpenAI API error',
        message: errorData.error?.message || 'Unknown OpenAI error',
        details: errorData.error
      }, isBadRequest ? 400 : 502);
    }

    const completion = await openaiResponse.json();
    const response = completion.choices?.[0]?.message?.content || bot.welcomeMessage;

    console.log('✅ [CHAT] GPT-5 Response received');

    // Save bot response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: response,
        role: 'ASSISTANT',
      },
    });

    return c.json({
      message: response,
      conversationId: conversation.id,
      botName: bot.name,
    });
  } catch (error: any) {
    console.error('❌ [CHAT] Error:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      botId,
      sessionId,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return c.json({
          error: 'Database constraint violation',
          message: 'Bot not found or database FK constraint error',
          prismaCode: error.code,
        }, 409);
      }
      if (error.code === 'P2025') {
        return c.json({
          error: 'Record not found',
          message: 'Bot not found',
          prismaCode: error.code,
        }, 404);
      }
      if (error.code === 'P2002') {
        return c.json({
          error: 'Unique constraint violation',
          message: 'Conversation already exists',
          prismaCode: error.code,
        }, 409);
      }
      if (error.code === 'P2011') {
        return c.json({
          error: 'Database error',
          message: `Null constraint violation on the fields: (${error.meta?.target})`,
          prismaCode: error.code,
        }, 400);
      }
      if (error.code === 'P2022') {
        return c.json({
          error: 'Database error',
          message: `The column \`${error.meta?.column}\` does not exist in the current database.`,
          prismaCode: error.code,
        }, 500);
      }
      if (error.code === 'P2021') {
        return c.json({
          error: 'Database error',
          message: `The table \`${error.meta?.table}\` does not exist in the current database.`,
          prismaCode: error.code,
        }, 500);
      }

      return c.json({
        error: 'Database error',
        message: error.message,
        prismaCode: error.code,
      }, 500);
    }

    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/v1/chat/:botId/config', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const botId = c.req.param('botId');

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        avatar: true,
        welcomeMessage: true,
        color: true,
        published: true,
      },
    });

    if (!bot || !bot.published) {
      return c.json({ error: 'Bot not found or not published' }, 404);
    }

    return c.json(bot);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

app.get('/api/v1/analytics/overview', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');

    const [conversations, messages, leads] = await Promise.all([
      prisma.conversation.count({
        where: { bot: { userId: user.userId } },
      }),
      prisma.message.count({
        where: { conversation: { bot: { userId: user.userId } } },
      }),
      prisma.lead.count({
        where: { conversation: { bot: { userId: user.userId } } },
      }),
    ]);

    return c.json({ conversations, messages, leads });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get conversations over time (for line chart)
app.get('/api/v1/analytics/conversations-over-time', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const range = c.req.query('range') || '30d';

    // Calculate date range
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get conversations grouped by date
    const conversations = await prisma.conversation.findMany({
      where: {
        bot: { userId: user.userId },
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dataMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, 0);
    }

    conversations.forEach(conv => {
      const dateStr = conv.createdAt.toISOString().split('T')[0];
      const current = dataMap.get(dateStr) || 0;
      dataMap.set(dateStr, current + 1);
    });

    const data = Array.from(dataMap.entries()).map(([date, conversations]) => ({
      date,
      conversations,
    }));

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get top intents (for bar chart)
app.get('/api/v1/analytics/top-intents', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const range = c.req.query('range') || '30d';

    // Calculate date range
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get all messages with intent detection (simplified - you may want to enhance this)
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          bot: { userId: user.userId },
        },
        createdAt: { gte: startDate },
        role: 'USER', // Only count user messages (using Prisma enum)
      },
      select: {
        content: true,
      },
    });

    // Simple intent detection based on keywords (enhance with your actual intent matching logic)
    const intentCounts = new Map<string, number>();
    const intentKeywords: Record<string, string[]> = {
      'Greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      'Pricing': ['price', 'cost', 'pricing', 'how much', 'payment', 'subscription'],
      'Support': ['help', 'support', 'issue', 'problem', 'error', 'not working'],
      'Features': ['feature', 'can you', 'does it', 'available', 'capability'],
      'Contact': ['contact', 'email', 'phone', 'reach', 'talk to'],
    };

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      for (const [intent, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(keyword => content.includes(keyword))) {
          intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
        }
      }
    });

    // Convert to array and sort by count
    const data = Array.from(intentCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get conversations list with filters
app.get('/api/v1/conversations', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const status = c.req.query('status') || 'all';
    const sort = c.req.query('sort') || 'recent';
    const search = c.req.query('search') || '';

    // Build where clause
    const where: any = {
      bot: { userId: user.userId },
    };

    if (status !== 'all') {
      where.status = status;
    }

    // Get conversations with message count
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        bot: {
          select: {
            name: true,
          },
        },
        messages: {
          select: {
            content: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy:
        sort === 'recent'
          ? { createdAt: 'desc' }
          : sort === 'oldest'
          ? { createdAt: 'asc' }
          : undefined,
    });

    // Format response with duration calculation
    let data = conversations.map(conv => {
      const firstMsg = conv.messages[0];
      const lastMsg = conv.messages[conv.messages.length - 1];
      let duration = 'N/A';

      if (firstMsg && lastMsg && conv.messages.length > 1) {
        const durationMs = lastMsg.createdAt.getTime() - firstMsg.createdAt.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        duration = `${minutes}m ${seconds}s`;
      }

      return {
        id: conv.id,
        botName: conv.bot.name,
        messageCount: conv._count.messages,
        lastMessage: lastMsg?.content || 'No messages',
        createdAt: conv.createdAt.toISOString(),
        status: conv.status || 'active',
        duration,
      };
    });

    // Apply search filter
    if (search) {
      data = data.filter(
        conv =>
          conv.botName.toLowerCase().includes(search.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by message count if needed
    if (sort === 'messages') {
      data.sort((a, b) => b.messageCount - a.messageCount);
    }

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get conversation detail with full transcript
app.get('/api/v1/conversations/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const conversationId = c.req.param('id');

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        bot: { userId: user.userId }, // Security: ensure user owns this conversation
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        lead: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Calculate duration
    const firstMsg = conversation.messages[0];
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    let duration = 'N/A';
    if (firstMsg && lastMsg) {
      const durationMs = lastMsg.createdAt.getTime() - firstMsg.createdAt.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      duration = `${minutes}m ${seconds}s`;
    }

    const data = {
      id: conversation.id,
      botId: conversation.bot.id,
      botName: conversation.bot.name,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      status: conversation.status || 'active',
      metadata: {
        duration,
        leadCaptured: !!conversation.lead,
        leadInfo: conversation.lead,
      },
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    };

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// API KEYS MANAGEMENT
// ============================================

// Get all API keys for user
app.get('/api/v1/api-keys', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mask the keys (show only first 20 chars)
    const data = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      key: key.key.substring(0, 20) + '••••••••••••',
      lastUsed: key.lastUsed?.toISOString() || null,
      createdAt: key.createdAt.toISOString(),
    }));

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Generate new API key
app.post('/api/v1/api-keys', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const body = await c.req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ error: 'Name is required' }, 400);
    }

    // Generate a secure random API key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const key = 'sk_live_' + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Get user's organization
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return c.json({ error: 'User organization not found' }, 404);
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name.trim(),
        key,
        userId: user.userId,
        organizationId: userWithOrg.organizationId,
      },
    });

    // Return full key only on creation (user needs to save it)
    return c.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // Full key shown only once
      lastUsed: null,
      createdAt: apiKey.createdAt.toISOString(),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Revoke/Delete API key
app.delete('/api/v1/api-keys/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const keyId = c.req.param('id');

    // Check if key exists and belongs to user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.userId,
      },
    });

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// DEBUG / HEALTH CHECK ENDPOINTS
// ============================================

app.get('/api/v1/debug/db', async (c) => {
  console.log('[DEBUG /db] Testing database connection...');

  try {
    const prisma = getDB(c.env.DATABASE_URL);

    // Test 1: Basic connection
    console.log('[DEBUG /db] Test 1: Running SELECT 1');
    await prisma.$queryRaw`SELECT 1 as result`;
    console.log('[DEBUG /db] ✅ SELECT 1 succeeded');

    // Test 2: Check tables exist
    console.log('[DEBUG /db] Test 2: Checking tables');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;
    console.log('[DEBUG /db] ✅ Found tables:', tables);

    // Test 3: Count records in key tables
    console.log('[DEBUG /db] Test 3: Counting records');
    const [userCount, orgCount, botCount, docCount] = await Promise.all([
      prisma.user.count().catch(() => -1),
      prisma.organization.count().catch(() => -1),
      prisma.bot.count().catch(() => -1),
      prisma.document.count().catch(() => -1),
    ]);

    const counts = {
      users: userCount,
      organizations: orgCount,
      bots: botCount,
      documents: docCount,
    };
    console.log('[DEBUG /db] ✅ Record counts:', counts);

    return c.json({
      ok: true,
      message: 'Database connection successful',
      tables: Array.isArray(tables) ? tables.length : 0,
      counts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[DEBUG /db] ❌ FAILED:', error);
    console.error('[DEBUG /db] Error code:', error.code);
    console.error('[DEBUG /db] Error message:', error.message);
    console.error('[DEBUG /db] Stack:', error.stack);

    return c.json({
      ok: false,
      error: error.message,
      code: error.code,
      name: error.name,
      details: {
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error.code,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export default app;
