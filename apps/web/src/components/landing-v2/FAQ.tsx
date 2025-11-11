'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Serve conoscere programmazione per usare Chatbot Studio?',
    answer: 'No. L\'interfaccia è completamente visuale. Carichi i contenuti, configuri il comportamento e integri il widget con copia-incolla. Se vuoi usare le API, è disponibile la documentazione completa.',
  },
  {
    question: 'Quali lingue supporta il chatbot?',
    answer: 'Il chatbot può rispondere in oltre 20 lingue, inclusi italiano, inglese, spagnolo, francese e tedesco. Riconosce automaticamente la lingua dell\'utente e risponde di conseguenza.',
  },
  {
    question: 'Come funziona la prova gratuita?',
    answer: '14 giorni senza limitazioni. Puoi testare tutte le funzionalità del piano Professional. Nessuna carta di credito richiesta. Alla fine del periodo, puoi scegliere un piano o il chatbot verrà disattivato.',
  },
  {
    question: 'Posso usare i miei dati per addestrare il chatbot?',
    answer: 'Sì. Puoi caricare PDF, DOCX, TXT o fornire URL. I dati vengono elaborati e indicizzati per permettere risposte accurate. Tutti i contenuti rimangono privati e non vengono condivisi con altri clienti.',
  },
  {
    question: 'Il chatbot sostituisce il supporto umano?',
    answer: 'Il chatbot gestisce domande frequenti e richieste standard (circa 60-70% dei casi). Per richieste complesse, puoi configurare un handoff automatico verso il team umano tramite email o integrazione con strumenti di ticketing.',
  },
  {
    question: 'Posso cancellare in qualsiasi momento?',
    answer: 'Sì. Puoi cancellare il piano in qualsiasi momento dalla dashboard. Non ci sono vincoli o penali. I dati rimangono accessibili per 30 giorni dopo la cancellazione, poi vengono eliminati definitivamente.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-charcoal mb-4"
          >
            Domande frequenti
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-gray"
          >
            Tutto quello che devi sapere su Chatbot Studio
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-slate-200 rounded-xl px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-charcoal hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-gray leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-gray">
            Non trovi la risposta che cerchi?{' '}
            <a href="mailto:support@chatbotstudio.com" className="text-emerald hover:underline font-medium">
              Contatta il supporto
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
