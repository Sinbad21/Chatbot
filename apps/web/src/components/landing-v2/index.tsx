import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ValueProps } from './ValueProps';
import { HowItWorks } from './HowItWorks';
import { Integrations } from './Integrations';
import { SocialProof } from './SocialProof';
import { Pricing } from './Pricing';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export default function LandingPageV2() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <HowItWorks />
        <Integrations />
        <SocialProof />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
