import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { serverTRPC } from "@/lib/server-trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, Lightbulb, Target, TrendingUp } from "lucide-react";

interface ResultsPageProps {
  searchParams: Promise<{
    ids?: string;
  }>;
}

async function GeneratedIdeasResults({ ideaIds }: { ideaIds: string[] }) {
  try {
    // Fetch all generated ideas by their IDs
    const ideas = await Promise.all(
      ideaIds.map(async (id: string) => {
        try {
          return await serverTRPC.getGeneratedIdeaById({ ideaId: id });
        } catch (error) {
          console.error(`Failed to fetch idea ${id}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed requests
    const validIdeas = ideas.filter(Boolean);

    if (validIdeas.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No valid ideas found.</p>
          <Button asChild className="mt-4">
            <Link href="/">Generate New Ideas</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">🎉 Your Golden Nuggets</h1>
          <p className="text-lg text-muted-foreground mt-2">
            We've mined {validIdeas.length} promising business opportunities for you
          </p>
          {validIdeas[0]?.prompt && (
            <p className="text-sm text-muted-foreground mt-1">
              Based on: "{validIdeas[0].prompt}"
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {validIdeas.map((idea: any, index: number) => (
            <Card key={idea.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <Badge variant="secondary">Idea #{index + 1}</Badge>
                  </div>
                  <Badge variant="outline">
                    Score: {idea.confidenceScore}/10
                  </Badge>
                </div>
                <CardTitle className="text-xl">{idea.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {idea.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Problem Statement
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {idea.problemStatement}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Executive Summary
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {idea.executiveSummary}
                    </p>
                  </div>

                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                                             {idea.tags.slice(0, 3).map((tag: string) => (
                         <Badge key={tag} variant="outline" className="text-xs">
                           {tag}
                         </Badge>
                       ))}
                      {idea.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{idea.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/browse/results/${idea.id}`}>
                        View Full Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-8">
          <div className="space-x-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Generate More Ideas
              </Link>
            </Button>
            <Button asChild>
              <Link href="/browse">Browse All Ideas</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching generated ideas:", error);
    return (
      <div className="text-center py-12">
        <p className="text-lg text-destructive">Failed to load your ideas.</p>
        <Button asChild className="mt-4">
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    );
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-16 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-18" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { ids } = await searchParams;

  if (!ids) {
    notFound();
  }

  const ideaIds = ids.split(',').filter(Boolean);

  if (ideaIds.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<LoadingSkeleton />}>
        <GeneratedIdeasResults ideaIds={ideaIds} />
      </Suspense>
    </div>
  );
} 