/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

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

const BadgeRow = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={`mb-8 flex gap-3 transition-all duration-700 ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}
  >
    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
      💎 High Purity
    </span>
    <span className="rounded-full bg-destructive/10 px-3 py-1 font-medium text-destructive text-sm">
      🔥 Prime Claim
    </span>
    <span className="rounded-full bg-chart-2/10 px-3 py-1 font-medium text-chart-2 text-sm">
      ⛏️ Ready to Mine
    </span>
    <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground text-sm">
      ✅ Assayed
    </span>
  </div>
);

export default function NuggetPage() {
  // Generate daily idea mutation
  const generateIdeaMutation = useMutation(
    trpc.agents.generateDailyIdea.mutationOptions({})
  );

  // Get the latest idea
  const { data: ideasResponse } = useQuery({
    ...trpc.agents.getDailyIdeas.queryOptions({ limit: 1, offset: 0 }),
    enabled: generateIdeaMutation.isSuccess || true, // Always try to fetch existing ideas
  });

  const latestIdea = ideasResponse?.ideas?.[0];
  const nuggetData = latestIdea ? transformDbToNugget(latestIdea) : null;
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
        {!nuggetData && !isLoading ? (
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
              {isLoading ? "Generating..." : "Generate Idea"}
            </Button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="mb-8">
              {isLoading ? (
                <div>
                  <LoadingSkeleton className="mb-4 h-10 w-3/4" />
                  <LoadingSkeleton className="h-6 w-1/2" />
                </div>
              ) : (
                <div
                  className={`transition-all duration-500 ${
                    nuggetData ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h1 className="mb-2 font-bold text-4xl">
                    {nuggetData?.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {nuggetData?.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Badge Row */}
            <BadgeRow isVisible={!!nuggetData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column - Main Content */}
              <div className="space-y-8 lg:col-span-2">
                {/* Prospector's Brief */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    Prospector's Brief
                  </h2>
                  {isLoading ? (
                    <div className="space-y-3">
                      <LoadingSkeleton className="h-4 w-full" />
                      <LoadingSkeleton className="h-4 w-5/6" />
                      <LoadingSkeleton className="h-4 w-4/5" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {nuggetData?.brief}
                    </p>
                  )}
                </section>
                {/* The Claim (Why Now?) */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    The Claim (Why Now?)
                  </h2>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted/50">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">
                            {nuggetData?.whyNow.title}
                          </h3>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary text-xs">
                            {nuggetData?.whyNow.catalystType.replace(/_/g, " ")}
                          </span>
                          <span className="rounded-full bg-chart-2/10 px-2 py-1 text-chart-2 text-xs">
                            Strength: {nuggetData?.whyNow.trendStrength}/10
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {nuggetData?.whyNow.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 font-medium text-sm">
                          Supporting Evidence:
                        </h4>
                        <ul className="space-y-2">
                          {nuggetData?.whyNow.supportingData.map((point) => (
                            <li key={point} className="flex items-start gap-2">
                              <span className="mt-1 text-primary">•</span>
                              <span className="text-muted-foreground text-sm">
                                {point}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </section>

                {/* The Vein (Market Gap) */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    The Vein (Market Gap)
                  </h2>
                  {isLoading ? (
                    <div className="space-y-3">
                      <LoadingSkeleton className="h-4 w-full" />
                      <LoadingSkeleton className="h-4 w-4/5" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted/50">
                        <h3 className="mb-2 font-semibold">
                          {nuggetData?.marketGap.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {nuggetData?.marketGap.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-1 font-medium text-sm">Impact</h4>
                          <p className="text-muted-foreground text-sm">
                            {nuggetData?.marketGap.impact}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium text-sm">Target</h4>
                          <p className="text-muted-foreground text-sm">
                            {nuggetData?.marketGap.target}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 font-medium text-sm">
                          Opportunity
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {nuggetData?.marketGap.opportunity}
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Extraction Plan */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    Extraction Plan
                  </h2>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ol className="space-y-3">
                      {nuggetData?.plan.map((phase, index) => (
                        <li key={phase} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{phase}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                {/* Competitive Landscape */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    Competitive Landscape
                  </h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-muted/50">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">
                            Market Concentration
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              nuggetData?.competition
                                .marketConcentrationLevel === "HIGH"
                                ? "bg-destructive/10 text-destructive"
                                : nuggetData?.competition
                                    .marketConcentrationLevel === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {nuggetData?.competition.marketConcentrationLevel}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {
                            nuggetData?.competition
                              .marketConcentrationJustification
                          }
                        </p>
                      </div>

                      {nuggetData?.competition.directCompetitors.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-semibold">
                            Direct Competitors
                          </h3>
                          <div className="space-y-3">
                            {nuggetData?.competition.directCompetitors.map(
                              (competitor) => (
                                <div
                                  key={competitor.name}
                                  className="rounded-lg border bg-background p-3"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {competitor.name}
                                    </h4>
                                  </div>
                                  <p className="mb-2 text-muted-foreground text-sm">
                                    {competitor.justification}
                                  </p>
                                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div>
                                      <span className="font-medium text-green-600 text-xs">
                                        Strengths:
                                      </span>
                                      <ul className="text-xs">
                                        {competitor.strengths.map(
                                          (strength) => (
                                            <li
                                              key={strength}
                                              className="text-muted-foreground"
                                            >
                                              • {strength}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="font-medium text-red-600 text-xs">
                                        Weaknesses:
                                      </span>
                                      <ul className="text-xs">
                                        {competitor.weaknesses.map(
                                          (weakness) => (
                                            <li
                                              key={weakness}
                                              className="text-muted-foreground"
                                            >
                                              • {weakness}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {nuggetData?.competition.unfairAdvantage.length > 0 && (
                        <div>
                          <h3 className="mb-2 font-semibold">
                            Your Unfair Advantages
                          </h3>
                          <ul className="space-y-1">
                            {nuggetData?.competition.unfairAdvantage.map(
                              (advantage) => (
                                <li
                                  key={advantage}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1 text-primary">⚡</span>
                                  <span className="text-muted-foreground text-sm">
                                    {advantage}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Revenue Model */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">Revenue Model</h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 font-semibold">Revenue Streams</h3>
                        <div className="space-y-3">
                          {nuggetData?.revenueStreams.map((stream) => (
                            <div
                              key={stream.name}
                              className="flex items-center justify-between gap-6 rounded-lg bg-muted/50 p-3"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{stream.name}</div>
                                <div className="text-muted-foreground text-sm">
                                  {stream.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  {stream.percentage}%
                                </div>
                                <div className="h-2 w-20 rounded-full bg-secondary">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${stream.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            CAC
                          </div>
                          <div className="font-bold text-xl">
                            {nuggetData?.valuation.cac}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            LTV
                          </div>
                          <div className="font-bold text-xl">
                            {nuggetData?.valuation.ltv}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            LTV:CAC
                          </div>
                          <div className="font-bold text-xl">
                            {nuggetData?.valuation.yieldRatio}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            Payback
                          </div>
                          <div className="font-bold text-xl">
                            {nuggetData?.valuation.paybackPeriod}mo
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Financial Projections */}
                <section className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 font-semibold text-xl">
                    Financial Projections
                  </h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      <LoadingSkeleton className="h-40 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="pb-2 text-left">Year</th>
                              <th className="pb-2 text-right">Revenue</th>
                              <th className="pb-2 text-right">Costs</th>
                              <th className="pb-2 text-right">Net Margin</th>
                              <th className="pb-2 text-right">Growth</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nuggetData?.financialProjections.map(
                              (projection) => (
                                <tr key={projection.year} className="border-b">
                                  <td className="py-2 font-medium">
                                    Year {projection.year}
                                  </td>
                                  <td className="py-2 text-right font-mono">
                                    ${(projection.revenue / 1000000).toFixed(1)}
                                    M
                                  </td>
                                  <td className="py-2 text-right font-mono">
                                    ${(projection.costs / 1000000).toFixed(1)}M
                                  </td>
                                  <td
                                    className={`py-2 text-right font-mono ${
                                      projection.netMargin >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {(projection.netMargin * 100).toFixed(0)}%
                                  </td>
                                  <td className="py-2 text-right font-mono">
                                    {projection.year === 1
                                      ? "-"
                                      : `${(
                                          projection.revenueGrowth * 100
                                        ).toFixed(0)}%`}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            Runway
                          </div>
                          <div className="font-bold text-lg">
                            {nuggetData?.valuation.runway} months
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground text-sm">
                            Break-even
                          </div>
                          <div className="font-bold text-lg">
                            {nuggetData?.valuation.breakEvenPoint}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="space-y-3 rounded-lg border bg-card p-6">
                  <Button className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Start Mining
                  </Button>
                  <Button variant={"outline"} className="w-full rounded-lg border border-border py-3 font-medium transition-colors hover:bg-accent">
                    Why Build This?
                  </Button>
                </div>

                {/* Claim Metadata */}
                <div className="space-y-4 rounded-lg border bg-card p-6">
                  <div>
                    <div className="font-medium text-muted-foreground text-sm">
                      Strategic Position
                    </div>
                    {isLoading ? (
                      <LoadingSkeleton className="mt-1 h-4 w-24" />
                    ) : (
                      <div className="font-medium">
                        {nuggetData?.positioning.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground text-sm">
                      Target Segment
                    </div>
                    {isLoading ? (
                      <LoadingSkeleton className="mt-1 h-4 w-32" />
                    ) : (
                      <div className="font-medium text-sm">
                        {nuggetData?.positioning.targetSegment}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground text-sm">
                      Overall Score
                    </div>
                    {isLoading ? (
                      <LoadingSkeleton className="mt-2 h-2 w-full" />
                    ) : (
                      <div className="mt-2">
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${nuggetData?.assay.totalScore}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-muted-foreground text-sm">
                          {nuggetData?.assay.totalScore}/100
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Innovation Level
                      </span>
                      <span className="font-medium">
                        {nuggetData?.meta.innovationLevel}/10
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Time to Market
                      </span>
                      <span className="font-medium">
                        {nuggetData?.meta.timeToMarket}/10
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Urgency Level
                      </span>
                      <span className="font-medium">
                        {nuggetData?.meta.urgencyLevel}/10
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Execution Complexity
                      </span>
                      <span className="font-medium">
                        {nuggetData?.meta.executionComplexity}/10
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Confidence Score
                      </span>
                      <span className="font-medium">
                        {nuggetData?.meta.confidenceScore}/10
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground text-sm">
                      Key Differentiators
                    </div>
                    {isLoading ? (
                      <div className="mt-2 space-y-1">
                        <LoadingSkeleton className="h-3 w-full" />
                        <LoadingSkeleton className="h-3 w-4/5" />
                      </div>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {nuggetData?.positioning.keyDifferentiators.map(
                          (diff, index) => (
                            <div
                              key={index}
                              className="text-muted-foreground text-sm"
                            >
                              • {diff}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground text-sm">
                      Value Proposition
                    </div>
                    {isLoading ? (
                      <LoadingSkeleton className="mt-1 h-12 w-full" />
                    ) : (
                      <div className="mt-1 text-muted-foreground text-sm leading-relaxed">
                        {nuggetData?.positioning.valueProposition}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Prompt */}
            <div className="mt-12 text-center">
              <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span>💬</span>
                  <span className="font-medium">
                    Interrogate this Nugget...
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="What's the 3rd idea about?"
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                    Ask
                  </Button>
                </div>
                <div className="mt-3 flex justify-center gap-2 text-sm">
                  <Button variant={"outline"}>Show me risks</Button>
                  <span className="text-muted-foreground">•</span>
                  <Button variant={"outline"}>Competitive analysis</Button>
                  <span className="text-muted-foreground">•</span>
                  <Button variant={"outline"}>Market size</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
