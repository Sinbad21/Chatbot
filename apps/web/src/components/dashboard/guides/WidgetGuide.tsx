'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Copy, Check } from 'lucide-react';

interface WidgetGuideProps {
  botId: string;
  onClose: () => void;
  onDisconnect?: () => void | Promise<void>;
}

export function WidgetGuide({ botId, onClose, onDisconnect }: WidgetGuideProps) {
  const [copied, setCopied] = useState(false);

  const apiBaseUrl = (process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const widgetCode = `<!-- Chatbot Studio Widget -->
<script>
  window.chatbotConfig = {
    botId: '${botId}',
    apiUrl: '${apiBaseUrl}',
    position: 'bottom-right',
    theme: 'light'
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
          <h2 className="text-2xl font-bold text-white">Widget Sito Web</h2>
          <button onClick={onClose} className="text-purple-300/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Codice di installazione
            </h3>
            <p className="text-sm text-purple-300/70 mb-4">
              Copia questo codice e incollalo prima del tag <code className="bg-purple-900/50 px-2 py-1 rounded text-purple-200">&lt;/body&gt;</code> del tuo sito:
            </p>
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
            <p className="text-sm text-fuchsia-300 font-medium mb-2">
              ? Il widget è già configurato con il tuo Bot ID
            </p>
            <p className="text-sm text-fuchsia-300/70">
              Apparirà automaticamente nell'angolo in basso a destra del tuo sito.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Opzioni di personalizzazione
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <code className="bg-purple-900/50 px-2 py-1 rounded text-xs text-purple-200">position</code>
                <span className="text-purple-300/70">
                  Posizione: <code className="text-purple-200">'bottom-right'</code>, <code className="text-purple-200">'bottom-left'</code>, <code className="text-purple-200">'top-right'</code>, <code className="text-purple-200">'top-left'</code>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <code className="bg-purple-900/50 px-2 py-1 rounded text-xs text-purple-200">theme</code>
                <span className="text-purple-300/70">
                  Tema: <code className="text-purple-200">'light'</code>, <code className="text-purple-200">'dark'</code>, <code className="text-purple-200">'auto'</code>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <code className="bg-purple-900/50 px-2 py-1 rounded text-xs text-purple-200">language</code>
                <span className="text-purple-300/70">
                  Lingua: <code className="text-purple-200">'it'</code>, <code className="text-purple-200">'en'</code>, <code className="text-purple-200">'es'</code>, <code className="text-purple-200">'fr'</code>, ecc.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Piattaforme supportate:</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-purple-300/70">
              <li>• HTML/CSS/JavaScript</li>
              <li>• React</li>
              <li>• Vue.js</li>
              <li>• Angular</li>
              <li>• WordPress</li>
              <li>• Shopify</li>
              <li>• Wix</li>
              <li>• Webflow</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] border-t border-purple-500/20 p-6 flex gap-3 justify-between">
          <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25">
            Chiudi
          </Button>
          {onDisconnect && (
            <Button
              variant="outline"
              onClick={() => void onDisconnect()}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              Disconnetti
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
