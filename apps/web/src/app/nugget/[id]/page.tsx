/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import IdeaDetailsView from "@/components/IdeaDetailsView";
import Navbar from "@/components/Navbar";
import type { IdeaDetailsViewProps } from "@/types/idea-details";

export default function NuggetDetailPage({ params }: { params: { id: string } }) {
  // Get specific idea by ID
  const { data: idea, isLoading } = useQuery({
    ...trpc.agents.getIdeaById.queryOptions({ id: params.id }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"/>
            <p className="mt-4 text-muted-foreground">Loading nugget details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Nugget Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              The nugget you're looking for doesn't exist or has been removed.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Home
            </a>
          </div>
        </div>
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