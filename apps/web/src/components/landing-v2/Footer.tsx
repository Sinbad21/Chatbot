'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="font-semibold text-lg">Chatbot Studio</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Chatbot intelligenti per aziende moderne.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" className="text-slate-400 hover:text-emerald transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-slate-400 hover:text-emerald transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-slate-400 hover:text-emerald transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Prodotto</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/#features" className="hover:text-white transition-colors">Funzionalità</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Prezzi</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentazione</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Azienda</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Chi siamo</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contatti</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Lavora con noi</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legale</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Termini di Servizio</Link></li>
              <li><Link href="/legal/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © 2025 Chatbot Studio. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Powered by</span>
            <span className="text-slate-300">Cloudflare</span>
            <span>•</span>
            <span className="text-slate-300">Neon</span>
            <span>•</span>
            <span className="text-slate-300">OpenAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
