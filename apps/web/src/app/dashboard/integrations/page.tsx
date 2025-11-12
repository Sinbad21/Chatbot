'use client';

import { useState } from 'react';
import { IntegrationCard } from '@/components/dashboard/IntegrationCard';
import { WhatsAppWizard } from '@/components/dashboard/wizards/WhatsAppWizard';
import { TelegramWizard } from '@/components/dashboard/wizards/TelegramWizard';
import { WidgetGuide } from '@/components/dashboard/guides/WidgetGuide';
import { MessageCircle, Send, Slack, Globe, ShoppingBag, Code } from 'lucide-react';

export default function IntegrationsPage() {
  const [activeWizard, setActiveWizard] = useState<string | null>(null);

  // TODO: Get from API/Context
  const userPlan: string = 'professional'; // or 'starter', 'enterprise'
  const botId = 'bot_123456789';
  const configuredIntegrations = ['widget']; // IDs of configured integrations

  const integrations = [
    {
      id: 'widget',
      name: 'Website Widget',
      description: 'Aggiungi il chatbot al tuo sito web con un semplice snippet di codice. Funziona su qualsiasi piattaforma.',
      icon: <Globe className="w-6 h-6 text-emerald" />,
      requiredPlan: 'starter' as const,
      wizard: 'widget',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connetti il chatbot a WhatsApp Business API per rispondere ai clienti su WhatsApp.',
      icon: <MessageCircle className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'whatsapp',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Crea un bot Telegram e collega il tuo chatbot per conversazioni automatizzate.',
      icon: <Send className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'telegram',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Integra il chatbot nel tuo workspace Slack per assistenza interna al team.',
      icon: <Slack className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'slack',
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Plugin dedicato per WordPress con integrazione WooCommerce e configurazione visuale.',
      icon: <Code className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'wordpress',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Integrazione nativa per Shopify con product recommendations, order tracking e cart recovery.',
      icon: <ShoppingBag className="w-6 h-6 text-emerald" />,
      requiredPlan: 'enterprise' as const,
      wizard: 'shopify',
    },
  ];

  const handleSave = (integrationId: string, config: any) => {
    console.log('Saving config for', integrationId, config);
    // TODO: Save to API
    setActiveWizard(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Integrazioni</h1>
        <p className="text-muted-gray">
          Connetti il tuo chatbot a canali multipli per raggiungere i clienti ovunque si trovino.
        </p>
      </div>

      {/* Plan Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Piano attuale: <span className="capitalize">{userPlan}</span></p>
          <p className="text-sm text-blue-800 mt-1">
            {userPlan === 'starter' && 'Passa a Professional per sbloccare più integrazioni'}
            {userPlan === 'professional' && 'Passa a Enterprise per sbloccare Shopify e altre funzionalità avanzate'}
            {userPlan === 'enterprise' && 'Hai accesso a tutte le integrazioni disponibili'}
          </p>
        </div>
        {userPlan !== 'enterprise' && (
          <a
            href="/pricing"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Upgrade
          </a>
        )}
      </div>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            description={integration.description}
            icon={integration.icon}
            requiredPlan={integration.requiredPlan}
            userPlan={userPlan}
            configured={configuredIntegrations.includes(integration.id)}
            onSetup={() => setActiveWizard(integration.wizard)}
          />
        ))}
      </div>

      {/* Wizards */}
      {activeWizard === 'widget' && (
        <WidgetGuide
          botId={botId}
          onClose={() => setActiveWizard(null)}
        />
      )}
      {activeWizard === 'whatsapp' && (
        <WhatsAppWizard
          botId={botId}
          onClose={() => setActiveWizard(null)}
          onSave={(config) => handleSave('whatsapp', config)}
        />
      )}
      {activeWizard === 'telegram' && (
        <TelegramWizard
          botId={botId}
          onClose={() => setActiveWizard(null)}
          onSave={(config) => handleSave('telegram', config)}
        />
      )}
      {/* TODO: Add Slack, WordPress, Shopify wizards */}
    </div>
  );
}
