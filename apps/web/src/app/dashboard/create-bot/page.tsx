'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Preset templates for different languages
const getPresets = (lang: string) => {
  const isItalian = lang === 'it';
  
  return {
    welcomeMessages: isItalian ? [
      { label: 'Saluto generico', value: 'Ciao! Come posso aiutarti oggi?' },
      { label: 'Supporto clienti', value: 'Benvenuto! Sono qui per aiutarti con qualsiasi domanda o problema.' },
      { label: 'Vendite', value: 'Ciao! Sono qui per aiutarti a trovare la soluzione perfetta per te. Di cosa hai bisogno?' },
      { label: 'Supporto tecnico', value: 'Ciao! Descrivi il problema tecnico che stai riscontrando e ti aiuterò a risolverlo.' },
      { label: 'FAQ', value: 'Ciao! Fai una domanda e risponderò usando la documentazione disponibile.' },
      { label: 'E-commerce', value: 'Benvenuto nel nostro negozio! Posso aiutarti a trovare prodotti o rispondere a domande sui tuoi ordini.' },
    ] : [
      { label: 'Generic greeting', value: 'Hi! How can I help you today?' },
      { label: 'Customer support', value: 'Welcome! I\'m here to help you with any questions or issues.' },
      { label: 'Sales', value: 'Hello! I\'m here to help you find the perfect solution. What are you looking for?' },
      { label: 'Technical support', value: 'Hi! Describe the technical issue you\'re experiencing and I\'ll help you resolve it.' },
      { label: 'FAQ', value: 'Hi! Ask me anything and I\'ll answer from the available documentation.' },
      { label: 'E-commerce', value: 'Welcome to our store! I can help you find products or answer questions about your orders.' },
    ],
    systemPrompts: isItalian ? [
      {
        label: 'Assistente generale',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Rispondi breve e completo.
- Vai dritto al punto.
- Niente ripetizioni.
- Nessuna opinione non richiesta.
- Nessuna invenzione o deduzione.
- Se non sai → dillo.
- Se non è possibile rispondere → dillo in 1 frase e chiudi.
- Se richiesta ambigua → 1 domanda mirata.
- Se l'utente chiede più cose → elenco numerato.
- Se risposta completa → chiudi.
- Se cambia tema → chiedi conferma.

OBIETTIVO
- Dare risposte chiare e immediate.`
      },
      {
        label: 'Supporto clienti',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Risposte brevi e dirette.
- Niente ripetizioni.
- Tono neutro e professionale.
- Nessuna opinione non richiesta.
- Nessuna invenzione o deduzione.
- Se non sai → dillo.
- Se info vaghe → 1 domanda mirata.
- Max 1–2 domande.
- Mai dati sensibili.
- Non inventare politiche aziendali.
- Se non risolvibile → indirizza al canale corretto.
- Se mancano info → dillo, spiega cosa serve e perché.
- Se risolto → chiudi.

OBIETTIVO
- Risolvere nel minor numero di messaggi.`
      },
      {
        label: 'Vendite',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Breve e diretto.
- Tono professionale.
- Nessuna spiegazione inutile.
- Nessuna opinione non richiesta.
- Nessuna invenzione o deduzione.
- Se l'utente è vago → 1 domanda mirata.
- Se mancano dati minimi (budget, uso, priorità) → 1 domanda prima di proporre.
- Proponi 1–3 soluzioni.
- Mai promettere disponibilità o tempi non forniti.

OGNI RISPOSTA DEVE AVERE
- Proposta concreta
- Prossimo passo chiaro

OBIETTIVO
- Capire il bisogno reale e proporre soluzioni utili.`
      },
      {
        label: 'Supporto tecnico',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Diretto.
- Nessuna ripetizione.
- Nessuna invenzione o deduzione.
- Se non sai → dillo.
- Se info vaghe → 1 domanda mirata.

STRUTTURA
1. Frase di riassunto problema.
2. Soluzioni in passi numerati.

CHIEDI SOLO
- Ambiente
- Errore
- Passi per riprodurre

ALTRE REGOLE
- Non proporre fix senza capire il problema.
- Se errore sconosciuto → dichiaralo.
- Se complesso → supporto umano.
- Chiudi con prossimo step.`
      },
      {
        label: 'FAQ/Knowledge Base',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Breve e diretto.
- Nessuna deduzione.
- Nessuna invenzione.
- Usa solo info fornite.
- Se info mancante → dillo chiaramente e indica dove trovarla.
- Non dare risposte parziali.

OBIETTIVO
- Fornire risposte certe basate solo su dati disponibili.`
      },
      {
        label: 'E-commerce',
        value: `PRIORITÀ
1. Chiarezza
2. Utilità
3. Velocità

REGOLE
- Risposte brevi.
- Tono professionale.
- Niente ripetizioni.
- Nessuna opinione non richiesta.
- Nessuna invenzione o deduzione.
- Se info vaghe → 1 domanda mirata.

GESTISCI
- Prodotti
- Ordini
- Resi/rimborsi
- Spedizioni

REGOLE OPERATIVE
- Numero ordine solo se serve.
- Mai dati sensibili.
- Ordine non trovato → chiedi solo ID o email.
- Prodotto non disponibile → 1–2 alternative.
- Spiega il motivo (esaurito, fine serie, ecc.) solo se noto.
- Chiudi sempre con azione chiara.`
      },
    ]: [
      { 
        label: 'General assistant', 
        value: 'You are a helpful and friendly AI assistant. Respond concisely and clearly. If you don\'t know something, say so honestly.' 
      },
      { 
        label: 'Customer support', 
        value: `You are a customer support assistant.

GOAL
- Resolve the user's issue end-to-end with minimal back-and-forth.

RULES
- Ask only necessary questions (1-2 at a time).
- Never request passwords or sensitive data.
- If info is missing, say so and propose next steps.` 
      },
      { 
        label: 'Sales', 
        value: `You are a sales assistant.

GOAL
- Understand the need and propose 1-3 suitable options.
- Qualify with short questions.
- Offer a clear next step (demo/call/quote).

STYLE
- Professional but friendly.
- Don't be pushy.` 
      },
      { 
        label: 'Technical support', 
        value: `You are a technical support assistant.

RULES
- Use numbered troubleshooting steps.
- Ask for minimal details (environment, error, repro steps).
- Summarize and propose the next action.
- If the issue is complex, suggest contacting human support.` 
      },
      { 
        label: 'FAQ/Knowledge Base', 
        value: `You are an FAQ assistant.

PRIMARY RULE
- Answer using only the provided knowledge base. Do not guess.

IF UNSURE
- Say clearly that you don't have enough information and suggest next steps.` 
      },
      { 
        label: 'E-commerce', 
        value: `You are an e-commerce assistant.

YOU CAN HELP WITH
- Product search
- Order status
- Returns and refunds
- Shipping and delivery

RULES
- Ask for order number for specific inquiries.
- Suggest alternatives if a product is unavailable.
- Be proactive in suggesting related products.` 
      },
    ],
  };
};

export default function NewBotPage() {
  const { t, currentLang } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcomePresets, setShowWelcomePresets] = useState(false);
  const [showSystemPresets, setShowSystemPresets] = useState(false);
  
  const presets = getPresets(currentLang);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: presets.systemPrompts[0].value,
    welcomeMessage: presets.welcomeMessages[0].value,
    color: '#6366f1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(t('createBot.configError'));
      }

      const response = await fetch(`${apiUrl}/api/v1/bots`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.upgradeRequired) {
          throw new Error(data.message || t('createBot.botLimitReached'));
        }
        throw new Error(data.error || t('createBot.failedToCreate'));
      }

      const bot = await response.json();
      router.push('/dashboard/bots');
    } catch (err: any) {
      setError(err.message || t('createBot.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  const selectWelcomePreset = (value: string) => {
    setFormData({ ...formData, welcomeMessage: value });
    setShowWelcomePresets(false);
  };

  const selectSystemPreset = (value: string) => {
    setFormData({ ...formData, systemPrompt: value });
    setShowSystemPresets(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard/bots"
          className="text-sm text-charcoal hover:text-charcoal font-medium transition-colors"
        >
          {t('createBot.backToBots')}
        </Link>
      </div>

      <div className="glass-effect border border-silver-200/70 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">{t('createBot.title')}</h1>
        <p className="text-silver-600 mb-8">
          {t('createBot.subtitle')}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bot Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.botName')}
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.botNamePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.descriptionPlaceholder')}
            />
          </div>

          {/* Welcome Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-silver-600">
                {t('createBot.welcomeMessage')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWelcomePresets(!showWelcomePresets)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {t('createBot.usePreset') || 'Use preset'}
                  <ChevronDown size={14} className={`transition-transform ${showWelcomePresets ? 'rotate-180' : ''}`} />
                </button>
                {showWelcomePresets && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowWelcomePresets(false)} />
                    <div className="absolute right-0 mt-1 w-64 bg-white border border-silver-200 rounded-lg shadow-lg py-1 z-20 max-h-60 overflow-y-auto">
                      {presets.welcomeMessages.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectWelcomePreset(preset.value)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-pearl-100 transition-colors"
                        >
                          <span className="font-medium text-charcoal">{preset.label}</span>
                          <p className="text-xs text-silver-600 truncate mt-0.5">{preset.value}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <textarea
              id="welcomeMessage"
              rows={2}
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.welcomeMessagePlaceholder')}
            />
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.welcomeMessageHelp')}
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-silver-600">
                {t('createBot.systemPrompt')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSystemPresets(!showSystemPresets)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {t('createBot.usePreset') || 'Use preset'}
                  <ChevronDown size={14} className={`transition-transform ${showSystemPresets ? 'rotate-180' : ''}`} />
                </button>
                {showSystemPresets && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSystemPresets(false)} />
                    <div className="absolute right-0 mt-1 w-72 bg-white border border-silver-200 rounded-lg shadow-lg py-1 z-20 max-h-72 overflow-y-auto">
                      {presets.systemPrompts.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectSystemPreset(preset.value)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-pearl-100 transition-colors border-b border-silver-100 last:border-0"
                        >
                          <span className="font-medium text-charcoal">{preset.label}</span>
                          <p className="text-xs text-silver-600 line-clamp-2 mt-0.5">{preset.value.substring(0, 80)}...</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <textarea
              id="systemPrompt"
              rows={4}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.systemPromptPlaceholder')}
            />
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.systemPromptHelp')}
            </p>
          </div>

          {/* Bot Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.botColor')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-20 border border-silver-200/70 rounded-lg cursor-pointer bg-pearl-50"
              />
              <span className="text-sm text-silver-600">{formData.color}</span>
            </div>
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.colorWillBeUsed')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 font-medium transition-all shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('createBot.creating') : t('createBot.createBot')}
            </button>
            <Link
              href="/dashboard/bots"
              className="px-6 py-3 border border-silver-200/70 text-silver-700 rounded-lg hover:bg-pearl-100/60 font-medium text-center transition-all"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


