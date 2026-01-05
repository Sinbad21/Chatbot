import './globals.css';
import type { Metadata } from 'next';
import { LenisProvider } from '@/lib/lenis-provider';

export const metadata: Metadata = {
  title: 'Omnical Studio - AI Chatbot Platform',
  description: 'Build and deploy AI-powered chatbots in minutes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased smooth-scroll">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
