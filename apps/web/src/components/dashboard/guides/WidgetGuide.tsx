'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Copy, Check } from 'lucide-react';

interface WidgetGuideProps {
  botId: string;
  onClose: () => void;
}

export function WidgetGuide({ botId, onClose }: WidgetGuideProps) {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<!-- Chatbot Studio Widget -->
<script>
  window.chatbotConfig = {
    botId: '${botId}',
    apiUrl: 'https://api.yourdomain.com',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal">Widget Sito Web</h2>
          <button onClick={onClose} className="text-muted-gray hover:text-charcoal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-3">
              Codice di installazione
            </h3>
            <p className="text-sm text-muted-gray mb-4">
              Copia questo codice e incollalo prima del tag <code className="bg-slate-100 px-2 py-1 rounded">&lt;/body&gt;</code> del tuo sito:
            </p>
            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{widgetCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="absolute top-2 right-2 bg-white"
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

          <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-4">
            <p className="text-sm text-emerald-900 font-medium mb-2">
              ✓ Il widget è già configurato con il tuo Bot ID
            </p>
            <p className="text-sm text-emerald-800">
              Apparirà automaticamente nell'angolo in basso a destra del tuo sito.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-3">
              Opzioni di personalizzazione
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">position</code>
                <span className="text-muted-gray">
                  Posizione: <code>'bottom-right'</code>, <code>'bottom-left'</code>, <code>'top-right'</code>, <code>'top-left'</code>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">theme</code>
                <span className="text-muted-gray">
                  Tema: <code>'light'</code>, <code>'dark'</code>, <code>'auto'</code>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">language</code>
                <span className="text-muted-gray">
                  Lingua: <code>'it'</code>, <code>'en'</code>, <code>'es'</code>, <code>'fr'</code>, ecc.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-charcoal mb-2">Piattaforme supportate:</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-gray">
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

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
          <Button onClick={onClose} className="w-full bg-emerald hover:bg-emerald/90 text-white">
            Chiudi
          </Button>
        </div>
      </Card>
    </div>
  );
}
