'use client';

import Link from 'next/link';
import { Command, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
                 <Command size={14} />
              </div>
              <span className="text-lg font-bold text-white">Axiom<span className="font-normal text-slate-400">Studio</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Empowering enterprises with autonomous neural intelligence.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" className="text-slate-500 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="text-slate-500 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" className="text-slate-500 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
             <h4 className="text-white font-semibold mb-6">Product</h4>
             <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="/#integrations" className="hover:text-indigo-400 transition-colors">Integrations</Link></li>
                <li><Link href="/#enterprise" className="hover:text-indigo-400 transition-colors">Enterprise</Link></li>
                <li><Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-semibold mb-6">Company</h4>
             <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-semibold mb-6">Legal</h4>
             <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/gdpr" className="hover:text-indigo-400 transition-colors">Cookie Policy</Link></li>
             </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Axiom Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
             All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
