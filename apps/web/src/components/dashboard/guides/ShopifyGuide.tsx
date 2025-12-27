'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Copy, Check } from 'lucide-react';

interface ShopifyGuideProps {
  botId: string;
  onClose: () => void;
  onDisconnect?: () => void | Promise<void>;
}

export function ShopifyGuide({ botId, onClose, onDisconnect }: ShopifyGuideProps) {
  const [copied, setCopied] = useState(false);

  const apiBaseUrl = (process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  const widgetCode = `<!-- Chatbot Studio Widget (Shopify) -->
<script>
  window.chatbotConfig = {
    botId: '${botId}',
    apiUrl: '${apiBaseUrl}',
    shopifyStore: '{{ shop.permanent_domain }}',
    position: 'bottom-right',
    theme: 'light',
    shopifyIntegration: true
  };
</script>
<script src="https://cdn.yourdomain.com/widget.js" async></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2d1b4e] to-[#150a25] border border-purple-500/20">
        <div className="sticky top-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Shopify</h2>
            <p className="text-sm text-purple-300/70 mt-1">Aggiungi il widget nel tema Shopify (theme.liquid).</p>
          </div>
          <button onClick={onClose} className="text-purple-300/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Dove incollare il codice</h3>
            <ol className="space-y-2 text-sm text-purple-300/70 list-decimal list-inside">
              <li>Shopify Admin  Online Store  Themes</li>
              <li>Actions  Edit code</li>
              <li>Layout  <span className="text-purple-200">theme.liquid</span></li>
              <li>Incolla prima di <span className="bg-purple-900/50 px-2 py-1 rounded text-purple-200">&lt;/body&gt;</span></li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Codice</h3>
            <div className="relative">
              <pre className="bg-[#0f0520] border border-purple-500/20 text-purple-200 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{widgetCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="absolute top-2 right-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copia
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-4">
            <p className="text-sm text-fuchsia-300 font-medium mb-1"> Variabile Shopify inclusa</p>
            <p className="text-sm text-fuchsia-300/70">
              <span className="text-fuchsia-200">{'{{ shop.permanent_domain }}'}</span> viene inserita automaticamente da Shopify.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] border-t border-purple-500/20 p-6 flex gap-3 justify-between">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25"
          >
            Chiudi
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
      </Card>
    </div>
  );
}