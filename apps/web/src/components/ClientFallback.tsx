"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import AnimatedHowItWorks from "@/components/AnimatedHowItWorks";
import StatsCards from "@/components/StatsCards";
import IdeaScoreBreakdown from "@/components/IdeaScoreBreakdown";

interface ClientFallbackProps {
  type: 'home' | 'nugget';
  nuggetId?: string;
}

export default function ClientFallback({ type, nuggetId }: ClientFallbackProps) {
  const { data: ideasResponse, isLoading: homeLoading, error: homeError } = useQuery({
    ...trpc.agents.getDailyIdeas.queryOptions({
      limit: 50,
      offset: 0
    }),
    enabled: type === 'home',
  });

  const { data: nuggetData, isLoading: nuggetLoading, error: nuggetError } = useQuery({
    ...trpc.agents.getIdeaById.queryOptions({ id: nuggetId! }),
    enabled: type === 'nugget' && !!nuggetId,
  });

  if (type === 'home') {
    const dailyIdeas = ideasResponse?.ideas || [];
    const featuredNugget = dailyIdeas[0];
    const otherNuggets = dailyIdeas.slice(1, 7);

    // Calculate market intelligence metrics
    const aiTrendsTracked = dailyIdeas.reduce((sum: number, idea: any) => {
      return sum + (idea.problemGaps?.problems?.length || 0);
    }, 0);
    
    const signalsAnalyzed = dailyIdeas.reduce((sum: number, idea: any) => {
      const whyNowData = idea.whyNow?.supportingData?.length || 0;
      const revenueStreams = idea.monetizationStrategy?.revenueStreams?.length || 0;
      const financialProjections = idea.monetizationStrategy?.financialProjections?.length || 0;
      return sum + whyNowData + revenueStreams + financialProjections;
    }, 0);
    
    const marketOpportunities = dailyIdeas.length;
    const activeUsers = 0;

    if (homeLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⛏️</div>
            <div className="text-xl font-semibold">Loading NuggetFinder.io...</div>
            <div className="text-muted-foreground">Mining fresh startup opportunities...</div>
          </div>
        </div>
      );
    }

    if (homeError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl font-semibold">Failed to load nuggets</div>
            <div className="text-muted-foreground">Please try refreshing the page</div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Hero Section - Nuggets Mined Today */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">🆕 NUGGETS MINED TODAY 🌟</h1>
            <div className="w-24 h-1 bg-primary mx-auto"/>
          </div>

          {featuredNugget && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{featuredNugget.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-green-600/10 border border-green-600 text-foreground px-3 py-1 rounded-full text-sm font-medium">✅ Unfair Advantage</span>
                  <span className="bg-purple-600/10 border border-purple-600 text-foreground px-3 py-1 rounded-full text-sm font-medium">✅ Product Ready</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {featuredNugget.description}
                </p>

                <StatsCards idea={featuredNugget} />
                <IdeaScoreBreakdown idea={featuredNugget} />
              </CardContent>
              
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/nugget/${featuredNugget.id}`}>Read Full Analysis →</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </section>

        {/* Rest of the sections would go here - Market Intelligence, etc. */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">Client-side fallback mode - Server data fetch failed</p>
        </div>
        
        <AnimatedHowItWorks />
      </>
    );
  }

  // Nugget detail fallback
  if (type === 'nugget') {
    if (nuggetLoading) {
      return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"/>
            <p className="mt-4 text-muted-foreground">Loading nugget details...</p>
          </div>
        </div>
      );
    }

    if (nuggetError || !nuggetData) {
      return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Nugget Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              The nugget you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className="text-center py-4 text-muted-foreground">Client-side fallback mode - Server data fetch failed</p>
        {/* IdeaDetailsView would go here */}
      </div>
    );
  }

  return null;
}