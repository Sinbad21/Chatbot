// Generate static params for the dynamic route
export async function generateStaticParams() {
  // Return empty array - pages will be generated on-demand via client-side routing
  return [];
}

export default function BotDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
