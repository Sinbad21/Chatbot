import { Navbar } from '@/components/landing/Navbar';
import { Pricing, Footer } from '@/components/landing';
import { AddOnsModulesSection } from '@/components/pricing/AddOnsModulesSection';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <Suspense fallback={null}>
            <Pricing />
          </Suspense>

          <AddOnsModulesSection />

          {/* Additional Pricing Info */}
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need a custom plan?</h3>
            <p className="text-muted-foreground mb-6">
              We offer custom enterprise plans with dedicated support, SLA guarantees, and
              volume discounts. Contact our sales team to discuss your needs.
            </p>
            <Button size="lg" className="bg-[#5B4BFF] hover:bg-[#4B3BEF]">
              Contact Sales
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">Billing FAQ</h3>
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">How is usage calculated?</h4>
                <p className="text-muted-foreground">
                  Each message (user input + bot response) counts as one message. API calls
                  also count towards your monthly limit.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your account settings.
                  You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. For
                  enterprise plans, we also offer invoicing and wire transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            {'  '}
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

