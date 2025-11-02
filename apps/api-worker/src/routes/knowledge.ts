import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import type { PrismaClient } from '@prisma/client';

interface Bindings {
  DATABASE_URL: string;
}

interface Variables {
  user: { userId: string };
}

type App = Hono<{ Bindings: Bindings; Variables: Variables }>;

type GetDB = (databaseUrl: string) => PrismaClient;

async function getOrganizationId(prisma: PrismaClient, userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });
}

async function ensureBotAccess(prisma: PrismaClient, botId: string, organizationId: string) {
  const bot = await prisma.bot.findFirst({
    where: { id: botId, organizationId },
    select: { id: true },
  });

  if (!bot) {
    return null;
  }

  return bot;
}

export function registerKnowledgeRoutes(
  app: App,
  getDB: GetDB,
  authMiddleware: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }>,
) {
  // Documents
  app.get('/api/bots/:botId/documents', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const docs = await prisma.document.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(docs);
  });

  app.post('/api/bots/:botId/documents', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const body = await c.req.json<{ title?: string; content?: string }>();
    const { title, content } = body;

    if (!title || !content) {
      return c.json({ error: 'title and content are required' }, 400);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const doc = await prisma.document.create({
      data: {
        botId,
        title,
        content,
      },
    });

    return c.json(doc, 201);
  });

  app.delete('/api/documents/:docId', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const docId = c.req.param('docId');

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: { id: true, bot: { select: { organizationId: true } } },
    });

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership || doc.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.document.delete({ where: { id: docId } });
    return c.json({ success: true });
  });

  // Intents
  app.get('/api/bots/:botId/intents', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const intents = await prisma.intent.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(intents);
  });

  app.post('/api/bots/:botId/intents', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const body = await c.req.json<{ name?: string; trainingPhrases?: string[]; response?: string }>();
    const { name, trainingPhrases, response } = body;

    if (!name || !trainingPhrases || trainingPhrases.length === 0 || !response) {
      return c.json({ error: 'name, trainingPhrases and response are required' }, 400);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const intent = await prisma.intent.create({
      data: {
        botId,
        name,
        trainingPhrases,
        response,
      },
    });

    return c.json(intent, 201);
  });

  app.delete('/api/intents/:intentId', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const intentId = c.req.param('intentId');

    const intent = await prisma.intent.findUnique({
      where: { id: intentId },
      select: { id: true, bot: { select: { organizationId: true } } },
    });

    if (!intent) {
      return c.json({ error: 'Intent not found' }, 404);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership || intent.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.intent.delete({ where: { id: intentId } });
    return c.json({ success: true });
  });

  // FAQs
  app.get('/api/bots/:botId/faqs', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const faqs = await prisma.fAQ.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(faqs);
  });

  app.post('/api/bots/:botId/faqs', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const botId = c.req.param('botId');
    const body = await c.req.json<{ question?: string; answer?: string }>();
    const { question, answer } = body;

    if (!question || !answer) {
      return c.json({ error: 'question and answer are required' }, 400);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership) {
      return c.json({ error: 'User has no organization assigned' }, 403);
    }

    const bot = await ensureBotAccess(prisma, botId, membership.organizationId);
    if (!bot) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    const faq = await prisma.fAQ.create({
      data: {
        botId,
        question,
        answer,
      },
    });

    return c.json(faq, 201);
  });

  app.delete('/api/faqs/:faqId', authMiddleware, async (c) => {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const faqId = c.req.param('faqId');

    const faq = await prisma.fAQ.findUnique({
      where: { id: faqId },
      select: { id: true, bot: { select: { organizationId: true } } },
    });

    if (!faq) {
      return c.json({ error: 'FAQ not found' }, 404);
    }

    const membership = await getOrganizationId(prisma, user.userId);
    if (!membership || faq.bot.organizationId !== membership.organizationId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.fAQ.delete({ where: { id: faqId } });
    return c.json({ success: true });
  });
}
