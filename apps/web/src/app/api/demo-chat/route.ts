import { NextRequest, NextResponse } from 'next/server';

// Demo responses for the landing page chat
const DEMO_RESPONSES = [
  "Chatbot Studio lets you create AI chatbots trained on your content in minutes. No coding required!",
  "You can upload documents, scrape websites, or paste text. Your bot learns from your knowledge base.",
  "We support OpenAI GPT-5, Claude 3.5, Google Gemini, and Llama. You can switch models anytime.",
  "Yes! You get 7 days free access to all Pro features. No credit card required.",
  "The widget is fully customizable. You can change colors, upload your logo, and match your brand.",
  "Absolutely! All data is encrypted and GDPR compliant. You can export or delete your data anytime.",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const message = searchParams.get('message') || '';

  // Simple keyword-based responses (for demo purposes)
  let response = DEMO_RESPONSES[0];

  if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
    response = "Plans start at $29/month for the Starter plan. You can also try us free for 7 days!";
  } else if (message.toLowerCase().includes('train') || message.toLowerCase().includes('data')) {
    response = DEMO_RESPONSES[1];
  } else if (message.toLowerCase().includes('model') || message.toLowerCase().includes('ai')) {
    response = DEMO_RESPONSES[2];
  } else if (message.toLowerCase().includes('trial') || message.toLowerCase().includes('free')) {
    response = DEMO_RESPONSES[3];
  } else if (message.toLowerCase().includes('custom') || message.toLowerCase().includes('brand')) {
    response = DEMO_RESPONSES[4];
  } else if (message.toLowerCase().includes('secure') || message.toLowerCase().includes('gdpr')) {
    response = DEMO_RESPONSES[5];
  } else {
    // Random response
    response = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
  }

  // Simulate slight delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json({
    message: response,
    timestamp: new Date().toISOString(),
  });
}
