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
      description: 'Connetti il chatbot a WhatsApp Business API per rispondere automaticamente ai messaggi dei clienti.',
      icon: <MessageCircle className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'whatsapp',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Crea un bot Telegram e collega il tuo chatbot per conversazioni automatizzate su Telegram.',
      icon: <Send className="w-6 h-6 text-emerald" />,
      requiredPlan: 'professional' as const,
      wizard: 'telegram',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Integra il chatbot nel tuo workspace Slack per assistenza e supporto interno al team.',
      icon: <Slack className="w-6 h-6 text-emerald" />,
      requiredPlan: 'enterprise' as const,
      wizard: 'slack',
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Plugin dedicato per WordPress con integrazione WooCommerce, configurazione visuale e shortcode.',
      icon: <Code className="w-6 h-6 text-emerald" />,
      requiredPlan: 'enterprise' as const,
      wizard: 'wordpress',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Integrazione nativa per Shopify: product recommendations, order tracking, cart recovery e analytics.',
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

  const getPlanMessage = () => {
    switch (userPlan) {
      case 'starter':
        return {
          title: 'Piano Starter',
          message: 'Passa a Professional per sbloccare WhatsApp e Telegram',
          available: 1,
          total: 6,
        };
      case 'professional':
        return {
          title: 'Piano Professional',
          message: 'Passa a Enterprise per sbloccare Slack, WordPress e Shopify',
          available: 3,
          total: 6,
        };
      case 'enterprise':
        return {
          title: 'Piano Enterprise',
          message: 'Hai accesso a tutte le integrazioni disponibili',
          available: 6,
          total: 6,
        };
      default:
        return {
          title: 'Piano Free',
          message: 'Passa a Starter per iniziare con il Website Widget',
          available: 0,
          total: 6,
        };
    }
  };

  const planInfo = getPlanMessage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Integrazioni</h1>
        <p className="text-charcoal/70">
          Connetti il tuo chatbot a canali multipli per raggiungere i clienti ovunque si trovino.
        </p>
      </div>

      {/* Plan Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-semibold text-blue-900">{planInfo.title}</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {planInfo.available}/{planInfo.total} integrazioni
              </span>
            </div>
            <p className="text-sm text-charcoal/80">
              {planInfo.message}
            </p>
          </div>
          {userPlan !== 'enterprise' && (
            <a
              href="/pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Upgrade Piano
            </a>
          )}
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-charcoal mb-2">Starter</h3>
          <p className="text-sm text-charcoal/70 mb-3">Perfetto per iniziare</p>
          <ul className="space-y-1 text-sm text-charcoal/80">
            <li>• Website Widget</li>
          </ul>
        </div>
        <div className="p-4 bg-emerald/5 border border-emerald/20 rounded-lg">
          <h3 className="font-semibold text-charcoal mb-2">Professional</h3>
          <p className="text-sm text-charcoal/70 mb-3">Per crescita multi-canale</p>
          <ul className="space-y-1 text-sm text-charcoal/80">
            <li>• Website Widget</li>
            <li>• WhatsApp Business</li>
            <li>• Telegram</li>
          </ul>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-charcoal mb-2">Enterprise</h3>
          <p className="text-sm text-charcoal/70 mb-3">Tutto incluso</p>
          <ul className="space-y-1 text-sm text-charcoal/80">
            <li>• Tutte le integrazioni</li>
            <li>• Slack (team interno)</li>
            <li>• WordPress + WooCommerce</li>
            <li>• Shopify + Analytics</li>
          </ul>
        </div>
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
