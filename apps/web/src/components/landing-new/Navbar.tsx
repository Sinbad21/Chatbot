'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
    isScrolled
      ? 'bg-platinum-950/80 backdrop-blur-md border-b border-platinum-800 py-4'
      : 'bg-transparent py-6'
  }`;

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <Diamond className="w-6 h-6 text-platinum-200 group-hover:text-white transition-colors duration-500" />
          <span className="text-xl md:text-2xl font-serif font-bold text-platinum-100 tracking-widest uppercase group-hover:text-white transition-colors duration-500">
            Chatbot Studio
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Chi Siamo', 'Servizi', 'Prezzi'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm font-medium text-platinum-300 hover:text-white transition-colors duration-300 uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </a>
          ))}
          <Link
            href="/auth/login"
            className="relative group px-6 py-2 border border-platinum-400 text-platinum-100 hover:text-platinum-900 transition-all duration-300 rounded-sm uppercase text-xs tracking-widest font-bold overflow-hidden bg-transparent hover:bg-platinum-100 active:scale-95 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            <span className="relative z-10">Accedi</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-platinum-100 active:scale-90 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-platinum-900 border-b border-platinum-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {['Home', 'Chi Siamo', 'Servizi', 'Prezzi'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-platinum-200 hover:text-white text-lg font-serif border-b border-platinum-800/50 pb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link
                href="/auth/login"
                className="text-platinum-200 hover:text-white text-lg font-serif"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accedi
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
