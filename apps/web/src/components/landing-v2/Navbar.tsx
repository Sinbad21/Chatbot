'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-off-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-charcoal rounded-lg flex items-center justify-center">
              <span className="text-off-white font-bold text-sm">CB</span>
            </div>
            <span className="font-semibold text-charcoal text-lg">Chatbot Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-gray hover:text-charcoal transition-colors text-sm font-medium">
              Funzionalità
            </Link>
            <Link href="#pricing" className="text-muted-gray hover:text-charcoal transition-colors text-sm font-medium">
              Prezzi
            </Link>
            <Link href="/docs" className="text-muted-gray hover:text-charcoal transition-colors text-sm font-medium">
              Documentazione
            </Link>
            <Link href="#faq" className="text-muted-gray hover:text-charcoal transition-colors text-sm font-medium">
              FAQ
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-charcoal hover:bg-charcoal/5">
                Accedi
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-emerald hover:bg-emerald/90 text-white">
                Inizia gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-off-white border-b border-slate-200"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="#features" className="text-muted-gray hover:text-charcoal py-2 text-sm font-medium">
              Funzionalità
            </Link>
            <Link href="#pricing" className="text-muted-gray hover:text-charcoal py-2 text-sm font-medium">
              Prezzi
            </Link>
            <Link href="/docs" className="text-muted-gray hover:text-charcoal py-2 text-sm font-medium">
              Documentazione
            </Link>
            <Link href="#faq" className="text-muted-gray hover:text-charcoal py-2 text-sm font-medium">
              FAQ
            </Link>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Accedi
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full bg-emerald hover:bg-emerald/90 text-white">
                  Inizia gratis
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
