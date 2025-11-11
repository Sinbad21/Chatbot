'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    quote: 'Abbiamo ridotto del 60% le richieste al supporto. Il chatbot risponde con precisione e i clienti sono soddisfatti.',
    author: 'Marco Rossi',
    role: 'CEO',
    company: 'TechHub Italia',
    rating: 5,
  },
  {
    quote: 'Setup in meno di un pomeriggio. Ora gestiamo 200+ conversazioni al giorno senza assumere nuovo personale.',
    author: 'Laura Bianchi',
    role: 'Operations Manager',
    company: 'E-commerce Plus',
    rating: 5,
  },
  {
    quote: 'La dashboard ci mostra esattamente cosa chiedono i clienti. Abbiamo migliorato le FAQ e aumentato le conversioni.',
    author: 'Giuseppe Verdi',
    role: 'Marketing Director',
    company: 'SaaS Solutions',
    rating: 5,
  },
];

export function SocialProof() {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-charcoal mb-3"
          >
            Usato da oltre 2.500 aziende
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-gray"
          >
            Risultati reali da team che hanno adottato Chatbot Studio
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full border-slate-200 hover:shadow-lg transition-shadow">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-emerald text-emerald" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-charcoal leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                    <span className="text-emerald font-semibold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-gray">
                      {testimonial.role} @ {testimonial.company}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
