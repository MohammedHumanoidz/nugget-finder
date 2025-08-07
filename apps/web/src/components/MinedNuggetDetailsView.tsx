"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import NuggetChat from "./NuggetChat";

interface MinedNuggetData {
  id: string;
  userId: string;
  prompt: string;
  title: string;
  description: string;
  executiveSummary: string;
  problemStatement: string;
  narrativeHook: string;
  tags: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
  fullIdeaData: any;
}

interface MinedNuggetDetailsViewProps {
  idea: MinedNuggetData;
}

// Helper function to safely get nested data with defaults
const safeGet = (obj: any, path: string[], defaultValue: any = null) => {
  try {
    return path.reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

const MinedNuggetDetailsView: React.FC<MinedNuggetDetailsViewProps> = ({
  idea,
}) => {
  const [competitorTab, setCompetitorTab] = useState<"direct" | "indirect">(
    "direct"
  );

  const fullData = idea.fullIdeaData || {};

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to render bullet points
  const renderBulletPoints = (
    items: string[],
    emptyMessage = "Not specified"
  ) => {
    if (!items || items.length === 0)
      return (
        <span className="text-muted-foreground italic">{emptyMessage}</span>
      );
    return (
      <ul className="space-y-1 pl-4">
        {items.map((item) => (
          <li key={`bullet-${item}`} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  // Prepare radar chart data from scoring
  const scoring = safeGet(fullData, ["scoring"], {});
  const radarData = [
    { subject: "Problem Severity", value: scoring.problemSeverity || 0 },
    { subject: "Founder Market Fit", value: scoring.founderMarketFit || 0 },
    {
      subject: "Technical Feasibility",
      value: scoring.technicalFeasibility || 0,
    },
    {
      subject: "Monetization Potential",
      value: scoring.monetizationPotential || 0,
    },
    { subject: "Urgency Score", value: scoring.urgencyScore || 0 },
    { subject: "Market Timing", value: scoring.marketTimingScore || 0 },
    {
      subject: "Execution Difficulty",
      value: 10 - (scoring.executionDifficulty || 5),
    },
    { subject: "Moat Strength", value: scoring.moatStrength || 0 },
    { subject: "Regulatory Risk", value: 10 - (scoring.regulatoryRisk || 5) },
  ];

  // Prepare financial projections bar chart data
  const financialProjections = safeGet(
    fullData,
    ["monetization", "financialProjections"],
    []
  );
  const financialData = financialProjections.map((proj: any) => ({
    year: `Year ${proj.year}`,
    revenue: proj.revenue / 1000000,
    costs: proj.costs / 1000000,
    profit: (proj.revenue - proj.costs) / 1000000,
  }));

  // Mock data for the AI chat interface compatibility
  const chatIdea = {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    ideaScore: {
      totalScore: scoring.totalScore || idea.confidenceScore,
      problemSeverity: scoring.problemSeverity || 0,
      technicalFeasibility: scoring.technicalFeasibility || 0,
      monetizationPotential: scoring.monetizationPotential || 0,
      moatStrength: scoring.moatStrength || 0,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <a
          href="/mined-nuggets"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← Back to Mined Nuggets
        </a>
      </div>

      {/* Main Title Area */}
      <div className="max-w-7xl mx-auto px-4 pb-8 text-center">
        <div className="flex items-end justify-center mb-10">
          <Image src="/logo.webp" alt="Mined nugget" width={100} height={100} />
          <h1 className="font-bold text-amber-600 mb-6 ml-2 font-mono text-3xl">
            YOUR MINED NUGGET ⛏️
          </h1>
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-4">
          {idea.title}
        </h2>
        <div className="text-lg italic text-amber-600 mb-6 border-b-2 border-border pb-4 max-w-4xl mx-auto">
          "{idea.narrativeHook}"
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex gap-2 mt-4 items-center justify-center">
              <div className="flex gap-2 flex-wrap">
                {idea.tags.map((tag) => (
                  <span
                    key={`tag-${tag}`}
                    className="bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="text-base text-muted-foreground max-w-4xl mx-auto mb-8 text-left">
          {idea.description}
        </div>

        {/* Original Prompt Display */}
        <div className="flex gap-2 items-center justify-center max-w-4xl mx-auto mb-8 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            💡 Original Prompt:
            <span className="italic text-sm">"{idea.prompt}"</span>
          </h4>
        </div>

        {/* Badges */}
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          <span className="bg-amber-100 border border-amber-300 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            ⛏️ User Generated
          </span>
          <span className="bg-orange-100 border border-orange-300 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            🧠 AI Analyzed
          </span>
          <span className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            📈 {idea.confidenceScore}% Confidence
          </span>
        </div>

        {/* Generated Date */}
        <div className="text-sm text-muted-foreground">
          Generated on {new Date(idea.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <div className="flex-2 min-w-0 space-y-8">
            {/* Prospector's Brief */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                📖 Prospector's Brief
              </h3>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-foreground font-semibold mb-2">
                    Problem Statement:
                  </h4>
                  <p className="text-muted-foreground">
                    {idea.problemStatement}
                  </p>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold mb-2">
                    Executive Summary:
                  </h4>
                  <p className="text-muted-foreground">
                    {idea.executiveSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* The Claim (Why Now?) */}
            {fullData.trends && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                  🌟 The Claim (Why Now?)
                </h3>
                <div className="p-6 space-y-4">
                  <h4 className="text-foreground font-semibold">
                    {fullData.trends.title}
                  </h4>
                  <div className="bg-muted/50 border border-border p-4 rounded-lg flex justify-between items-center">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
                      {(fullData.trends.catalystType || "MARKET_SHIFT").replace(
                        /_/g,
                        " "
                      )}
                    </span>
                    <div className="flex gap-4 text-sm font-medium">
                      <span>
                        Strength: {fullData.trends.trendStrength || 0}/10
                      </span>
                      <span>
                        Urgency: {fullData.trends.timingUrgency || 0}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {fullData.trends.description}
                  </p>
                  {fullData.trends.supportingData &&
                    fullData.trends.supportingData.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold mb-2">
                          Supporting Evidence:
                        </h4>
                        {renderBulletPoints(fullData.trends.supportingData)}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Here's What You Should Build */}
            {fullData.whatToBuild && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                  🔧 Here's What You Should Build
                </h3>
                <div className="p-6 space-y-6">
                  {/* Platform Description */}
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">
                      Platform Overview:
                    </h4>
                    <p className="text-muted-foreground">
                      {fullData.whatToBuild.platformDescription}
                    </p>
                  </div>

                  {/* Core Features */}
                  {fullData.whatToBuild.coreFeaturesSummary &&
                    fullData.whatToBuild.coreFeaturesSummary.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold mb-3">
                          Core Features for MVP:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fullData.whatToBuild.coreFeaturesSummary.map(
                            (feature: string, index: number) => (
                              <div
                                key={`feature-${feature}`}
                                className="bg-muted/50 border border-border p-3 rounded-lg flex items-start gap-3"
                              >
                                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold min-w-fit">
                                  #{index + 1}
                                </div>
                                <span className="text-muted-foreground text-sm">
                                  {feature}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* User Interfaces */}
                  {fullData.whatToBuild.userInterfaces &&
                    fullData.whatToBuild.userInterfaces.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold mb-3">
                          Recommended User Interfaces:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullData.whatToBuild.userInterfaces.map(
                            (ui: string) => (
                              <span
                                key={`ui-${ui}`}
                                className="text-primary-foreground p-3 rounded-sm text-sm font-medium w-full"
                              >
                                🖥️ {ui}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Key Integrations */}
                  {fullData.whatToBuild.keyIntegrations &&
                    fullData.whatToBuild.keyIntegrations.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold mb-3">
                          Essential Third-Party Integrations:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullData.whatToBuild.keyIntegrations.map(
                            (integration: string) => (
                              <span
                                key={`integration-${integration}`}
                                className="text-primary-foreground p-3 rounded-sm text-sm font-medium w-full"
                              >
                                🔗 {integration}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Pricing Implementation */}
                  {fullData.whatToBuild.pricingStrategyBuildRecommendation && (
                    <div className="border border-border p-4 rounded-lg">
                      <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                        💳 Technical Pricing Implementation:
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {
                          fullData.whatToBuild
                            .pricingStrategyBuildRecommendation
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* The Vein (Market Gap) */}
            {fullData.problemGaps &&
              fullData.problemGaps.gaps &&
              fullData.problemGaps.gaps.length > 0 && (
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                    🗺️ The Vein (Market Gap)
                  </h3>
                  <div className="p-6 space-y-4">
                    {fullData.problemGaps.gaps.map((gap: any) => (
                      <div
                        key={`gap-${gap}`}
                        className="border-b border-border pb-4 last:border-b-0"
                      >
                        <h4 className="text-foreground font-semibold">
                          {gap.title}
                        </h4>
                        <p className="text-muted-foreground mb-2">
                          <strong>Description:</strong> {gap.description}
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong>Impact:</strong> {gap.impact}
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong>Target:</strong> {gap.target}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Opportunity:</strong> {gap.opportunity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Competitive Landscape */}
            {fullData.competitive && fullData.competitive.competition && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                  ⚔️ Competitive Landscape
                </h3>
                <div className="p-6 space-y-6">
                  <div className="bg-muted/50 border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-foreground font-semibold">
                        Market Concentration
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          fullData.competitive.competition
                            .marketConcentrationLevel === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : fullData.competitive.competition
                                  .marketConcentrationLevel === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {fullData.competitive.competition
                          .marketConcentrationLevel || "MEDIUM"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {
                        fullData.competitive.competition
                          .marketConcentrationJustification
                      }
                    </p>
                  </div>

                  {/* Competitor Tabs */}
                  <Tabs
                    value={competitorTab}
                    onValueChange={(value) =>
                      setCompetitorTab(value as "direct" | "indirect")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="direct">
                        Direct Competitors
                      </TabsTrigger>
                      <TabsTrigger value="indirect">
                        Indirect Competitors
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="direct" className="space-y-4">
                      {fullData?.competitive?.competition?.directCompetitors?.map(
                        (competitor: any) => (
                          <div
                            key={`direct-${competitor}`}
                            className="bg-muted/30 border border-border p-4 rounded-lg"
                          >
                            <h4 className="text-foreground font-semibold mb-2">
                              {competitor.name}
                            </h4>
                            <p className="text-muted-foreground text-sm mb-3">
                              {competitor.justification}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-green-700 font-semibold text-sm mb-2">
                                  Strengths:
                                </h5>
                                {renderBulletPoints(
                                  competitor.strengths,
                                  "No strengths listed"
                                )}
                              </div>
                              <div>
                                <h5 className="text-red-700 font-semibold text-sm mb-2">
                                  Weaknesses:
                                </h5>
                                {renderBulletPoints(
                                  competitor.weaknesses,
                                  "No weaknesses listed"
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </TabsContent>

                    <TabsContent value="indirect" className="space-y-4">
                      {fullData?.competitive?.competition?.indirectCompetitors?.map(
                        (competitor: any) => (
                          <div
                            key={`indirect-${competitor}`}
                            className="bg-muted/30 border border-border p-4 rounded-lg"
                          >
                            <h4 className="text-foreground font-semibold mb-2">
                              {competitor.name}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {competitor.justification}
                            </p>
                          </div>
                        )
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}

            {/* Monetization Strategy */}
            {fullData.monetization && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                  💰 Monetization Strategy
                </h3>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 border border-border p-4 rounded-lg">
                      <h4 className="text-foreground font-semibold mb-1">
                        Primary Model
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {fullData.monetization.primaryModel}
                      </p>
                    </div>
                    <div className="bg-muted/50 border border-border p-4 rounded-lg">
                      <h4 className="text-foreground font-semibold mb-1">
                        Pricing Strategy
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {fullData.monetization.pricingStrategy}
                      </p>
                    </div>
                  </div>

                  {/* Revenue Streams */}
                  {fullData.monetization.revenueStreams &&
                    fullData.monetization.revenueStreams.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold mb-3">
                          Revenue Stream Breakdown:
                        </h4>
                        <div className="space-y-3">
                          {fullData.monetization.revenueStreams.map(
                            (stream: any) => (
                              <div
                                key={`stream-${stream}`}
                                className="bg-muted/50 border border-border p-3 rounded-lg flex justify-between items-center"
                              >
                                <div>
                                  <span className="text-foreground font-semibold">
                                    {stream.name}
                                  </span>
                                  <p className="text-muted-foreground text-sm">
                                    {stream.description}
                                  </p>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
                                  {stream.percentage}%
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Key Metrics */}
                  {fullData.monetization.keyMetrics && (
                    <div>
                      <h4 className="text-foreground font-semibold mb-3">
                        Key Metrics:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-muted/50 border border-border p-3 rounded-lg text-center">
                          <div className="text-lg font-semibold text-primary">
                            {formatCurrency(
                              fullData.monetization.keyMetrics.ltv
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            LTV
                          </div>
                        </div>
                        <div className="bg-muted/50 border border-border p-3 rounded-lg text-center">
                          <div className="text-lg font-semibold text-primary">
                            {formatCurrency(
                              fullData.monetization.keyMetrics.cac
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CAC
                          </div>
                        </div>
                        <div className="bg-muted/50 border border-border p-3 rounded-lg text-center">
                          <div className="text-lg font-semibold text-primary">
                            {fullData.monetization.keyMetrics.ltvCacRatio}:1
                          </div>
                          <div className="text-xs text-muted-foreground">
                            LTV:CAC
                          </div>
                        </div>
                        <div className="bg-muted/50 border border-border p-3 rounded-lg text-center">
                          <div className="text-lg font-semibold text-primary">
                            {fullData.monetization.keyMetrics.paybackPeriod}mo
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Payback
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <p>
                          <strong>LTV:</strong>{" "}
                          {fullData.monetization.keyMetrics.ltvDescription}
                        </p>
                        <p>
                          <strong>CAC:</strong>{" "}
                          {fullData.monetization.keyMetrics.cacDescription}
                        </p>
                        <p>
                          <strong>LTV:CAC Ratio:</strong>{" "}
                          {
                            fullData.monetization.keyMetrics
                              .ltvCacRatioDescription
                          }
                        </p>
                        <p>
                          <strong>Payback Period:</strong>{" "}
                          {
                            fullData.monetization.keyMetrics
                              .paybackPeriodDescription
                          }
                        </p>
                        <p>
                          <strong>Runway:</strong>{" "}
                          {fullData.monetization.keyMetrics.runwayDescription}
                        </p>
                        <p>
                          <strong>Break-Even Point:</strong>{" "}
                          {
                            fullData.monetization.keyMetrics
                              .breakEvenPointDescription
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Execution & Validation */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">
                🛠️ Execution & Validation
              </h3>
              <div className="p-6 space-y-6">
                {fullData.executionPlan && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">
                      Execution Plan:
                    </h4>
                    <p className="text-muted-foreground">
                      {fullData.executionPlan}
                    </p>
                  </div>
                )}

                {fullData.tractionSignals && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">
                      Traction Signals:
                    </h4>
                    <p className="text-muted-foreground">
                      {fullData.tractionSignals}
                    </p>
                  </div>
                )}

                {fullData.frameworkFit && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">
                      Framework Fit:
                    </h4>
                    <p className="text-muted-foreground">
                      {fullData.frameworkFit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat-style Interrogate Section */}
            <NuggetChat idea={chatIdea as any} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="flex-1 w-full lg:max-w-sm space-y-6 sticky top-24">
            {/* Assay Report */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">
                📊 Summarized Report
              </h3>
              <div className="p-4 space-y-4">
                <div className="bg-muted/50 border border-border p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Opportunity</span>
                    <span>Feasibility</span>
                    <span>Defensibility</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-green-600">
                    <span>{scoring.monetizationPotential || 0}/10</span>
                    <span>{scoring.technicalFeasibility || 0}/10</span>
                    <span>{scoring.moatStrength || 0}/10</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>💡</span>
                    <span className="text-sm">
                      Innovation Level: {fullData.innovationLevel || 0}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>⏱️</span>
                    <span className="text-sm">
                      Time to Market: {fullData.timeToMarket || 0} months
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>🔥</span>
                    <span className="text-sm">
                      Urgency Level: {fullData.urgencyLevel || 0}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>🏗️</span>
                    <span className="text-sm">
                      Execution Complexity: {fullData.executionComplexity || 0}
                      /10
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>✅</span>
                    <span className="text-sm">
                      Confidence Score: {idea.confidenceScore}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Position */}
            {fullData.competitive && fullData.competitive.positioning && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">
                  🏆 Strategic Position
                </h3>
                <div className="p-4 space-y-3">
                  <h4 className="text-foreground font-semibold">
                    {fullData.competitive.positioning.name}
                  </h4>
                  <p className="text-sm">
                    <strong>Target Segment:</strong>{" "}
                    {fullData.competitive.positioning.targetSegment}
                  </p>
                  <p className="text-sm">
                    <strong>Value Proposition:</strong>{" "}
                    {fullData.competitive.positioning.valueProposition}
                  </p>
                </div>
              </div>
            )}

            {/* Key Differentiators */}
            {fullData.competitive &&
              fullData.competitive.positioning &&
              fullData.competitive.positioning.keyDifferentiators &&
              fullData.competitive.positioning.keyDifferentiators.length >
                0 && (
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">
                    ✨ Key Differentiators
                  </h3>
                  <div className="p-4">
                    {renderBulletPoints(
                      fullData.competitive.positioning.keyDifferentiators
                    )}
                  </div>
                </div>
              )}

            {/* Idea Score Radar Chart */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">
                📊 IDEA SCORE RADAR CHART
              </h3>
              <div className="p-4 space-y-4">
                <div className="text-center bg-muted/50 border border-border text-primary p-3 rounded-lg">
                  <strong>
                    Overall Idea Score:{" "}
                    {scoring.totalScore || idea.confidenceScore}/100
                  </strong>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Problem Severity:</span>
                    <span>{scoring.problemSeverity || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Founder Market Fit:</span>
                    <span>{scoring.founderMarketFit || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Technical Feasibility:</span>
                    <span>{scoring.technicalFeasibility || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Monetization Potential:</span>
                    <span>{scoring.monetizationPotential || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Urgency Score:</span>
                    <span>{scoring.urgencyScore || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Market Timing Score:</span>
                    <span>{scoring.marketTimingScore || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Execution Difficulty:</span>
                    <span>{scoring.executionDifficulty || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Moat Strength:</span>
                    <span>{scoring.moatStrength || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regulatory Risk:</span>
                    <span>{scoring.regulatoryRisk || 0}</span>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg min-h-[300px]">
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "#ea580c" },
                    }}
                    className="h-[280px]"
                  >
                    <RadarChart
                      data={radarData}
                      className="w-fit scale-90 -ml-10 lg:-ml-20"
                    >
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 10 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fontSize: 8 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        className=""
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinedNuggetDetailsView;
