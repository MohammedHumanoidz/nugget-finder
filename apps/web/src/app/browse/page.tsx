import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseServerClient from "@/components/BrowseServerClient";
import { Loader2 } from "lucide-react";
import { serverTRPC } from "@/lib/server-trpc";

async function getInitialData() {
  try {
    // Fetch initial data in parallel
    const [initialIdeas, initialLimits] = await Promise.all([
      serverTRPC.getIdeas({ limit: 12, offset: 0 }),
      serverTRPC.getUserLimits().catch(() => null), // Don't fail if user not authenticated
    ]);
    
    return {
      initialIdeas: initialIdeas || [],
      initialLimits,
    };
  } catch (error) {
    console.error("Error fetching initial browse data:", error);
    return {
      initialIdeas: [],
      initialLimits: null,
    };
  }
}

export const metadata: Metadata = {
  title: "Discover AI Startup Ideas",
  description:
    "Explore validated AI startup ideas with market research, competitor insights, and practical next steps.",
  alternates: { canonical: "/browse" },
};

export default async function BrowsePage() {
  const { initialIdeas, initialLimits } = await getInitialData();

  return (
    <div className="min-h-screen bg-background">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading ideas...</p>
            </div>
          </div>
        }
      >
        <BrowseServerClient 
          initialIdeas={initialIdeas}
          initialLimits={initialLimits}
        />
      </Suspense>
    </div>
  );
}