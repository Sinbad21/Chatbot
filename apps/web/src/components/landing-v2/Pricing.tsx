'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    description: 'Per provare e piccoli progetti',
    priceMonthly: 29,
    priceYearly: 24,
    features: [
      '1 chatbot',
      '500 messaggi/mese',
      'Widget sito web',
      'Dashboard base',
      'Supporto email',
    ],
    cta: 'Inizia gratis',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'Per team e aziende in crescita',
    priceMonthly: 99,
    priceYearly: 82,
    features: [
      '5 chatbot',
      '5.000 messaggi/mese',
      'Tutte le integrazioni',
      'Analytics avanzate',
      'API access',
      'Supporto prioritario',
      'Brand personalizzato',
    ],
    cta: 'Inizia gratis',
    highlighted: true,
    badge: 'Più popolare',
  },
  {
    name: 'Enterprise',
    description: 'Per organizzazioni con esigenze specifiche',
    priceMonthly: null,
    priceYearly: null,
    features: [
      'Chatbot illimitati',
      'Messaggi illimitati',
      'Deployment dedicato',
      'SLA garantito',
      'Onboarding personalizzato',
      'Account manager dedicato',
      'Contratto personalizzato',
    ],
    cta: 'Contattaci',
    highlighted: false,
  },
];

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-charcoal mb-4"
          >
            Prezzi semplici, nessun costo nascosto
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-gray mb-8"
          >
            Prova gratis per 14 giorni, nessuna carta richiesta
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 p-1 bg-slate-100 rounded-xl"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-muted-gray hover:text-charcoal'
              }`}
            >
              Mensile
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-muted-gray hover:text-charcoal'
              }`}
            >
              Annuale
              <span className="ml-2 text-xs text-emerald font-semibold">-15%</span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={`p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? 'border-emerald shadow-xl ring-2 ring-emerald/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-white">
                    {plan.badge}
                  </Badge>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-charcoal mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-gray">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.priceMonthly ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-charcoal">
                        €{billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                      </span>
                      <span className="text-muted-gray">/mese</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-charcoal">Contattaci</div>
                  )}
                  {billingCycle === 'yearly' && plan.priceYearly && (
                    <p className="text-xs text-muted-gray mt-1">
                      Fatturato annualmente (€{plan.priceYearly * 12})
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link href={plan.priceMonthly ? '/auth/register' : '#contact'} className="mb-6">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-emerald hover:bg-emerald/90 text-white'
                        : 'bg-charcoal hover:bg-charcoal/90 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Features */}
                <div className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="text-sm text-charcoal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-gray">
            Tutti i piani includono 14 giorni di prova gratuita.{' '}
            <Link href="/pricing" className="text-emerald hover:underline font-medium">
              Confronta tutte le feature →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
