'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: "Silver",
    price: "49",
    desc: "Per startup e piccoli business.",
    features: ["1 Chatbot Attivo", "Risposte Automatiche Base", "Supporto Email", "Integrazione Web"],
    highlight: false
  },
  {
    name: "Platino",
    price: "149",
    desc: "La scelta per l'eccellenza.",
    features: ["3 Chatbot Attivi", "AI Avanzata GPT-4", "Supporto Prioritario 24/7", "WhatsApp & Telegram", "Analisi del Sentiment"],
    highlight: true
  },
  {
    name: "Diamante",
    price: "299",
    desc: "Potenza illimitata.",
    features: ["Chatbot Illimitati", "Fine-Tuning Personalizzato", "API Access Completo", "Account Manager Dedicato", "SLA Garantito"],
    highlight: false
  }
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-32 bg-platinum-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-platinum-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Investi nel Futuro</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-platinum-400 to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-all duration-500 group hover:-translate-y-2 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-platinum-800/40 to-platinum-900/40 border-platinum-400/50 shadow-[0_0_50px_rgba(156,163,175,0.1)]'
                  : 'bg-platinum-900/20 border-platinum-800 hover:border-platinum-600'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-platinum-100 text-black px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1 shadow-lg">
                  <Sparkles size={12} /> Best Value
                </div>
              )}

              {plan.highlight && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                </div>
              )}

              <h3 className={`text-xl font-serif mb-2 ${plan.highlight ? 'text-white' : 'text-platinum-300'}`}>
                {plan.name}
              </h3>
              <p className="text-platinum-500 text-sm mb-6 h-10">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white">€{plan.price}</span>
                <span className="text-platinum-500">/mese</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-platinum-300">
                    <div className={`p-0.5 rounded-full ${plan.highlight ? 'bg-platinum-100 text-black' : 'bg-platinum-800 text-platinum-400'}`}>
                      <Check size={12} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className={`block w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden group/btn active:scale-95 text-center ${
                  plan.highlight
                    ? 'bg-platinum-100 text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]'
                    : 'border border-platinum-700 text-platinum-300 hover:border-platinum-400 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-platinum-800/50'
                }`}
              >
                 <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></span>
                <span className="relative z-10">Seleziona</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
