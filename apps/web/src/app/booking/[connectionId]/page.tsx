'use client';

import { use } from 'react';
import { StandaloneBookingWidget } from '@/components/booking/StandaloneBookingWidget';

interface BookingPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { connectionId } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <StandaloneBookingWidget connectionId={connectionId} />
    </div>
  );
}
