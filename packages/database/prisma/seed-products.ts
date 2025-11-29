import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products and addons...');

  // ============================================
  // PRODUCTS
  // ============================================
  
  const products = [
    {
      name: 'Chatbot Starter',
      slug: 'chatbot-starter',
      description: 'Perfetto per piccole attività che vogliono iniziare con un chatbot AI.',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      features: [
        '1 Chatbot',
        '1.000 messaggi/mese',
        'Widget web',
        'Knowledge base base',
        'Supporto email',
      ],
      limits: {
        bots: 1,
        messagesPerMonth: 1000,
        documents: 10,
        webPages: 20,
        channels: ['web'],
      },
    },
    {
      name: 'Chatbot Professional',
      slug: 'chatbot-professional',
      description: 'Per aziende in crescita che necessitano di più funzionalità e integrazioni.',
      priceMonthly: 79,
      priceYearly: 790,
      currency: 'EUR',
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      features: [
        '3 Chatbot',
        '10.000 messaggi/mese',
        'Widget web + WhatsApp',
        'Knowledge base avanzata',
        'Analytics base',
        'Supporto prioritario',
      ],
      limits: {
        bots: 3,
        messagesPerMonth: 10000,
        documents: 50,
        webPages: 100,
        channels: ['web', 'whatsapp'],
      },
    },
    {
      name: 'Chatbot Enterprise',
      slug: 'chatbot-enterprise',
      description: 'Soluzione completa per grandi aziende con esigenze avanzate.',
      priceMonthly: 199,
      priceYearly: 1990,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      sortOrder: 3,
      features: [
        'Chatbot illimitati',
        '50.000 messaggi/mese',
        'Tutti i canali',
        'Knowledge base illimitata',
        'Analytics avanzate',
        'API access',
        'Account manager dedicato',
        'SLA garantito',
      ],
      limits: {
        bots: -1, // unlimited
        messagesPerMonth: 50000,
        documents: -1,
        webPages: -1,
        channels: ['web', 'whatsapp', 'telegram', 'slack', 'discord'],
      },
    },
    {
      name: 'Review Bot',
      slug: 'review-bot',
      description: 'Raccogli recensioni Google automaticamente dopo ogni acquisto.',
      priceMonthly: 19,
      priceYearly: 190,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      sortOrder: 10,
      features: [
        'Widget review personalizzabile',
        'Integrazione Stripe',
        'Integrazione WooCommerce',
        'Integrazione Shopify',
        'Dashboard analytics',
        'Email notifiche',
      ],
      limits: {
        reviewRequests: 500,
        ecommerceConnections: 1,
      },
    },
    {
      name: 'Calendar Bot',
      slug: 'calendar-bot',
      description: 'Sistema di prenotazione integrato con Google Calendar.',
      priceMonthly: 15,
      priceYearly: 150,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      sortOrder: 11,
      features: [
        'Sincronizzazione Google Calendar',
        'Widget prenotazioni',
        'Reminder automatici',
        'Gestione disponibilità',
        'Pagine prenotazione personalizzate',
      ],
      limits: {
        calendars: 1,
        bookingsPerMonth: 100,
      },
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`  ✅ Product: ${product.name}`);
  }

  // ============================================
  // ADDONS
  // ============================================

  const addons = [
    // Channels
    {
      name: 'WhatsApp Channel',
      slug: 'whatsapp-channel',
      description: 'Aggiungi il canale WhatsApp Business al tuo chatbot.',
      category: 'CHANNEL',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'EUR',
      isActive: true,
      sortOrder: 1,
      config: { channel: 'whatsapp' },
    },
    {
      name: 'Telegram Channel',
      slug: 'telegram-channel',
      description: 'Aggiungi il canale Telegram al tuo chatbot.',
      category: 'CHANNEL',
      priceMonthly: 9,
      priceYearly: 90,
      currency: 'EUR',
      isActive: true,
      sortOrder: 2,
      config: { channel: 'telegram' },
    },
    {
      name: 'Slack Channel',
      slug: 'slack-channel',
      description: 'Integra il chatbot nel tuo workspace Slack.',
      category: 'CHANNEL',
      priceMonthly: 19,
      priceYearly: 190,
      currency: 'EUR',
      isActive: true,
      sortOrder: 3,
      config: { channel: 'slack' },
    },
    {
      name: 'Discord Channel',
      slug: 'discord-channel',
      description: 'Aggiungi il bot al tuo server Discord.',
      category: 'CHANNEL',
      priceMonthly: 9,
      priceYearly: 90,
      currency: 'EUR',
      isActive: true,
      sortOrder: 4,
      config: { channel: 'discord' },
    },

    // Integrations
    {
      name: 'Stripe Integration',
      slug: 'stripe-integration',
      description: 'Collega Stripe per tracciare pagamenti e ordini.',
      category: 'INTEGRATION',
      priceMonthly: 15,
      priceYearly: 150,
      currency: 'EUR',
      isActive: true,
      sortOrder: 10,
      config: { integration: 'stripe' },
    },
    {
      name: 'WooCommerce Integration',
      slug: 'woocommerce-integration',
      description: 'Integra il tuo negozio WooCommerce.',
      category: 'INTEGRATION',
      priceMonthly: 15,
      priceYearly: 150,
      currency: 'EUR',
      isActive: true,
      sortOrder: 11,
      config: { integration: 'woocommerce' },
    },
    {
      name: 'Shopify Integration',
      slug: 'shopify-integration',
      description: 'Collega il tuo store Shopify.',
      category: 'INTEGRATION',
      priceMonthly: 15,
      priceYearly: 150,
      currency: 'EUR',
      isActive: true,
      sortOrder: 12,
      config: { integration: 'shopify' },
    },
    {
      name: 'Google Calendar Integration',
      slug: 'google-calendar-integration',
      description: 'Sincronizza con Google Calendar per prenotazioni.',
      category: 'INTEGRATION',
      priceMonthly: 9,
      priceYearly: 90,
      currency: 'EUR',
      isActive: true,
      sortOrder: 13,
      config: { integration: 'google-calendar' },
    },

    // Features
    {
      name: 'Priority Support',
      slug: 'priority-support',
      description: 'Supporto prioritario con risposta entro 4 ore.',
      category: 'FEATURE',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'EUR',
      isActive: true,
      sortOrder: 20,
      config: { responseTime: '4h' },
    },
    {
      name: 'White Label',
      slug: 'white-label',
      description: 'Rimuovi il branding Chatbot Studio e usa il tuo logo.',
      category: 'FEATURE',
      priceMonthly: 49,
      priceYearly: 490,
      currency: 'EUR',
      isActive: true,
      sortOrder: 21,
      config: { removeBranding: true },
    },
    {
      name: 'Custom Domain',
      slug: 'custom-domain',
      description: 'Usa il tuo dominio personalizzato per il widget.',
      category: 'FEATURE',
      priceMonthly: 19,
      priceYearly: 190,
      currency: 'EUR',
      isActive: true,
      sortOrder: 22,
      config: { customDomain: true },
    },

    // AI
    {
      name: 'Extra AI Credits (10K)',
      slug: 'extra-ai-credits-10k',
      description: '10.000 messaggi AI aggiuntivi al mese.',
      category: 'AI',
      priceMonthly: 19,
      priceYearly: 190,
      currency: 'EUR',
      isActive: true,
      sortOrder: 30,
      config: { extraMessages: 10000 },
    },
    {
      name: 'GPT-4 Access',
      slug: 'gpt4-access',
      description: 'Usa GPT-4 per risposte più intelligenti e accurate.',
      category: 'AI',
      priceMonthly: 39,
      priceYearly: 390,
      currency: 'EUR',
      isActive: true,
      sortOrder: 31,
      config: { model: 'gpt-4' },
    },
  ];

  for (const addon of addons) {
    await prisma.addon.upsert({
      where: { slug: addon.slug },
      update: {
        ...addon,
        category: addon.category as any,
      },
      create: {
        ...addon,
        category: addon.category as any,
      },
    });
    console.log(`  ✅ Addon: ${addon.name}`);
  }

  // ============================================
  // PRODUCT-ADDON RELATIONSHIPS
  // ============================================

  // Get products
  const starterProduct = await prisma.product.findUnique({ where: { slug: 'chatbot-starter' } });
  const proProduct = await prisma.product.findUnique({ where: { slug: 'chatbot-professional' } });
  const enterpriseProduct = await prisma.product.findUnique({ where: { slug: 'chatbot-enterprise' } });

  // Get addons
  const whatsappAddon = await prisma.addon.findUnique({ where: { slug: 'whatsapp-channel' } });
  const telegramAddon = await prisma.addon.findUnique({ where: { slug: 'telegram-channel' } });
  const priorityAddon = await prisma.addon.findUnique({ where: { slug: 'priority-support' } });

  // Professional includes WhatsApp
  if (proProduct && whatsappAddon) {
    await prisma.productAddon.upsert({
      where: {
        productId_addonId: {
          productId: proProduct.id,
          addonId: whatsappAddon.id,
        },
      },
      update: { isIncluded: true },
      create: {
        productId: proProduct.id,
        addonId: whatsappAddon.id,
        isIncluded: true,
      },
    });
    console.log(`  ✅ Linked: Professional -> WhatsApp (included)`);
  }

  // Enterprise includes all channels
  if (enterpriseProduct && whatsappAddon && telegramAddon) {
    await prisma.productAddon.upsert({
      where: {
        productId_addonId: {
          productId: enterpriseProduct.id,
          addonId: whatsappAddon.id,
        },
      },
      update: { isIncluded: true },
      create: {
        productId: enterpriseProduct.id,
        addonId: whatsappAddon.id,
        isIncluded: true,
      },
    });

    await prisma.productAddon.upsert({
      where: {
        productId_addonId: {
          productId: enterpriseProduct.id,
          addonId: telegramAddon.id,
        },
      },
      update: { isIncluded: true },
      create: {
        productId: enterpriseProduct.id,
        addonId: telegramAddon.id,
        isIncluded: true,
      },
    });
    console.log(`  ✅ Linked: Enterprise -> WhatsApp + Telegram (included)`);
  }

  // Starter gets discount on priority support
  if (starterProduct && priorityAddon) {
    await prisma.productAddon.upsert({
      where: {
        productId_addonId: {
          productId: starterProduct.id,
          addonId: priorityAddon.id,
        },
      },
      update: { isIncluded: false, discountPercent: 20 },
      create: {
        productId: starterProduct.id,
        addonId: priorityAddon.id,
        isIncluded: false,
        discountPercent: 20,
      },
    });
    console.log(`  ✅ Linked: Starter -> Priority Support (20% discount)`);
  }

  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
