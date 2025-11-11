'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Shield, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 bg-off-white">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Trust Badges */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5">
                <Shield className="w-3 h-3 mr-1" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="border-muted-gray/30 text-muted-gray">
                SOC 2 Type II
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-charcoal leading-tight mb-6">
              Chatbot che rispondono davvero ai clienti
            </h1>

            <p className="text-lg text-muted-gray leading-relaxed mb-8 max-w-xl">
              Addestra con i tuoi contenuti, integra in 5 minuti, traccia risultati reali.
              Niente codice, niente setup complesso.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth/register">
                <Button size="lg" className="bg-emerald hover:bg-emerald/90 text-white px-8 h-12 text-base">
                  Prova gratis 14 giorni
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal text-charcoal hover:bg-charcoal hover:text-white px-8 h-12 text-base"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Guarda demo
                </Button>
              </Link>
            </div>

            {/* Social Proof Bullets */}
            <div className="flex flex-col gap-2 text-sm text-muted-gray">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald" />
                <span>Nessuna carta di credito richiesta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald" />
                <span>Oltre 2.500 aziende attive</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald" />
                <span>Supporto in italiano</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Widget Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md mx-auto">
              {/* Mockup Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 bg-emerald rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">CS</span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">Assistente Clienti</p>
                  <p className="text-xs text-muted-gray">Sempre disponibile</p>
                </div>
              </div>

              {/* Mockup Messages */}
              <div className="py-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-emerald/10 rounded-full flex-shrink-0" />
                  <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-charcoal">
                      Ciao! Come posso aiutarti oggi?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="bg-emerald rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-white">
                      Quali sono i vostri orari di apertura?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-emerald/10 rounded-full flex-shrink-0" />
                  <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-charcoal">
                      Siamo aperti dal lunedì al venerdì, 9-18. Il sabato 9-13.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mockup Input */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald"
                    disabled
                  />
                  <button className="px-4 py-2 bg-emerald text-white rounded-xl">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-slate-200 p-4"
            >
              <p className="text-xs text-muted-gray mb-1">Tempo di risposta medio</p>
              <p className="text-2xl font-bold text-emerald">0.8s</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
