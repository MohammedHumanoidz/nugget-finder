"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Lightbulb, Target, TrendingUp } from "lucide-react";
import AnimatedSearchLoader from "@/components/AnimatedSearchLoader";
import { toast } from "sonner";

interface ResultsClientProps {
  requestId: string;
}

export default function ResultsClient({ requestId }: ResultsClientProps) {
  const router = useRouter();
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // Poll for generation status
  const { data: generationStatus, error } = useQuery({
    ...trpc.ideas.getGenerationStatus.queryOptions({ requestId }),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === 'RUNNING' || data.status === 'PENDING') {
        return 1000; // Poll every 1 second during generation
      }
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        return false; // Stop polling when done
      }
      return 2000; // Default fallback
    },
    refetchIntervalInBackground: true,
    retry: 3,
  });

  // Fetch generated ideas when generation is complete
  const { data: ideas } = useQuery({
    ...trpc.ideas.getGeneratedIdeas.queryOptions({ limit: 10 }),
    enabled: generationStatus?.status === 'COMPLETED' && generatedIdeas.length === 0,
  });

  useEffect(() => {
    if (generationStatus?.status === 'COMPLETED' && ideas && generatedIdeas.length === 0) {
      // Filter ideas that were just generated based on timing
      const recentIdeas = ideas.filter((idea: any) => {
        const ideaTime = new Date(idea.createdAt).getTime();
        const requestTime = new Date(generationStatus.createdAt).getTime();
        return ideaTime >= requestTime - 60000; // Within 1 minute of request
      });
      setGeneratedIdeas(recentIdeas.slice(0, 3)); // Show only the latest 3
    }
  }, [generationStatus, ideas, generatedIdeas.length]);

  useEffect(() => {
    if (generationStatus?.status === 'FAILED') {
      toast.error(generationStatus.errorMessage || "Failed to generate ideas");
    }
  }, [generationStatus?.status, generationStatus?.errorMessage]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Results</h1>
          <p className="text-slate-400 mb-6">Unable to load generation status</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!generationStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const isGenerating = generationStatus.status === 'PENDING' || generationStatus.status === 'RUNNING';
  const isComplete = generationStatus.status === 'COMPLETED';
  const isFailed = generationStatus.status === 'FAILED';

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AnimatedSearchLoader 
              searchQuery="Generating your ideas..." 
              progressMessage={generationStatus.progressMessage ?? undefined}
              imageState={generationStatus.imageState ?? undefined}
              currentStep={generationStatus.currentStep ?? undefined}
            />
            <div className="mt-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">{generationStatus.currentStep}</h2>
              <p className="text-slate-400 text-lg">{generationStatus.progressMessage}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isFailed && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-red-400">Generation Failed</h2>
              <p className="text-slate-400 text-lg mb-6">
                {generationStatus.errorMessage || "Something went wrong while generating your ideas."}
              </p>
              <Button onClick={() => router.push("/")}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {isComplete && generatedIdeas.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                🎉 Your Business Ideas Are Ready!
              </h1>
              <p className="text-xl text-slate-400">
                Here are {generatedIdeas.length} high-potential opportunities tailored for you
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {generatedIdeas.map((idea: any, index: number) => (
                <Card key={idea.id} className="border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        Idea #{index + 1}
                      </Badge>
                      <div className="text-sm text-slate-400">
                        Score: {idea.confidenceScore}/100
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl leading-tight">
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-slate-300">Summary</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {idea.executiveSummary}
                        </p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Problem Statement */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-medium text-slate-300">Problem</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {idea.problemStatement}
                        </p>
                      </div>

                      {/* Tags */}
                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {idea.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-400"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 border-slate-600 hover:border-slate-500"
                        onClick={() => router.push(`/idea/${idea.id}`)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16 py-12 border-t border-slate-800">
              <h3 className="text-2xl font-bold mb-4">Want to explore more ideas?</h3>
              <p className="text-slate-400 mb-6">
                Discover thousands of validated business opportunities in our nugget collection
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push("/browse")}>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Browse All Nuggets
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/")}
                >
                  Generate More Ideas
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* No Ideas Generated */}
        {isComplete && generatedIdeas.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Generation Complete</h2>
              <p className="text-slate-400 text-lg mb-6">
                Your ideas were generated successfully, but we couldn't display them here.
                Check your dashboard to view them.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/dashboard")}>
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Generate More
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 