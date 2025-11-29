import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

type Bindings = {
  DATABASE_URL: string;
};

const reviewBotRoutes = new Hono<{ Bindings: Bindings }>();

// Helper to get Prisma client
function getPrisma(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// GET /api/review-bot - List all review bots for organization
reviewBotRoutes.get('/', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    
    // TODO: Get organizationId from auth token
    const organizationId = c.req.header('x-organization-id') || 'demo-org';
    
    const reviewBots = await prisma.reviewBot.findMany({
      where: { organizationId },
      include: {
        ecommerceConnections: true,
        _count: {
          select: {
            reviewRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each bot
    const botsWithStats = await Promise.all(
      reviewBots.map(async (bot) => {
        const responses = await prisma.reviewResponse.count({
          where: { reviewRequest: { reviewBotId: bot.id } },
        });
        
        const positiveResponses = await prisma.reviewResponse.count({
          where: {
            reviewRequest: { reviewBotId: bot.id },
            rating: { gte: bot.positiveThreshold },
          },
        });
        
        const googleClicks = await prisma.reviewResponse.count({
          where: {
            reviewRequest: { reviewBotId: bot.id },
            clickedGoogleReview: true,
          },
        });

        return {
          ...bot,
          totalRequests: bot._count.reviewRequests,
          totalResponses: responses,
          totalPositive: positiveResponses,
          totalNegative: responses - positiveResponses,
          totalGoogleClicks: googleClicks,
          responseRate: bot._count.reviewRequests > 0 
            ? (responses / bot._count.reviewRequests) * 100 
            : 0,
          positiveRate: responses > 0 
            ? (positiveResponses / responses) * 100 
            : 0,
          googleClickRate: positiveResponses > 0 
            ? (googleClicks / positiveResponses) * 100 
            : 0,
        };
      })
    );

    return c.json({ success: true, data: botsWithStats });
  } catch (error) {
    console.error('Error fetching review bots:', error);
    return c.json({ success: false, error: 'Failed to fetch review bots' }, 500);
  }
});

// GET /api/review-bot/:id - Get single review bot
reviewBotRoutes.get('/:id', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const id = c.req.param('id');
    const organizationId = c.req.header('x-organization-id') || 'demo-org';

    const reviewBot = await prisma.reviewBot.findFirst({
      where: { id, organizationId },
      include: {
        ecommerceConnections: true,
        reviewRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            responses: true,
          },
        },
        _count: {
          select: { reviewRequests: true },
        },
      },
    });

    if (!reviewBot) {
      return c.json({ success: false, error: 'Review bot not found' }, 404);
    }

    // Calculate stats
    const totalResponses = await prisma.reviewResponse.count({
      where: { reviewRequest: { reviewBotId: id } },
    });
    
    const positiveResponses = await prisma.reviewResponse.count({
      where: {
        reviewRequest: { reviewBotId: id },
        rating: { gte: reviewBot.positiveThreshold },
      },
    });
    
    const googleClicks = await prisma.reviewResponse.count({
      where: {
        reviewRequest: { reviewBotId: id },
        clickedGoogleReview: true,
      },
    });

    return c.json({
      success: true,
      data: {
        ...reviewBot,
        totalRequests: reviewBot._count.reviewRequests,
        totalResponses,
        totalPositive: positiveResponses,
        totalNegative: totalResponses - positiveResponses,
        totalGoogleClicks: googleClicks,
        responseRate: reviewBot._count.reviewRequests > 0 
          ? (totalResponses / reviewBot._count.reviewRequests) * 100 
          : 0,
        positiveRate: totalResponses > 0 
          ? (positiveResponses / totalResponses) * 100 
          : 0,
        googleClickRate: positiveResponses > 0 
          ? (googleClicks / positiveResponses) * 100 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching review bot:', error);
    return c.json({ success: false, error: 'Failed to fetch review bot' }, 500);
  }
});

// POST /api/review-bot - Create new review bot
reviewBotRoutes.post('/', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const body = await c.req.json();
    const organizationId = c.req.header('x-organization-id') || 'demo-org';

    const {
      businessName,
      googlePlaceId,
      googleReviewUrl,
      thankYouMessage,
      surveyQuestion,
      positiveMessage,
      negativeMessage,
      completedMessage,
      surveyType,
      positiveThreshold,
      widgetColor,
      widgetPosition,
      delaySeconds,
      // eCommerce connection
      ecommercePlatform,
      stripeWebhookSecret,
      wooUrl,
      wooConsumerKey,
      wooConsumerSecret,
      shopifyDomain,
      shopifyAccessToken,
    } = body;

    if (!businessName) {
      return c.json({ success: false, error: 'Business name is required' }, 400);
    }

    // Generate unique widget ID
    const widgetId = `rb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create Review Bot
    const reviewBot = await prisma.reviewBot.create({
      data: {
        organizationId,
        widgetId,
        name: businessName,
        businessName,
        googlePlaceId: googlePlaceId || null,
        googleReviewUrl: googleReviewUrl || null,
        thankYouMessage: thankYouMessage || '🎉 Grazie per il tuo acquisto!',
        surveyQuestion: surveyQuestion || 'Come valuteresti la tua esperienza?',
        positiveMessage: positiveMessage || 'Fantastico! Ti andrebbe di condividere la tua opinione su Google?',
        negativeMessage: negativeMessage || 'Grazie per il feedback! Cosa possiamo migliorare?',
        completedMessage: completedMessage || 'Grazie mille per il tuo tempo! ❤️',
        surveyType: surveyType || 'EMOJI',
        positiveThreshold: positiveThreshold || 4,
        widgetColor: widgetColor || '#6366f1',
        widgetPosition: widgetPosition || 'bottom-right',
        delaySeconds: delaySeconds || 2,
        isActive: true,
      },
    });

    // Create eCommerce connection if platform provided
    if (ecommercePlatform) {
      const connectionData: any = {
        reviewBotId: reviewBot.id,
        platform: ecommercePlatform.toUpperCase(),
        isActive: true,
      };

      if (ecommercePlatform === 'stripe') {
        connectionData.webhookSecret = stripeWebhookSecret;
      } else if (ecommercePlatform === 'woocommerce') {
        connectionData.shopDomain = wooUrl;
        connectionData.apiKey = wooConsumerKey;
        connectionData.apiSecret = wooConsumerSecret;
      } else if (ecommercePlatform === 'shopify') {
        connectionData.shopDomain = shopifyDomain;
        connectionData.accessToken = shopifyAccessToken;
      }

      await prisma.ecommerceConnection.create({ data: connectionData });
    }

    // Fetch complete bot with connections
    const completeBot = await prisma.reviewBot.findUnique({
      where: { id: reviewBot.id },
      include: { ecommerceConnections: true },
    });

    return c.json({ success: true, data: completeBot }, 201);
  } catch (error) {
    console.error('Error creating review bot:', error);
    return c.json({ success: false, error: 'Failed to create review bot' }, 500);
  }
});

// PATCH /api/review-bot/:id - Update review bot
reviewBotRoutes.patch('/:id', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const id = c.req.param('id');
    const body = await c.req.json();
    const organizationId = c.req.header('x-organization-id') || 'demo-org';

    // Verify ownership
    const existing = await prisma.reviewBot.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Review bot not found' }, 404);
    }

    // Allowed fields to update
    const allowedFields = [
      'name',
      'businessName',
      'googlePlaceId',
      'googleReviewUrl',
      'isActive',
      'thankYouMessage',
      'surveyQuestion',
      'positiveMessage',
      'negativeMessage',
      'completedMessage',
      'surveyType',
      'positiveThreshold',
      'widgetColor',
      'widgetPosition',
      'delaySeconds',
      'autoCloseSeconds',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.reviewBot.update({
      where: { id },
      data: updateData,
      include: { ecommerceConnections: true },
    });

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating review bot:', error);
    return c.json({ success: false, error: 'Failed to update review bot' }, 500);
  }
});

// DELETE /api/review-bot/:id - Delete review bot
reviewBotRoutes.delete('/:id', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const id = c.req.param('id');
    const organizationId = c.req.header('x-organization-id') || 'demo-org';

    // Verify ownership
    const existing = await prisma.reviewBot.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Review bot not found' }, 404);
    }

    // Delete in order (cascade manually if needed)
    // 1. Delete responses
    await prisma.reviewResponse.deleteMany({
      where: { reviewRequest: { reviewBotId: id } },
    });
    
    // 2. Delete requests
    await prisma.reviewRequest.deleteMany({
      where: { reviewBotId: id },
    });
    
    // 3. Delete ecommerce connections
    await prisma.ecommerceConnection.deleteMany({
      where: { reviewBotId: id },
    });
    
    // 4. Delete review bot
    await prisma.reviewBot.delete({
      where: { id },
    });

    return c.json({ success: true, message: 'Review bot deleted' });
  } catch (error) {
    console.error('Error deleting review bot:', error);
    return c.json({ success: false, error: 'Failed to delete review bot' }, 500);
  }
});

export { reviewBotRoutes };
