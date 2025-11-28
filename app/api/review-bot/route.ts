import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getAuthUser } from '@/lib/auth';

// GET /api/review-bot - List user's review bots
export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Get user's organization
    // const orgId = user.organizationId;

    // TODO: Fetch review bots
    // const reviewBots = await prisma.reviewBot.findMany({
    //   where: { organizationId: orgId },
    //   include: {
    //     ecommerceConnections: {
    //       select: {
    //         id: true,
    //         platform: true,
    //         isActive: true,
    //         lastSyncAt: true,
    //       },
    //     },
    //     _count: {
    //       select: {
    //         reviewRequests: true,
    //       },
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    // Mock response for development
    const reviewBots = [];

    return NextResponse.json({ reviewBots });
  } catch (error) {
    console.error('Error fetching review bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/review-bot - Create a new review bot
export async function POST(request: NextRequest) {
  try {
    // TODO: Get authenticated user
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    
    // Validate required fields
    const {
      name,
      businessName,
      googlePlaceId,
      googleReviewUrl,
      thankYouMessage,
      positiveMessage,
      negativeMessage,
      completedMessage,
      surveyType,
      positiveThreshold,
      widgetColor,
      widgetPosition,
      delaySeconds,
      ecommercePlatform,
      // Platform-specific fields
      stripeApiKey,
      wooUrl,
      wooConsumerKey,
      wooConsumerSecret,
      shopifyDomain,
      shopifyAccessToken,
    } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    // TODO: Create review bot in database
    // const reviewBot = await prisma.reviewBot.create({
    //   data: {
    //     organizationId: user.organizationId,
    //     name: name || businessName,
    //     businessName,
    //     googlePlaceId,
    //     googleReviewUrl,
    //     thankYouMessage: thankYouMessage || '🎉 Grazie per il tuo acquisto!',
    //     positiveMessage: positiveMessage || 'Fantastico! Ti andrebbe di condividere la tua opinione su Google?',
    //     negativeMessage: negativeMessage || 'Grazie per il feedback! Cosa possiamo migliorare?',
    //     completedMessage: completedMessage || 'Grazie mille per il tuo tempo! ❤️',
    //     surveyType: surveyType || 'EMOJI',
    //     positiveThreshold: positiveThreshold || 4,
    //     widgetColor: widgetColor || '#6366f1',
    //     widgetPosition: widgetPosition || 'bottom-right',
    //     delaySeconds: delaySeconds || 2,
    //   },
    // });

    // TODO: Create eCommerce connection if provided
    // if (ecommercePlatform) {
    //   await prisma.ecommerceConnection.create({
    //     data: {
    //       reviewBotId: reviewBot.id,
    //       platform: ecommercePlatform.toUpperCase(),
    //       // Encrypt sensitive data before storing
    //       apiKey: ecommercePlatform === 'stripe' ? encrypt(stripeApiKey) : null,
    //       shopDomain: ecommercePlatform === 'woocommerce' ? wooUrl : 
    //                   ecommercePlatform === 'shopify' ? shopifyDomain : null,
    //       wooConsumerKey: ecommercePlatform === 'woocommerce' ? encrypt(wooConsumerKey) : null,
    //       wooConsumerSecret: ecommercePlatform === 'woocommerce' ? encrypt(wooConsumerSecret) : null,
    //       shopifyAccessToken: ecommercePlatform === 'shopify' ? encrypt(shopifyAccessToken) : null,
    //     },
    //   });
    // }

    // Mock response for development
    const reviewBot = {
      id: 'mock-id',
      widgetId: 'widget-' + Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ reviewBot }, { status: 201 });
  } catch (error) {
    console.error('Error creating review bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}