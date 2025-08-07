import { serverTRPC } from "@/lib/server-trpc";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import MinedNuggetDetailsView from "@/components/MinedNuggetDetailsView";

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

interface MinedNuggetPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for this page
export async function generateMetadata({ params }: MinedNuggetPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const idea = await serverTRPC.getGeneratedIdeaById({ ideaId: id });
    if (!idea) {
      return {
        title: "Mined Nugget Not Found | NuggetFinder.io",
      };
    }

    const title = idea.title || 'Untitled Mined Nugget';
    const description = idea.description || idea.executiveSummary || 'Your personally generated startup idea.';

    return {
      title: `${title} | Your Mined Nuggets - NuggetFinder.io`,
      description,
    };
  } catch (error) {
    console.error('Error generating metadata for mined nugget:', error);
    return {
      title: "Mined Nugget | NuggetFinder.io",
    };
  }
}

export default async function MinedNuggetDetailPage({ params }: MinedNuggetPageProps) {
  const { id } = await params;
  
  try {
    const idea = await serverTRPC.getGeneratedIdeaById({ ideaId: id });
    
    if (!idea) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <RedirectToSignIn/>
        <MinedNuggetDetailsView idea={idea} />
      </div>
    );
  } catch (error) {
    console.error('Error loading mined nugget:', error);
    notFound();
  }
} 