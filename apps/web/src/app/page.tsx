/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NuggetData {
  title: string;
  summary: string;
  badges: string[];
  brief: string;
  assay: {
    opportunity: number;
    feasibility: number;
    defensibility: number;
    totalScore: number;
    problemSeverity: number;
    technicalFeasibility: number;
    monetizationPotential: number;
    moatStrength: number;
  };
  whyNow: {
    title: string;
    description: string;
    trendStrength: number;
    catalystType: string;
    supportingData: string[];
  };
  marketGap: {
    title: string;
    description: string;
    impact: string;
    target: string;
    opportunity: string;
  };
  plan: string[];
  valuation: {
    cac: string;
    ltv: string;
    yieldRatio: string;
    projectedRevenue: string;
    paybackPeriod: number;
    runway: number;
    breakEvenPoint: string;
  };
  financialProjections: Array<{
    year: number;
    revenue: number;
    costs: number;
    netMargin: number;
    revenueGrowth: number;
  }>;
  revenueStreams: Array<{
    name: string;
    description: string;
    percentage: number;
  }>;
  competition: {
    marketConcentrationLevel: string;
    marketConcentrationJustification: string;
    directCompetitors: Array<{
      name: string;
      justification: string;
      strengths: string[];
      weaknesses: string[];
    }>;
    indirectCompetitors: Array<{
      name: string;
      justification: string;
      strengths?: string[];
      weaknesses?: string[];
    }>;
    competitorFailurePoints: string[];
    unfairAdvantage: string[];
    moat: string[];
    competitivePositioningScore: number;
  };
  positioning: {
    name: string;
    targetSegment: string;
    valueProposition: string;
    keyDifferentiators: string[];
  };
  meta: {
    claimType: string;
    target: string;
    strength: number;
    rivals: string[];
    advantage: string;
    urgencyLevel: number;
    executionComplexity: number;
    innovationLevel: number;
    timeToMarket: number;
    confidenceScore: number;
  };
}

// Transform database response to NuggetPage format
const transformDbToNugget = (dbIdea: any): NuggetData => {
  // Handle execution plan - it's null in the response, so we need fallback
  const getExecutionPlan = () => {
    if (
      dbIdea.executionPlan?.phases &&
      Array.isArray(dbIdea.executionPlan.phases)
    ) {
      return dbIdea.executionPlan.phases.map(
        (phase: any) => phase.description || phase.title
      );
    }
    return [
      "MVP Development and Initial Market Testing",
      "Customer Acquisition and Product Refinement",
      "Scale Operations and Market Expansion",
    ];
  };

  // Handle competitive advantage
  const getAdvantage = () => {
    if (dbIdea.competitiveAdvantage?.description) {
      return dbIdea.competitiveAdvantage.description;
    }
    if (
      dbIdea.marketCompetition?.unfairAdvantage &&
      Array.isArray(dbIdea.marketCompetition.unfairAdvantage)
    ) {
      return (
        dbIdea.marketCompetition.unfairAdvantage[0] ||
        "First-to-market advantage"
      );
    }
    return "First-to-market advantage";
  };

  // Handle rivals
  const getRivals = () => {
    if (
      dbIdea.marketCompetition?.directCompetitors &&
      Array.isArray(dbIdea.marketCompetition.directCompetitors)
    ) {
      return dbIdea.marketCompetition.directCompetitors
        .slice(0, 3)
        .map((comp: any) => comp.name);
    }
    return ["TechCorp", "StartupX"];
  };

  return {
    title: dbIdea.title || "Untitled Startup Nugget",
    summary:
      dbIdea.executiveSummary ||
      dbIdea.description ||
      "AI-generated startup opportunity",
    badges: ["High Purity", "Prime Claim", "Ready to Mine", "Assayed"],
    brief:
      dbIdea.problemSolution ||
      dbIdea.description ||
      "Detailed analysis of the startup opportunity",
    assay: {
      opportunity: dbIdea.ideaScore?.problemSeverity || 85,
      feasibility: dbIdea.ideaScore?.technicalFeasibility || 78,
      defensibility: dbIdea.ideaScore?.moatStrength || 72,
      totalScore: dbIdea.ideaScore?.totalScore || 77,
      problemSeverity: dbIdea.ideaScore?.problemSeverity || 85,
      technicalFeasibility: dbIdea.ideaScore?.technicalFeasibility || 78,
      monetizationPotential: dbIdea.ideaScore?.monetizationPotential || 82,
      moatStrength: dbIdea.ideaScore?.moatStrength || 72,
    },
    whyNow: {
      title: dbIdea.whyNow?.title || "Market Timing",
      description:
        dbIdea.whyNow?.description ||
        "Market conditions are optimal for this opportunity",
      trendStrength: dbIdea.whyNow?.trendStrength || 8,
      catalystType: dbIdea.whyNow?.catalystType || "TECHNOLOGY_BREAKTHROUGH",
      supportingData: dbIdea.whyNow?.supportingData || [
        "Market timing is optimal",
        "Technology enablers are mature",
        "Customer pain points are intensifying",
      ],
    },
    marketGap: {
      title: dbIdea.marketGap?.title || "Market Opportunity",
      description:
        dbIdea.marketGap?.description ||
        "Identified market gap with significant opportunity",
      impact: dbIdea.marketGap?.impact || "High impact on target market",
      target: dbIdea.marketGap?.target || "Target market segment",
      opportunity: dbIdea.marketGap?.opportunity || "Large market opportunity",
    },
    plan: getExecutionPlan(),
    valuation: {
      cac: dbIdea.monetizationStrategy?.keyMetrics?.cac
        ? `$${dbIdea.monetizationStrategy.keyMetrics.cac}`
        : "$120",
      ltv: dbIdea.monetizationStrategy?.keyMetrics?.ltv
        ? `$${dbIdea.monetizationStrategy.keyMetrics.ltv}`
        : "$1,200",
      yieldRatio: dbIdea.monetizationStrategy?.keyMetrics?.ltvCacRatio
        ? `${dbIdea.monetizationStrategy.keyMetrics.ltvCacRatio}:1`
        : "10:1",
      projectedRevenue: dbIdea.monetizationStrategy?.financialProjections?.[0]
        ?.revenue
        ? `$${Math.round(
            dbIdea.monetizationStrategy.financialProjections[0].revenue / 1000
          )}K`
        : "$50K",
      paybackPeriod:
        dbIdea.monetizationStrategy?.keyMetrics?.paybackPeriod || 3,
      runway: dbIdea.monetizationStrategy?.keyMetrics?.runway || 36,
      breakEvenPoint:
        dbIdea.monetizationStrategy?.keyMetrics?.breakEvenPoint || "Month 24",
    },
    financialProjections: dbIdea.monetizationStrategy?.financialProjections || [
      {
        year: 1,
        revenue: 1200000,
        costs: 1800000,
        netMargin: -0.4,
        revenueGrowth: 0,
      },
      {
        year: 2,
        revenue: 4800000,
        costs: 3600000,
        netMargin: 0.25,
        revenueGrowth: 3,
      },
      {
        year: 3,
        revenue: 10000000,
        costs: 7000000,
        netMargin: 0.3,
        revenueGrowth: 2.08,
      },
    ],
    revenueStreams: dbIdea.monetizationStrategy?.revenueStreams || [
      {
        name: "Subscription Fees",
        description: "Monthly recurring revenue",
        percentage: 75,
      },
      {
        name: "Transaction Fees",
        description: "Per-transaction fees",
        percentage: 20,
      },
      {
        name: "Professional Services",
        description: "Implementation and support",
        percentage: 5,
      },
    ],
    competition: {
      marketConcentrationLevel:
        dbIdea.marketCompetition?.marketConcentrationLevel || "MEDIUM",
      marketConcentrationJustification:
        dbIdea.marketCompetition?.marketConcentrationJustification ||
        "Moderate market concentration",
      directCompetitors: dbIdea.marketCompetition?.directCompetitors || [],
      indirectCompetitors: dbIdea.marketCompetition?.indirectCompetitors || [],
      competitorFailurePoints:
        dbIdea.marketCompetition?.competitorFailurePoints || [],
      unfairAdvantage: dbIdea.marketCompetition?.unfairAdvantage || [],
      moat: dbIdea.marketCompetition?.moat || [],
      competitivePositioningScore:
        dbIdea.marketCompetition?.competitivePositioningScore || 7,
    },
    positioning: {
      name: dbIdea.strategicPositioning?.name || "Market Position",
      targetSegment:
        dbIdea.strategicPositioning?.targetSegment || "Target Market",
      valueProposition:
        dbIdea.strategicPositioning?.valueProposition || "Value proposition",
      keyDifferentiators: dbIdea.strategicPositioning?.keyDifferentiators || [],
    },
    meta: {
      claimType: dbIdea.strategicPositioning?.name || "B2B SaaS",
      target: dbIdea.strategicPositioning?.targetSegment || "SMB Market",
      strength: dbIdea.ideaScore?.totalScore || 78,
      rivals: getRivals(),
      advantage: getAdvantage(),
      urgencyLevel: dbIdea.urgencyLevel || 8,
      executionComplexity: dbIdea.executionComplexity || 7,
      innovationLevel: dbIdea.innovationLevel || 8,
      timeToMarket: dbIdea.timeToMarket || 9,
      confidenceScore: dbIdea.confidenceScore || 8,
    },
  };
};

const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-muted ${className}`} />
);


export default function HomePage() {
  const router = useRouter();
  
  // Generate daily idea mutation
  const generateIdeaMutation = useMutation(
    trpc.agents.generateDailyIdea.mutationOptions({
      onSuccess: (data) => {
        // Navigate to the new nugget detail page
        if (data?.ideaId) {
          router.push(`/nugget/${data.ideaId}`);
        }
      }
    })
  );

  // Get previous ideas for cards listing
  const { data: ideasResponse } = useQuery({
    ...trpc.agents.getDailyIdeas.queryOptions({ limit: 10, offset: 0 }),
    enabled: true,
  });

  const ideas = ideasResponse?.ideas || [];
  const isLoading = generateIdeaMutation.isPending;

  const handleGenerateIdea = () => {
    generateIdeaMutation.mutate({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⛏️</span>
              <span className="font-semibold text-lg">NuggetFinder.io</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Prospect
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Claims
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Vault
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Account
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="py-16 text-center">
          <h1 className="mb-4 font-bold text-4xl">
            Discover Your Next Startup Nugget
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            AI-powered startup idea discovery and validation
          </p>
          <Button
            onClick={handleGenerateIdea}
            disabled={isLoading}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate New Nugget"}
          </Button>
        </div>

        {/* Previous Nuggets Section */}
        {ideas.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-2xl">Previous Nuggets</h2>
              <p className="text-muted-foreground text-sm">{ideas.length} nuggets mined</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => {
                const nuggetData = transformDbToNugget(idea);
                return (
                  <Link key={idea.id} href={`/nugget/${idea.id}`}>
                    <div className="group cursor-pointer rounded-lg border bg-card p-6 transition-all duration-200 hover:border-primary hover:shadow-lg">
                      {/* Badges */}
                      <div className="mb-4 flex gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary text-xs">
                          💎 High Purity
                        </span>
                        <span className="rounded-full bg-destructive/10 px-2 py-1 text-destructive text-xs">
                          🔥 Prime
                        </span>
                      </div>

                      {/* Title & Summary */}
                      <h3 className="mb-2 font-semibold text-lg transition-colors group-hover:text-primary">
                        {nuggetData.title}
                      </h3>
                      <p className="line-clamp-3 mb-4 text-sm text-muted-foreground">
                        {nuggetData.summary}
                      </p>

                      {/* Metrics */}
                      <div className="mb-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="font-bold text-lg">{nuggetData.assay.opportunity}%</div>
                          <div className="text-muted-foreground text-xs">Opportunity</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{nuggetData.assay.feasibility}%</div>
                          <div className="text-muted-foreground text-xs">Feasibility</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{nuggetData.assay.totalScore}</div>
                          <div className="text-muted-foreground text-xs">Total Score</div>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="mb-4">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-muted-foreground">Overall Score</span>
                          <span className="font-medium">{nuggetData.assay.totalScore}/100</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${nuggetData.assay.totalScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{nuggetData.positioning.targetSegment}</span>
                        <span>{nuggetData.whyNow.catalystType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {ideas.length === 0 && !isLoading && (
          <div className="py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mb-4 text-4xl">⛏️</div>
              <h3 className="mb-2 font-semibold text-lg">No Nuggets Yet</h3>
              <p className="text-muted-foreground text-sm">
                Start your prospecting journey by generating your first startup nugget.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl">Generating New Nugget...</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex gap-2">
                    <LoadingSkeleton className="h-5 w-16" />
                    <LoadingSkeleton className="h-5 w-12" />
                  </div>
                  <LoadingSkeleton className="mb-2 h-6 w-3/4" />
                  <LoadingSkeleton className="mb-4 h-12 w-full" />
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <LoadingSkeleton className="h-8" />
                    <LoadingSkeleton className="h-8" />
                    <LoadingSkeleton className="h-8" />
                  </div>
                  <LoadingSkeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
