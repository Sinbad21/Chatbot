import BotDetailClient from './BotDetailClient';

// Generate static params - empty array means no pre-rendered pages
export async function generateStaticParams() {
  return [];
}

// Allow dynamic params for client-side rendering
export const dynamicParams = true;

export default function BotDetailPage() {
  return <BotDetailClient />;
}
