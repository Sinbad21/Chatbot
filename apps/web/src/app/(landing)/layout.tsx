import type { Metadata } from 'next';
import { headers } from 'next/headers';

// Metadata translations for different languages
const METADATA_TRANSLATIONS = {
  en: {
    title: 'Chatbot Studio - Add a Smart AI Chatbot to Your Website in Minutes',
    description: 'Create custom AI chatbots trained on your data. No code required. Integrate with your website, WhatsApp, Telegram, and more. Start free today.',
    ogTitle: 'Chatbot Studio - Smart AI Chatbots for Your Website',
    ogDescription: 'Create AI-powered chatbots in minutes. Train on your data, customize branding, and deploy anywhere.',
    twitterTitle: 'Chatbot Studio - Smart AI Chatbots',
    twitterDescription: 'Create AI chatbots trained on your data in minutes',
    locale: 'en_US',
  },
  it: {
    title: 'Chatbot Studio - Aggiungi un Chatbot IA Intelligente al Tuo Sito in Minuti',
    description: 'Crea chatbot IA personalizzati addestrati sui tuoi dati. Nessun codice richiesto. Integra con il tuo sito web, WhatsApp, Telegram e altro. Inizia gratis oggi.',
    ogTitle: 'Chatbot Studio - Chatbot IA Intelligenti per il Tuo Sito',
    ogDescription: 'Crea chatbot alimentati da IA in minuti. Addestra sui tuoi dati, personalizza il branding e distribuisci ovunque.',
    twitterTitle: 'Chatbot Studio - Chatbot IA Intelligenti',
    twitterDescription: 'Crea chatbot IA addestrati sui tuoi dati in minuti',
    locale: 'it_IT',
  },
  es: {
    title: 'Chatbot Studio - Añade un Chatbot IA Inteligente a tu Sitio Web en Minutos',
    description: 'Crea chatbots IA personalizados entrenados con tus datos. Sin código requerido. Integra con tu sitio web, WhatsApp, Telegram y más. Comienza gratis hoy.',
    ogTitle: 'Chatbot Studio - Chatbots IA Inteligentes para tu Sitio',
    ogDescription: 'Crea chatbots con IA en minutos. Entrena con tus datos, personaliza la marca y despliega en cualquier lugar.',
    twitterTitle: 'Chatbot Studio - Chatbots IA Inteligentes',
    twitterDescription: 'Crea chatbots IA entrenados con tus datos en minutos',
    locale: 'es_ES',
  },
  de: {
    title: 'Chatbot Studio - Fügen Sie in Minuten einen intelligenten KI-Chatbot zu Ihrer Website hinzu',
    description: 'Erstellen Sie benutzerdefinierte KI-Chatbots, die mit Ihren Daten trainiert wurden. Kein Code erforderlich. Integration mit Ihrer Website, WhatsApp, Telegram und mehr.',
    ogTitle: 'Chatbot Studio - Intelligente KI-Chatbots für Ihre Website',
    ogDescription: 'Erstellen Sie KI-gestützte Chatbots in Minuten. Trainieren Sie mit Ihren Daten, passen Sie das Branding an und stellen Sie überall bereit.',
    twitterTitle: 'Chatbot Studio - Intelligente KI-Chatbots',
    twitterDescription: 'Erstellen Sie KI-Chatbots, die mit Ihren Daten trainiert wurden, in Minuten',
    locale: 'de_DE',
  },
  fr: {
    title: 'Chatbot Studio - Ajoutez un Chatbot IA Intelligent à Votre Site Web en Minutes',
    description: 'Créez des chatbots IA personnalisés formés sur vos données. Aucun code requis. Intégrez avec votre site web, WhatsApp, Telegram et plus.',
    ogTitle: 'Chatbot Studio - Chatbots IA Intelligents pour Votre Site',
    ogDescription: 'Créez des chatbots alimentés par IA en minutes. Formez avec vos données, personnalisez la marque et déployez partout.',
    twitterTitle: 'Chatbot Studio - Chatbots IA Intelligents',
    twitterDescription: 'Créez des chatbots IA formés sur vos données en minutes',
    locale: 'fr_FR',
  },
};

// Detect language from Accept-Language header
async function detectLanguage(): Promise<keyof typeof METADATA_TRANSLATIONS> {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    // Parse accept-language header (e.g., "en-US,en;q=0.9,es;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().substring(0, 2));

    // Check if any preferred language is supported
    for (const lang of languages) {
      if (lang in METADATA_TRANSLATIONS) {
        return lang as keyof typeof METADATA_TRANSLATIONS;
      }
    }
  } catch (error) {
    // Headers not available (client-side navigation), fall back to English
  }

  return 'en';
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLanguage();
  const meta = METADATA_TRANSLATIONS[lang];

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['chatbot', 'AI chatbot', 'GPT', 'Claude', 'customer support', 'automation', 'no-code', 'SaaS'],
    authors: [{ name: 'Chatbot Studio' }],
    openGraph: {
      type: 'website',
      locale: meta.locale,
      url: 'https://chatbot-5o5.pages.dev',
      siteName: 'Chatbot Studio',
      title: meta.ogTitle,
      description: meta.ogDescription,
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
      title: meta.twitterTitle,
      description: meta.twitterDescription,
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
    // Add alternate language links for SEO
    alternates: {
      languages: {
        'en': 'https://chatbot-5o5.pages.dev',
        'it': 'https://chatbot-5o5.pages.dev',
        'es': 'https://chatbot-5o5.pages.dev',
        'de': 'https://chatbot-5o5.pages.dev',
        'fr': 'https://chatbot-5o5.pages.dev',
        'x-default': 'https://chatbot-5o5.pages.dev',
      },
    },
  };
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
