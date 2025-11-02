import { Suspense } from 'react';
import BotDetailsClient from './BotDetailsClient';

export default function BotPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-800 font-medium">Loading bot details...</div>
      </div>
    }>
      <BotDetailsClient />
    </Suspense>
  );
}
