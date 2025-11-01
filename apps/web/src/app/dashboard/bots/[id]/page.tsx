import BotDetailClient from './BotDetailClient';

// Generate static params for dynamic route - returns empty array for client-side only rendering
export async function generateStaticParams() {
  return [];
}

export default function BotDetailPage() {
  return <BotDetailClient />;
}
