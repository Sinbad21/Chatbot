// Import the client component
import BotDetailClient from './BotDetailClient';

// Server component that exports generateStaticParams
export function generateStaticParams() {
  // Return empty array - pages will be rendered client-side on demand
  return [];
}

export default function BotDetailPage() {
  return <BotDetailClient />;
}
