'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Integrations } from './Integrations';
import { Services } from './Services';
import { Personas } from './Personas';
import { Training } from './Training';
import { Pricing } from './Pricing';
import { About } from './About';
import { Footer } from './Footer';
import { ParticleCursor } from './ParticleCursor';

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();

  const yBg1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yBg2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.5, 0.2]);

  return (
    <div className="relative min-h-screen font-sans selection:bg-platinum-400 selection:text-platinum-900 bg-platinum-950 overflow-x-hidden">

      <ParticleCursor />

      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-40 mix-blend-overlay"></div>

      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <motion.div
            style={{ y: yBg1, opacity: opacityBg }}
            className="absolute -top-[30%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-b from-platinum-800/20 to-transparent blur-[120px]"
         />

         <motion.div
            style={{ y: yBg2, opacity: opacityBg }}
            className="absolute -bottom-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-t from-platinum-700/20 to-transparent blur-[100px]"
         />
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
