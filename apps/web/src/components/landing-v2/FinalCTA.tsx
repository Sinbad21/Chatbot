'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto a migliorare il supporto clienti?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Unisciti a oltre 2.500 aziende che usano Chatbot Studio per automatizzare le conversazioni e aumentare la soddisfazione dei clienti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-emerald hover:bg-emerald/90 text-white px-8 h-12">
                  Inizia la prova gratuita
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="mailto:sales@chatbotstudio.com?subject=Richiesta Demo">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-12">
                  Prenota una demo
                </Button>
              </a>
            </div>

            <p className="text-sm text-slate-400 mt-6">
              14 giorni gratis • Nessuna carta richiesta • Cancella quando vuoi
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
