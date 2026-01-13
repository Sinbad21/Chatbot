'use client';

import Link from 'next/link';
import { Navbar } from '@/components/landing-v2/Navbar';
import { Footer } from '@/components/landing-v2/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/legal">
            <Button variant="ghost" size="sm" className="mb-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Legal
            </Button>
          </Link>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>

            <h2>1. What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device. They help websites work properly, improve security, and (when enabled) provide analytics.
            </p>

            <h2>2. Cookies we use</h2>
            <h3>Essential cookies</h3>
            <p>
              These cookies are required for core functionality such as authentication, session management, and security.
            </p>

            <h3>Consent cookie</h3>
            <p>
              We store your choice in a cookie (e.g. <code>cookie_consent</code>) so we can remember your preferences.
            </p>

            <h3>Optional cookies</h3>
            <p>
              If we use analytics or other optional cookies, we only enable them after you provide consent.
            </p>

            <h2>3. Managing preferences</h2>
            <p>
              You can change your browser settings to block or delete cookies. Note that blocking essential cookies may prevent you from logging in or using parts of the service.
            </p>

            <h2>4. Related policies</h2>
            <ul>
              <li>
                <Link href="/legal/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/legal/terms">Terms of Service</Link>
              </li>
            </ul>

            <h2>5. Contact</h2>
            <p>
              For questions about cookies and privacy, contact: <code>privacy@chatbot-studio.com</code>
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
