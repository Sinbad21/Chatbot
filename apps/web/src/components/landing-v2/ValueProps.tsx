'use client';

import { motion } from 'framer-motion';
import { FileText, Zap, BarChart3 } from 'lucide-react';

const values = [
  {
    icon: FileText,
    title: 'Addestra con i tuoi contenuti',
    description: 'Carica PDF, DOCX, URL o testo. Il chatbot impara dalla tua documentazione e risponde con informazioni accurate.',
  },
  {
    icon: Zap,
    title: 'Integra ovunque in 5 minuti',
    description: 'Widget pronto per sito web, WhatsApp, Telegram, Slack. Copia-incolla il codice e sei online.',
  },
  {
    icon: BarChart3,
    title: 'Misura i risultati reali',
    description: 'Dashboard con conversazioni, lead acquisiti, domande frequenti e tasso di risoluzione. Niente metriche inutili.',
  },
];

export function ValueProps() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center group-hover:bg-emerald/20 transition-colors">
                  <value.icon className="w-6 h-6 text-emerald" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3 leading-tight">
                {value.title}
              </h3>
              <p className="text-muted-gray leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
