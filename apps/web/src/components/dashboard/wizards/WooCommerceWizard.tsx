'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface WooCommerceWizardProps {
  botId: string;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig?: Partial<{
    storeUrl: string;
    webhookSecret: string;
    consumerKey: string;
    consumerSecret: string;
  }>;
  onDisconnect?: () => void | Promise<void>;
}

export function WooCommerceWizard({ botId, onClose, onSave, initialConfig, onDisconnect }: WooCommerceWizardProps) {
  const [config, setConfig] = useState({
    storeUrl: initialConfig?.storeUrl || '',
    webhookSecret: initialConfig?.webhookSecret || '',
    consumerKey: initialConfig?.consumerKey || '',
    consumerSecret: initialConfig?.consumerSecret || '',
  });

  const handleSave = () => {
    onSave({ ...config, botId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2d1b4e] to-[#150a25] border border-purple-500/20">
        <div className="sticky top-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Integrazione WooCommerce</h2>
            <p className="text-sm text-purple-300/70 mt-1">Salva URL store + secret webhook + API keys</p>
          </div>
          <button onClick={onClose} className="text-purple-300/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300/70 mb-2">Store URL</label>
            <input
              type="text"
              value={config.storeUrl}
              onChange={(e) => setConfig({ ...config, storeUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70 mb-2">Webhook Secret</label>
            <input
              type="password"
              value={config.webhookSecret}
              onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
              placeholder="(il secret che imposti nel webhook WooCommerce)"
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70 mb-2">Consumer Key</label>
            <input
              type="password"
              value={config.consumerKey}
              onChange={(e) => setConfig({ ...config, consumerKey: e.target.value })}
              placeholder="ck_..."
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300/70 mb-2">Consumer Secret</label>
            <input
              type="password"
              value={config.consumerSecret}
              onChange={(e) => setConfig({ ...config, consumerSecret: e.target.value })}
              placeholder="cs_..."
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
            />
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              Endpoint webhook (WooCommerce): <span className="text-purple-100 font-semibold">/api/webhooks/woocommerce/review</span>
            </p>
            <p className="text-xs text-purple-300/60 mt-1">Topic consigliati: order.completed / order.processing</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] border-t border-purple-500/20 p-6 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
              Annulla
            </Button>
            {onDisconnect && (
              <Button
                variant="outline"
                onClick={() => void onDisconnect()}
                className="border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                Disconnetti account
              </Button>
            )}
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25"
            disabled={!config.storeUrl || !config.webhookSecret}
          >
            Salva configurazione
          </Button>
        </div>
      </Card>
    </div>
  );
}