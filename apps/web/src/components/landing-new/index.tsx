'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Integrations } from './Integrations';
import { Services } from './Services';
import { Personas } from './Personas';
import { Training } from './Training';
import { Pricing } from './Pricing';
import { About } from './About';
import { Footer } from './Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen font-sans selection:bg-platinum-400 selection:text-platinum-900 bg-platinum-950 overflow-x-hidden">

      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-40 mix-blend-overlay"></div>

      {/* Subtle grid background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Integrations />
          <About />
          <Personas />
          <Services />
          <Training />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
