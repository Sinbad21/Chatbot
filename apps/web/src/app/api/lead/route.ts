import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with your CRM or database
    console.log('[LEAD CAPTURED]', { email, name, company, timestamp: new Date().toISOString() });

    // TODO: Send to email service, Slack, or store in database
    // Example integrations:
    // - await prisma.lead.create({ data: { email, name, company } })
    // - await sendToSlack({ email, name, company })
    // - await sendToMailchimp({ email, name })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We\'ll be in touch soon.'
    });

  } catch (error) {
    console.error('[LEAD API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
