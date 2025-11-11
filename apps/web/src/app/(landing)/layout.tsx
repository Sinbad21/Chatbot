import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chatbot Studio - Add a Smart AI Chatbot to Your Website in Minutes',
  description: 'Create custom AI chatbots trained on your data. No code required. Integrate with your website, WhatsApp, Telegram, and more. Start free today.',
  keywords: ['chatbot', 'AI chatbot', 'GPT', 'Claude', 'customer support', 'automation', 'no-code', 'SaaS'],
  authors: [{ name: 'Chatbot Studio' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chatbot-5o5.pages.dev',
    siteName: 'Chatbot Studio',
    title: 'Chatbot Studio - Smart AI Chatbots for Your Website',
    description: 'Create AI-powered chatbots in minutes. Train on your data, customize branding, and deploy anywhere.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chatbot Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chatbot Studio - Smart AI Chatbots',
    description: 'Create AI chatbots trained on your data in minutes',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
