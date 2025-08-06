import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { serverTRPC } from "@/lib/server-trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Lightbulb, Target, TrendingUp, DollarSign } from "lucide-react";

interface IdeaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function GeneratedIdeaDetail({ ideaId }: { ideaId: string }) {
  try {
    const idea = await serverTRPC.getGeneratedIdeaById({ ideaId });

    if (!idea) {
      notFound();
    }

    const fullData = idea.fullIdeaData || {};

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/browse/results">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Link>
            </Button>
            <Badge variant="secondary">Generated Idea</Badge>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{idea.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Based on: "{idea.prompt}"</span>
              <Badge variant="outline">Score: {idea.confidenceScore}/10</Badge>
              <span>Generated: {new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag: string, index: number) => (
              <Badge key={`tag-${tag}-${index.toString()}`} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="competitive">Competitive</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Problem Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{idea.problemStatement}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{idea.executiveSummary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Narrative Hook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{idea.narrativeHook}</p>
                </CardContent>
              </Card>

              {fullData.scoring && (
                <Card>
                  <CardHeader>
                    <CardTitle>Idea Scoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Score:</span>
                        <Badge variant="outline">{fullData.scoring.totalScore}/100</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Problem Severity:</span>
                          <span>{fullData.scoring.problemSeverity}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Timing:</span>
                          <span>{fullData.scoring.marketTimingScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Technical Feasibility:</span>
                          <span>{fullData.scoring.technicalFeasibility}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monetization Potential:</span>
                          <span>{fullData.scoring.monetizationPotential}/10</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {fullData.trends ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {fullData.trends.title}
                  </CardTitle>
                  <CardDescription>
                    Strength: {fullData.trends.trendStrength}/10 | 
                    Urgency: {fullData.trends.timingUrgency}/10 | 
                    Type: {fullData.trends.catalystType?.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{fullData.trends.description}</p>
                  {fullData.trends.supportingData && fullData.trends.supportingData.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Supporting Data:</h4>
                      <div className="space-y-1">
                        {fullData.trends.supportingData.slice(0, 5).map((data: any, index: number) => (
                          <div key={`support-${index.toString()}`} className="text-sm p-2 bg-muted rounded">
                            {typeof data === 'string' ? data : JSON.stringify(data)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground">No trend data available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            {fullData.competitive ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Competition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">Market Concentration:</h4>
                        <Badge variant="outline">{fullData.competitive.competition?.marketConcentrationLevel}</Badge>
                        <p className="text-sm mt-1">{fullData.competitive.competition?.marketConcentrationJustification}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {fullData.competitive.positioning && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Strategic Positioning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-1">Target Segment:</h4>
                          <p className="text-sm">{fullData.competitive.positioning.targetSegment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Value Proposition:</h4>
                          <p className="text-sm">{fullData.competitive.positioning.valueProposition}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground">No competitive data available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="monetization" className="space-y-6">
            {fullData.monetization ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Monetization Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">Primary Model:</h4>
                        <p className="text-sm">{fullData.monetization.primaryModel}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Pricing Strategy:</h4>
                        <p className="text-sm">{fullData.monetization.pricingStrategy}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Business Score:</h4>
                        <Badge variant="outline">{fullData.monetization.businessScore}/10</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {fullData.monetization.revenueStreams && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Streams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fullData.monetization.revenueStreams.slice(0, 5).map((stream: any, index: number) => (
                          <div key={`revenue-${index.toString()}`} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{stream.name}</span>
                              <p className="text-xs text-muted-foreground">{stream.description}</p>
                            </div>
                            <Badge variant="outline">{stream.percentage}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground">No monetization data available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button asChild>
            <Link href="/">Generate More Ideas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/browse">Browse All Ideas</Link>
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching generated idea:", error);
    notFound();
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-18" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Suspense fallback={<LoadingSkeleton />}>
        <GeneratedIdeaDetail ideaId={id} />
      </Suspense>
    </div>
  );
} 