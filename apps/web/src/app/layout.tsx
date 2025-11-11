import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chatbot Studio - AI Chatbot Platform',
  description: 'Build and deploy AI-powered chatbots in minutes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
