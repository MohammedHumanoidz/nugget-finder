/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
import IdeaDetailsView from "@/components/IdeaDetailsView";
import Navbar from "@/components/Navbar";
import ClientFallback from "@/components/ClientFallback";
import type { IdeaDetailsViewProps } from "@/types/idea-details";
import { notFound } from "next/navigation";
import { getIdeaById, generateStaticParams } from "@/lib/server-api";

// Export generateStaticParams for static generation
export { generateStaticParams };

// Server component with SSR
export default async function NuggetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params in Next.js 15
  const { id } = await params;
  
  // Fetch data server-side with caching
  const idea = await getIdeaById(id);

  if (!idea) {
    // Try client-side fallback before showing 404
    console.log('No server data for nugget, using client fallback');
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ClientFallback type="nugget" nuggetId={id} />
      </div>
    );
  }

  // Type assertion to match the expected prop type
  const ideaWithFullData = idea as unknown as IdeaDetailsViewProps['idea'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <IdeaDetailsView idea={ideaWithFullData} />
    </div>
  );
}