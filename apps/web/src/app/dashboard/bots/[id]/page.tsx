// Server component that exports generateStaticParams
export function generateStaticParams() {
  // Return empty array - pages will be rendered client-side on demand
  return [];
}

// Import and render the client component
import BotDetailClient from './BotDetailClient';

export default function BotDetailPage() {
  return <BotDetailClient />;
}
