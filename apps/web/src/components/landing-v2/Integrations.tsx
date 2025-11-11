'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Send, Slack, Globe } from 'lucide-react';

const integrations = [
  { name: 'WhatsApp', icon: MessageCircle },
  { name: 'Telegram', icon: Send },
  { name: 'Slack', icon: Slack },
  { name: 'Website Widget', icon: Globe },
  { name: 'WordPress', icon: Globe },
  { name: 'Shopify', icon: Globe },
];

export function Integrations() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-charcoal mb-3"
          >
            Integrazioni native
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-gray"
          >
            Connetti il chatbot ai canali che usi già
          </motion.p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald/30 hover:bg-emerald/5 transition-all group"
            >
              <integration.icon className="w-10 h-10 text-muted-gray group-hover:text-emerald transition-colors mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium text-charcoal text-center">
                {integration.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* API Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-gray">
            + API REST per integrazioni personalizzate
          </p>
        </motion.div>
      </div>
    </section>
  );
}
