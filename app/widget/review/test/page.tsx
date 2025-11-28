'use client';

import { useState } from 'react';
import { RefreshCw, Play, Eye, Code } from 'lucide-react';

export default function ReviewWidgetTestPage() {
  const [widgetId, setWidgetId] = useState('demo-widget');
  const [showWidget, setShowWidget] = useState(false);
  const [triggerMode, setTriggerMode] = useState<'auto' | 'manual'>('manual');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const triggerWidget = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.ReviewBot) {
      // @ts-ignore
      window.ReviewBot.show({ force: true });
    }
  };

  const resetWidget = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.ReviewBot) {
      // @ts-ignore
      window.ReviewBot.reset();
    }
    alert('Widget reset! Puoi testarlo di nuovo.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Review Bot Widget - Test Page</h1>
          <p className="text-gray-400 text-sm">Ambiente di test per sviluppo widget</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code size={20} className="text-purple-400" />
                Configurazione
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Widget ID</label>
                  <input
                    type="text"
                    value={widgetId}
                    onChange={(e) => setWidgetId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Trigger Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTriggerMode('manual')}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        triggerMode === 'manual'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-400'
                      }`}
                    >
                      Manuale
                    </button>
                    <button
                      onClick={() => setTriggerMode('auto')}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        triggerMode === 'auto'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 text-gray-400'
                      }`}
                    >
                      Auto (2s delay)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play size={20} className="text-emerald-400" />
                Azioni
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setShowWidget(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Carica Widget
                </button>

                <button
                  onClick={triggerWidget}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  Mostra Widget (ReviewBot.show)
                </button>

                <button
                  onClick={resetWidget}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reset Stato (ReviewBot.reset)
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Codice Embed</h2>
              <pre className="p-4 bg-gray-900 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<script src="${baseUrl}/api/review-widget/${widgetId}/embed.js" async></script>`}
              </pre>
            </div>
          </div>

          {/* Preview Area */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye size={20} className="text-blue-400" />
              Preview
            </h2>

            <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl min-h-[500px] overflow-hidden">
              {/* Simulated website content */}
              <div className="p-6">
                <div className="bg-gray-600/50 h-8 w-48 rounded mb-4"></div>
                <div className="bg-gray-600/30 h-4 w-full rounded mb-2"></div>
                <div className="bg-gray-600/30 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-600/30 h-4 w-5/6 rounded mb-6"></div>
                
                <div className="bg-emerald-600 text-white px-6 py-3 rounded-lg inline-block font-medium">
                  ✅ Ordine Completato!
                </div>
                
                <p className="text-gray-400 mt-4 text-sm">
                  Simula il tuo sito dopo un acquisto completato.
                  Il widget apparirà in basso a destra.
                </p>
              </div>

              {/* Widget iframe container */}
              {showWidget && (
                <iframe
                  src={`/widget/review?id=${widgetId}${triggerMode === 'auto' ? '&auto=true' : ''}`}
                  className="absolute inset-0 w-full h-full border-none"
                  style={{ background: 'transparent' }}
                />
              )}
            </div>

            {!showWidget && (
              <p className="text-gray-500 text-sm text-center mt-4">
                Clicca &quot;Carica Widget&quot; per iniziare il test
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">📋 Istruzioni Test</h2>
          <ol className="space-y-2 text-gray-300 list-decimal list-inside">
            <li>Inserisci un Widget ID (usa &quot;demo-widget&quot; per test)</li>
            <li>Seleziona la modalità trigger (manuale o automatico)</li>
            <li>Clicca &quot;Carica Widget&quot; per caricare lo script</li>
            <li>Se manuale, clicca &quot;Mostra Widget&quot; per aprirlo</li>
            <li>Testa le varie opzioni di feedback</li>
            <li>Usa &quot;Reset Stato&quot; per ripetere il test</li>
          </ol>
        </div>
      </div>
    </div>
  );
}