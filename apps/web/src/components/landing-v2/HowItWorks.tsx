'use client';

import { motion } from 'framer-motion';
import { Upload, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Carica i contenuti',
    description: 'Importa documenti, FAQ, pagine web. Il sistema estrae e indicizza tutto automaticamente.',
    image: '📄',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configura il comportamento',
    description: 'Scegli tono, lingua, istruzioni personalizzate. Puoi anche limitare le risposte a specifici argomenti.',
    image: '⚙️',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Pubblica e monitora',
    description: 'Integra con un widget o API. Vedi conversazioni, esporta lead, migliora le risposte nel tempo.',
    image: '🚀',
  },
];

export function HowItWorks() {
  return (
    <section id="features" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-charcoal mb-4"
          >
            Come funziona
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-gray max-w-2xl mx-auto"
          >
            Tre passaggi per avere un chatbot operativo. Niente setup tecnico, niente complessità.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="mb-6 mt-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-emerald" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-charcoal mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-gray leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative Emoji */}
                <div className="mt-6 text-4xl opacity-20">
                  {step.image}
                </div>
              </div>

              {/* Arrow Connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-emerald/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
