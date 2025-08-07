import { ArrowLeft, Calendar, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { serverTRPC } from "@/lib/server-trpc";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

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

function getConfidenceColor(score: number) {
  if (score >= 80) return "text-green-600 bg-green-100 border-green-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-100 border-yellow-200";
  return "text-red-600 bg-red-100 border-red-200";
}

export default async function MinedNuggetDetailPage({ params }: MinedNuggetPageProps) {
  const { id } = await params;
  
  try {
    const idea = await serverTRPC.getGeneratedIdeaById({ ideaId: id });
    
    if (!idea) {
      notFound();
    }

    // Parse the full idea data if available
    let fullIdeaData = null;
    if (idea.fullIdeaData) {
      fullIdeaData = idea.fullIdeaData;
    }

    return (
      <div className="min-h-screen bg-background">
        <RedirectToSignIn/>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/mined-nuggets">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Mined Nuggets
                </Link>
              </Button>
            </div>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  Generated on {new Date(idea.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  MINED NUGGET
                </Badge>
                <Badge className={`border ${getConfidenceColor(idea.confidenceScore)}`}>
                  {idea.confidenceScore}% confidence
                </Badge>
              </div>
            </div>

            {/* Original Prompt */}
            <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Lightbulb className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">Original Prompt</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground italic">
                  "{idea.prompt}"
                </p>
              </CardContent>
            </Card>

            {/* Tags */}
                         {idea.tags && idea.tags.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-6">
                 {idea.tags.map((tag: string) => (
                   <Badge key={`${idea.id}-${tag}`} variant="secondary">
                     {tag}
                   </Badge>
                 ))}
               </div>
             )}
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 gap-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {idea.description}
                </p>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            {idea.executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {idea.executiveSummary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Problem Statement */}
            {idea.problemStatement && (
              <Card>
                <CardHeader>
                  <CardTitle>Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Narrative Hook */}
            {idea.narrativeHook && (
              <Card>
                <CardHeader>
                  <CardTitle>Narrative Hook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {idea.narrativeHook}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Full Idea Data */}
            {fullIdeaData && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Market Opportunity */}
                    {fullIdeaData.marketOpportunity && (
                      <div>
                        <h4 className="font-semibold mb-2">Market Opportunity</h4>
                        <p className="text-muted-foreground text-sm">
                          {fullIdeaData.marketOpportunity.marketAnalysisSummary || 
                           "Market analysis data available"}
                        </p>
                      </div>
                    )}

                    {/* What to Build */}
                    {fullIdeaData.whatToBuild && (
                      <div>
                        <h4 className="font-semibold mb-2">What to Build</h4>
                        <p className="text-muted-foreground text-sm mb-2">
                          {fullIdeaData.whatToBuild.platformDescription}
                        </p>
                        {fullIdeaData.whatToBuild.coreFeaturesSummary && 
                         fullIdeaData.whatToBuild.coreFeaturesSummary.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Core Features:</p>
                                                         <ul className="text-xs text-muted-foreground space-y-1">
                               {fullIdeaData.whatToBuild.coreFeaturesSummary.map((feature: string) => (
                                 <li key={`${idea.id}-feature-${feature.slice(0, 20)}`}>• {feature}</li>
                               ))}
                             </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Revenue Model */}
                    {fullIdeaData.monetizationStrategy && (
                      <div>
                        <h4 className="font-semibold mb-2">Revenue Model</h4>
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Primary Model:</span> {fullIdeaData.monetizationStrategy.primaryModel}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Pricing Strategy:</span> {fullIdeaData.monetizationStrategy.pricingStrategy}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading mined nugget:', error);
    notFound();
  }
} 