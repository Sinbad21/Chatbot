'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: November 2025</p>

            <h2>1. Introduction</h2>
            <p>
              At Chatbot Studio ("we", "our", or "us"), we are committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>
              When you register for an account, we collect your email address, name, and
              password (encrypted). We may also collect billing information if you subscribe
              to a paid plan.
            </p>

            <h3>Usage Data</h3>
            <p>
              We collect information about how you use our service, including chat logs,
              document uploads, bot configurations, and analytics data.
            </p>

            <h3>Technical Data</h3>
            <p>
              We automatically collect certain technical information, including IP address,
              browser type, device information, and cookies.
            </p>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To process your transactions and send billing information</li>
              <li>To improve and optimize our service</li>
              <li>To communicate with you about updates and support</li>
              <li>To detect and prevent fraud and abuse</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              We use industry-standard encryption (AES-256) to protect your data at rest and
              in transit (TLS 1.3). Your data is stored on secure servers provided by Neon
              and Cloudflare in data centers compliant with SOC 2 Type II standards.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul>
              <li><strong>OpenAI</strong> - for AI model inference</li>
              <li><strong>Anthropic</strong> - for Claude model inference</li>
              <li><strong>Google</strong> - for Gemini model inference</li>
              <li><strong>Stripe</strong> - for payment processing</li>
              <li><strong>Cloudflare</strong> - for hosting and CDN</li>
              <li><strong>Neon</strong> - for database hosting</li>
            </ul>

            <h2>6. GDPR Compliance</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have the following
              rights under GDPR:
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at privacy@chatbot-studio.com
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to
              provide you with our services. You can delete your account and all associated
              data at any time from your account settings.
            </p>

            <h2>8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not
              use tracking or advertising cookies without your consent.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the "Last updated"
              date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@chatbot-studio.com</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
