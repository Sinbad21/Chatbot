'use client';

import Link from 'next/link';
import { Navbar } from '@/components/landing-v2/Navbar';
import { Footer } from '@/components/landing-v2/Footer';
import { Card } from '@/components/ui/card';

export default function LegalIndexPage() {
  const items = [
    {
      title: 'Privacy Policy',
      description: 'How we collect and use personal data.',
      href: '/legal/privacy',
    },
    {
      title: 'Terms of Service',
      description: 'Rules and conditions for using the service.',
      href: '/legal/terms',
    },
    {
      title: 'GDPR',
      description: 'Your GDPR rights and our compliance statement.',
      href: '/legal/gdpr',
    },
    {
      title: 'Cookie Policy',
      description: 'What cookies we use and how consent works.',
      href: '/legal/cookies',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Legal</h1>
          <p className="text-muted-foreground mb-10">Find our policies and compliance information.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <Card className="p-6 h-full hover:border-primary/50 transition-colors">
                  <div className="text-lg font-semibold mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
