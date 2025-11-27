'use client';

import { useState } from 'react';
import { IntegrationCard } from '@/components/dashboard/IntegrationCard';
import { WhatsAppWizard } from '@/components/dashboard/wizards/WhatsAppWizard';
import { TelegramWizard } from '@/components/dashboard/wizards/TelegramWizard';
import { WidgetGuide } from '@/components/dashboard/guides/WidgetGuide';
import { 
  WhatsAppIcon, 
  TelegramIcon, 
  SlackIcon, 
  StripeIcon, 
  HubSpotIcon, 
  GoogleCalendarIcon,
  brandColors 
} from '@/components/icons/BrandIcons';

export default function IntegrationsPage() {
  const [activeWizard, setActiveWizard] = useState<string | null>(null);

  // TODO: Get from API/Context
  const userPlan: string = 'professional'; // or 'starter', 'enterprise'
  const botId = 'bot_123456789';
  const configuredIntegrations = ['widget']; // IDs of configured integrations

  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Messaging',
      icon: <WhatsAppIcon className="w-6 h-6" />,
      color: brandColors.whatsapp,
      requiredPlan: 'professional' as const,
      wizard: 'whatsapp',
      status: 'Connected',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Bot Channels',
      icon: <TelegramIcon className="w-6 h-6" />,
      color: brandColors.telegram,
      requiredPlan: 'professional' as const,
      wizard: 'telegram',
      status: 'Disconnected',
    },
    {
      id: 'google',
      name: 'Google Calendar',
      description: 'Calendar Sync',
      icon: <GoogleCalendarIcon className="w-6 h-6" />,
      color: brandColors.google,
      isMultiColor: true,
      requiredPlan: 'starter' as const,
      wizard: 'google',
      status: 'Connected',
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM Sync',
      icon: <HubSpotIcon className="w-6 h-6" />,
      color: brandColors.hubspot,
      requiredPlan: 'professional' as const,
      wizard: 'hubspot',
      status: 'Connected',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payments',
      icon: <StripeIcon className="w-6 h-6" />,
      color: brandColors.stripe,
      requiredPlan: 'enterprise' as const,
      wizard: 'stripe',
      status: 'Disconnected',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notifications',
      icon: <SlackIcon className="w-6 h-6" />,
      color: brandColors.slack,
      requiredPlan: 'enterprise' as const,
      wizard: 'slack',
      status: 'Disconnected',
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Integrations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            onClick={() => setActiveWizard(integration.wizard)}
            className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-fuchsia-500/40 hover:shadow-[0_0_15px_rgba(192,38,211,0.15)] transition-all duration-500 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div 
                className="p-3 rounded-xl border border-purple-500/20 transition-all group-hover:scale-110"
                style={{
                  background: (integration as any).isMultiColor 
                    ? 'rgba(255,255,255,0.1)' 
                    : `linear-gradient(135deg, ${integration.color}25 0%, ${integration.color}10 100%)`
                }}
              >
                <div style={(integration as any).isMultiColor ? {} : { color: integration.color }}>
                  {integration.icon}
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  (integration as any).status === 'Connected'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}
              >
                {(integration as any).status || 'Disconnected'}
              </span>
            </div>

            <h3 className="text-lg font-bold mb-1 text-white">{integration.name}</h3>
            <p className="text-xs text-purple-300/50">{integration.description}</p>
          </div>
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
