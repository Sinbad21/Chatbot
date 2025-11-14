'use client';

import { use } from 'react';
import { StandaloneBookingWidget } from '@/components/booking/StandaloneBookingWidget';
import { I18nProvider, LanguageSelector } from '@/lib/i18n/I18nProvider';

interface BookingPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { connectionId } = use(params);

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <StandaloneBookingWidget connectionId={connectionId} />
      </div>
    </I18nProvider>
  );
}
