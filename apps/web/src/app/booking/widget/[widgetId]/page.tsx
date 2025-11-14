'use client';

import { use } from 'react';
import { StandaloneBookingWidget } from '@/components/booking/StandaloneBookingWidget';
import { I18nProvider, LanguageSelector } from '@/lib/i18n/I18nProvider';

interface WidgetBookingPageProps {
  params: Promise<{
    widgetId: string;
  }>;
  searchParams: Promise<{
    locale?: string;
  }>;
}

export default function WidgetBookingPage({ params, searchParams }: WidgetBookingPageProps) {
  const { widgetId } = use(params);
  const { locale } = use(searchParams);

  return (
    <I18nProvider initialLocale={locale as any}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <StandaloneBookingWidget widgetId={widgetId} />
      </div>
    </I18nProvider>
  );
}
