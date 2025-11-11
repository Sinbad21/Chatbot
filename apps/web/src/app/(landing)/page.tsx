'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import {
  Hero,
  TrustBadges,
  ValueProps,
  DemoChat,
  Features,
  Integrations,
  Pricing,
  Testimonials,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';
import { useLandingTranslation } from '@/hooks/useLandingTranslation';

export default function LandingPage() {
  const { t } = useLandingTranslation();

  useEffect(() => {
    // Set meta tags dynamically based on language
    if (typeof window !== 'undefined') {
      document.title = t('meta.title');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('meta.description'));
      }
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Hero />
        <TrustBadges />
        <ValueProps />
        <DemoChat />
        <Features />
        <Integrations />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
