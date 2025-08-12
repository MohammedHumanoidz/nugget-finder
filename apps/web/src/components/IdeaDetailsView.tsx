"use client";

import {
  Bookmark,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MessageCircle,
  Send,
  Share,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import IdeaActions from "@/components/IdeaActions";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DirectCompetitor,
  IdeaDetailsViewProps,
  IndirectCompetitor,
} from "@/types/idea-details";
import NuggetChat from "./NuggetChat";
import Link from "next/link";

// Hero Section Component
const HeroSection: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="border-border border-b bg-gradient-to-br from-primary/5 via-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <a
            href="/"
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            ← Back to Nuggets
          </a>
        </div>

        {/* Main Hero Content */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-end justify-center">
            <Image
              src="/checkout-this-nugget.png"
              alt="Check this nugget"
              width={80}
              height={80}
            />
            <h1 className="mb-4 ml-3 font-bold font-mono text-2xl text-primary">
              OPPORTUNITY SUMMARY
            </h1>
          </div>

          <h2 className="mx-auto mb-4 max-w-4xl font-bold text-4xl text-foreground lg:text-5xl">
            {idea.title}
          </h2>

          <div className="mx-auto mb-6 max-w-3xl text-lg text-primary italic border-b-2 border-border pb-4">
            "{idea.narrativeHook}"
          </div>

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {idea.tags.map((tag, index) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted px-3 py-1 font-medium text-primary text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Key Metrics Row */}
          <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Confidence: <strong>{idea.confidenceScore}/10</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <span>
                Urgency: <strong>🔥 {idea.urgencyLevel}/10</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span>
                Complexity:{" "}
                <strong>Medium ({idea.executionComplexity}/10)</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={
                "https://www.builderbox.ai/?utm_source=nuggetfinder&utm_medium=referral&utm_campaign=detailpage"
              }
              target="_blank"
            >
              <Button variant="outline" size="sm">
                Start Building
              </Button>
            </Link>
            <IdeaActions
              ideaId={idea.id}
              isSaved={false}
              isClaimed={false}
              isClaimedByOther={false}
              size="sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Overview Component
const QuickOverview: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        📋 Quick Overview
      </h3>
      <div className="space-y-4 p-6">
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <Target className="h-4 w-4" />
            Problem:
          </h4>
          <p className="text-muted-foreground">{idea.problemStatement}</p>
        </div>

        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <CheckCircle className="h-4 w-4" />
            Solution:
          </h4>
          <p className="text-muted-foreground">
            {idea.executiveSummary || idea.problemSolution}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-border border-t pt-4 md:grid-cols-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="text-muted-foreground text-sm">LTV:CAC Ratio</span>
            <div className="font-semibold text-lg">
              {idea.monetizationStrategy.keyMetrics?.ltvCacRatio
                ? `${idea.monetizationStrategy.keyMetrics.ltvCacRatio}:1`
                : "3.5:1"}
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="text-muted-foreground text-sm">
              Payback Period
            </span>
            <div className="font-semibold text-lg">
              {idea.monetizationStrategy.keyMetrics?.paybackPeriod
                ? `${idea.monetizationStrategy.keyMetrics.paybackPeriod} months`
                : "12 months"}
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="text-muted-foreground text-sm">
              Time to Market
            </span>
            <div className="font-semibold text-lg">
              {idea.timeToMarket} months
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="text-muted-foreground text-sm">
              Innovation Level
            </span>
            <div className="font-semibold text-lg">
              {idea.innovationLevel}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Why This Matters Component
const WhyThisMatters: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate revenue potential from LTV if available
  const revenueValue = idea.monetizationStrategy.keyMetrics?.ltv
    ? formatCurrency(idea.monetizationStrategy.keyMetrics.ltv)
    : "$1M+";

  // Use actual time to market data
  const timeValue = idea.timeToMarket
    ? `${idea.timeToMarket} months`
    : "6 months";

  // Use trend strength as market timing indicator
  const marketTiming =
    idea.whyNow.trendStrength >= 8
      ? "High Growth"
      : idea.whyNow.trendStrength >= 6
        ? "Strong Trend"
        : "Emerging";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🌟 Why This Matters
      </h3>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 text-center dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
            <DollarSign className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <div className="font-bold text-green-700 text-lg dark:text-green-400">
              {revenueValue}
            </div>
            <div className="text-green-600 text-sm dark:text-green-300">
              {idea.monetizationStrategy.keyMetrics
                ? "Customer Lifetime Value"
                : "Revenue Potential"}
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
            <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <div className="font-bold text-blue-700 text-lg dark:text-blue-400">
              {timeValue}
            </div>
            <div className="text-blue-600 text-sm dark:text-blue-300">
              time to market
            </div>
          </div>

          <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-purple-600" />
            <div className="font-bold text-lg text-purple-700 dark:text-purple-400">
              {marketTiming}
            </div>
            <div className="text-purple-600 text-sm dark:text-purple-300">
              market timing ({idea.whyNow.trendStrength}/10)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detailed Overview Component
const DetailedOverview: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        📖 Detailed Overview
      </h3>
      <div className="p-6">
        <p className="text-muted-foreground leading-relaxed">
          {idea.description}
        </p>
      </div>
    </div>
  );
};

// The Claim (Why Now) Component
const TheClaimWhyNow: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
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
          <li key={item} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🌟 The Claim (Why Now?)
      </h3>
      <div className="p-6 space-y-4">
        <h4 className="text-foreground font-semibold">{idea.whyNow.title}</h4>
        <div className="bg-muted/50 border border-border p-4 rounded-lg flex justify-between items-center">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
            {idea.whyNow.catalystType.replace(/_/g, " ")}
          </span>
          <div className="flex gap-4 text-sm font-medium">
            <span>Strength: {idea.whyNow.trendStrength}/10</span>
            <span>Urgency: {idea.whyNow.timingUrgency}/10</span>
          </div>
        </div>
        <p className="text-muted-foreground">{idea.whyNow.description}</p>
        {idea.whyNow.supportingData &&
          idea.whyNow.supportingData.length > 0 && (
            <div>
              <h4 className="text-foreground font-semibold mb-2">
                Supporting Evidence:
              </h4>
              {renderBulletPoints(idea.whyNow.supportingData)}
            </div>
          )}
      </div>
    </div>
  );
};

// What to Build Component (Detailed)
const WhatToBuild: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
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
          <li key={item} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🔧 Here's What You Should Build
      </h3>
      <div className="space-y-6 p-6">
        {idea.whatToBuild && (
          <>
            {/* Platform Description */}
            <div>
              <h4 className="text-foreground font-semibold mb-2">
                Platform Overview:
              </h4>
              <p className="text-muted-foreground">
                {idea.whatToBuild.platformDescription}
              </p>
            </div>

            {/* Core Features */}
            {idea.whatToBuild.coreFeaturesSummary &&
              idea.whatToBuild.coreFeaturesSummary.length > 0 && (
                <div>
                  <h4 className="text-foreground font-semibold mb-3">
                    Core Features for MVP:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {idea.whatToBuild.coreFeaturesSummary.map(
                      (feature, index) => (
                        <div
                          key={`feature-${index.toString()}`}
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
            {idea.whatToBuild.userInterfaces &&
              idea.whatToBuild.userInterfaces.length > 0 && (
                <div>
                  <h4 className="text-foreground font-semibold mb-3">
                    Recommended User Interfaces:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.whatToBuild.userInterfaces.map((ui, index) => (
                      <span
                        key={`ui-${index.toString()}`}
                        className="bg-muted text-foreground p-3 rounded-sm text-sm font-medium w-full border border-border"
                      >
                        🖥️ {ui}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Key Integrations */}
            {idea.whatToBuild.keyIntegrations &&
              idea.whatToBuild.keyIntegrations.length > 0 && (
                <div>
                  <h4 className="text-foreground font-semibold mb-3">
                    Essential Third-Party Integrations:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.whatToBuild.keyIntegrations.map(
                      (integration, index) => (
                        <span
                          key={`integration-${index.toString()}`}
                          className="bg-muted text-foreground p-3 rounded-sm text-sm font-medium w-full border border-border"
                        >
                          🔗 {integration}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Pricing Implementation */}
            <div className="border border-border p-4 rounded-lg">
              <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                💳 Technical Pricing Implementation:
              </h4>
              <p className="text-muted-foreground text-sm">
                {idea.whatToBuild.pricingStrategyBuildRecommendation}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Execution Plan Component
const ExecutionPlan: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🛠️ Execution Plan
      </h3>
      <div className="space-y-4 p-6">
        {idea.executionPlan?.mvpDescription && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">
              MVP Strategy:
            </h4>
            <p className="text-muted-foreground">
              {idea.executionPlan.mvpDescription}
            </p>
          </div>
        )}

        <div>
          <h4 className="mb-3 font-semibold text-foreground">
            Step-by-Step Plan:
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Month 1-2:</strong> MVP Development & Core Features
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Month 3:</strong> Beta Testing & Platform Integrations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Month 4:</strong> Launch & Early Customer Acquisition
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
                4
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Month 5-6:</strong> Scale & Feature Expansion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Market Gap Component
const MarketGap: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🗺️ The Vein (Market Gap)
      </h3>
      <div className="p-6 space-y-4">
        <h4 className="text-foreground font-semibold">
          Title: {idea.marketGap.title}
        </h4>
        <p className="text-muted-foreground">
          <strong>Description:</strong> {idea.marketGap.description}
        </p>
        <p className="text-muted-foreground">
          <strong>Impact:</strong> {idea.marketGap.impact}
        </p>
        <p className="text-muted-foreground">
          <strong>Target:</strong> {idea.marketGap.target}
        </p>
        <p className="text-muted-foreground">
          <strong>Opportunity:</strong> {idea.marketGap.opportunity}
        </p>
      </div>
    </div>
  );
};

// Competitive Landscape Component
const CompetitiveLandscape: React.FC<{
  idea: IdeaDetailsViewProps["idea"];
}> = ({ idea }) => {
  const [competitorTab, setCompetitorTab] = useState<"direct" | "indirect">(
    "direct"
  );

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
          <li key={item} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
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
                idea.marketCompetition.marketConcentrationLevel === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : idea.marketCompetition.marketConcentrationLevel === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {idea.marketCompetition.marketConcentrationLevel}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {idea.marketCompetition.marketConcentrationJustification}
          </p>
        </div>

        {/* Competitor Tabs */}
        <Tabs
          value={competitorTab}
          onValueChange={(value) =>
            setCompetitorTab(value as "direct" | "indirect")
          }
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="text-foreground">
              Direct Competitors (
              {idea.marketCompetition.directCompetitors.length})
            </TabsTrigger>
            <TabsTrigger value="indirect" className="text-foreground">
              Indirect Competitors (
              {idea.marketCompetition.indirectCompetitors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-3">
            {idea.marketCompetition.directCompetitors.map(
              (competitor: DirectCompetitor, index: number) => (
                <div
                  key={`direct-${competitor.name}-${index}`}
                  className="bg-muted/30 border-l-4 border-border p-4 rounded-lg"
                >
                  <h5 className="text-foreground font-semibold mb-2">
                    • {competitor.name}
                  </h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    {competitor.justification}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitor.strengths &&
                      competitor.strengths.length > 0 && (
                        <div>
                          <span className="text-green-600 font-medium text-xs">
                            Strengths:
                          </span>
                          {renderBulletPoints(competitor.strengths)}
                        </div>
                      )}
                    {competitor.weaknesses &&
                      competitor.weaknesses.length > 0 && (
                        <div>
                          <span className="text-red-600 font-medium text-xs">
                            Weaknesses:
                          </span>
                          {renderBulletPoints(competitor.weaknesses)}
                        </div>
                      )}
                  </div>
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="indirect" className="space-y-3">
            {idea.marketCompetition.indirectCompetitors.map(
              (competitor: IndirectCompetitor, index: number) => (
                <div
                  key={`indirect-${competitor.name}-${index}`}
                  className="bg-muted/30 border-l-4 border-border p-4 rounded-lg"
                >
                  <h5 className="text-foreground font-semibold mb-2">
                    • {competitor.name}
                  </h5>
                  <p className="text-muted-foreground text-sm mb-2">
                    {competitor.justification}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitor.strengths &&
                      competitor.strengths.length > 0 && (
                        <div>
                          <span className="text-green-600 font-medium text-xs">
                            Strengths:
                          </span>
                          {renderBulletPoints(competitor.strengths)}
                        </div>
                      )}
                    {competitor.weaknesses &&
                      competitor.weaknesses.length > 0 && (
                        <div>
                          <span className="text-red-600 font-medium text-xs">
                            Weaknesses:
                          </span>
                          {renderBulletPoints(competitor.weaknesses)}
                        </div>
                      )}
                  </div>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Competitor Failure Points & Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {idea.marketCompetition.competitorFailurePoints &&
            idea.marketCompetition.competitorFailurePoints.length > 0 && (
              <div>
                <h4 className="text-foreground font-semibold mb-2">
                  Competitor Failure Points:
                </h4>
                {renderBulletPoints(
                  idea.marketCompetition.competitorFailurePoints
                )}
              </div>
            )}
          {idea.marketCompetition.unfairAdvantage &&
            idea.marketCompetition.unfairAdvantage.length > 0 && (
              <div>
                <h4 className="text-foreground font-semibold mb-2">
                  Our Unfair Advantages:
                </h4>
                {renderBulletPoints(idea.marketCompetition.unfairAdvantage)}
              </div>
            )}
        </div>

        {idea.marketCompetition.moat &&
          idea.marketCompetition.moat.length > 0 && (
            <div>
              <h4 className="text-foreground font-semibold mb-2">Moat:</h4>
              {renderBulletPoints(idea.marketCompetition.moat)}
            </div>
          )}
      </div>
    </div>
  );
};

// Revenue Model Component (Comprehensive)
const RevenueModel: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        💰 Revenue Model
      </h3>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Primary Model:</strong>{" "}
            {idea.monetizationStrategy.primaryModel}
          </p>
          <p className="text-sm">
            <strong>Pricing Strategy:</strong>{" "}
            {idea.monetizationStrategy.pricingStrategy}
          </p>
          <p className="text-sm">
            <strong>Revenue Model Validation:</strong>{" "}
            {idea.monetizationStrategy.revenueModelValidation}
          </p>
          <p className="text-sm">
            <strong>Pricing Sensitivity:</strong>{" "}
            {idea.monetizationStrategy.pricingSensitivity}
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <span>
            <strong>Business Score:</strong>{" "}
            {idea.monetizationStrategy.businessScore}/10
          </span>
          <span>
            <strong>Confidence:</strong> {idea.monetizationStrategy.confidence}
            /10
          </span>
        </div>

        {/* Revenue Streams */}
        {idea.monetizationStrategy.revenueStreams &&
          idea.monetizationStrategy.revenueStreams.length > 0 && (
            <div>
              <h4 className="text-foreground font-semibold mb-3">
                Revenue Streams:
              </h4>
              <div className="space-y-3">
                {idea.monetizationStrategy.revenueStreams.map(
                  (stream, index) => (
                    <div
                      key={`stream-${stream.name}-${index}`}
                      className="bg-muted/50 border border-border p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-green-600">
                            • {stream.name} ({stream.percentage}%)
                          </strong>
                          <p className="text-muted-foreground text-sm">
                            {stream.description}
                          </p>
                        </div>
                        <div className="w-20 h-2 bg-secondary rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${stream.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Key Metrics */}
        {idea.monetizationStrategy.keyMetrics && (
          <div>
            <h4 className="text-foreground font-semibold mb-3">Key Metrics:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                • <strong>LTV:</strong>{" "}
                {formatCurrency(idea.monetizationStrategy.keyMetrics.ltv)}
              </div>
              <div>
                • <strong>CAC:</strong>{" "}
                {formatCurrency(idea.monetizationStrategy.keyMetrics.cac)}
              </div>
              <div>
                • <strong>LTV:CAC Ratio:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.ltvCacRatio}:1
              </div>
              <div>
                • <strong>Payback Period:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.paybackPeriod} months
              </div>
              <div>
                • <strong>Runway:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.runway} months
              </div>
              <div>
                • <strong>Break-Even Point:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.breakEvenPoint}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>LTV:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.ltvDescription}
              </p>
              <p>
                <strong>CAC:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.cacDescription}
              </p>
              <p>
                <strong>LTV:CAC Ratio:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.ltvCacRatioDescription}
              </p>
              <p>
                <strong>Payback Period:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.paybackPeriodDescription}
              </p>
              <p>
                <strong>Runway:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.runwayDescription}
              </p>
              <p>
                <strong>Break-Even Point:</strong>{" "}
                {idea.monetizationStrategy.keyMetrics.breakEvenPointDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Execution & Validation Component
const ExecutionValidation: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
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
          <li key={item} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        🛠️ Execution & Validation
      </h3>
      <div className="p-6 space-y-6">
        {idea.executionPlan?.mvpDescription && (
          <div>
            <h4 className="text-foreground font-semibold mb-2">
              Execution Plan:
            </h4>
            <p className="text-muted-foreground">
              {idea.executionPlan.mvpDescription}
            </p>
          </div>
        )}

        {idea.tractionSignals?.earlyAdopterSignals &&
          idea.tractionSignals.earlyAdopterSignals.length > 0 && (
            <div>
              <h4 className="text-foreground font-semibold mb-2">
                Traction Signals:
              </h4>
              {renderBulletPoints(idea.tractionSignals.earlyAdopterSignals)}
            </div>
          )}

        {idea.frameworkFit?.innovationDilemmaFit && (
          <div>
            <h4 className="text-foreground font-semibold mb-2">
              Framework Fit:
            </h4>
            <p className="text-muted-foreground">
              {idea.frameworkFit.innovationDilemmaFit}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Call to Action Component
const CallToAction: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="rounded-lg border border-border bg-gradient-to-r from-primary/10 via-background to-primary/10 p-8 text-center">
      <h3 className="mb-4 font-bold text-xl">Ready to Strike Gold? 💎</h3>
      <p className="mb-6 text-muted-foreground">
        This nugget has been validated and is ready for mining. Take action now!
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Zap className="mr-2 h-4 w-4" />
          Claim This Nugget
        </Button>
        <Button variant="outline" size="lg">
          <Bookmark className="mr-2 h-4 w-4" />
          Save for Later
        </Button>
        <Button variant="outline" size="lg">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

// Chat Section Component
const ChatSection: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="flex items-center gap-2 border-border border-b bg-muted/50 px-6 py-4 font-semibold text-foreground text-lg">
        <MessageCircle className="h-5 w-5" />
        Ask the Prospector
      </h3>
      <div className="p-6">
        <NuggetChat idea={idea} />
      </div>
    </div>
  );
};

// Sidebar Stats Component (Comprehensive)
const SidebarStats: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
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
            <span>{idea.ideaScore.monetizationPotential}/10</span>
            <span>{idea.ideaScore.technicalFeasibility}/10</span>
            <span>{idea.ideaScore.moatStrength}/10</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
            <span>💡</span>
            <span className="text-sm">
              Innovation Level: {idea.innovationLevel}/10
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
            <span>⏱️</span>
            <span className="text-sm">
              Time to Market: {idea.timeToMarket} months
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
            <span>🔥</span>
            <span className="text-sm">
              Urgency Level: {idea.urgencyLevel}/10
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
            <span>🏗️</span>
            <span className="text-sm">
              Execution Complexity: {idea.executionComplexity}/10
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
  );
};

// Strategic Position Component
const StrategicPosition: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
        🏆 Strategic Position
      </h3>
      <div className="p-4 space-y-3">
        <h4 className="text-foreground font-semibold">
          {idea.strategicPositioning.name}
        </h4>
        <p className="text-sm">
          <strong>Target Segment:</strong>{" "}
          {idea.strategicPositioning.targetSegment}
        </p>
        <p className="text-sm">
          <strong>Value Proposition:</strong>{" "}
          {idea.strategicPositioning.valueProposition}
        </p>
      </div>
    </div>
  );
};

// Key Differentiators Component
const KeyDifferentiators: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
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
          <li key={item} className="text-muted-foreground text-sm">
            • {item}
          </li>
        ))}
      </ul>
    );
  };

  if (
    !idea.strategicPositioning.keyDifferentiators ||
    idea.strategicPositioning.keyDifferentiators.length === 0
  ) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
        ✨ Key Differentiators
      </h3>
      <div className="p-4">
        {renderBulletPoints(idea.strategicPositioning.keyDifferentiators)}
      </div>
    </div>
  );
};

// Sidebar Radar Component (Comprehensive)
const SidebarRadar: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({
  idea,
}) => {
  const radarData = [
    { subject: "Problem Severity", value: idea.ideaScore.problemSeverity },
    { subject: "Founder Market Fit", value: idea.ideaScore.founderMarketFit },
    {
      subject: "Technical Feasibility",
      value: idea.ideaScore.technicalFeasibility,
    },
    {
      subject: "Monetization Potential",
      value: idea.ideaScore.monetizationPotential,
    },
    { subject: "Urgency Score", value: idea.ideaScore.urgencyScore },
    { subject: "Market Timing", value: idea.ideaScore.marketTimingScore },
    {
      subject: "Execution Difficulty",
      value: 10 - idea.ideaScore.executionDifficulty,
    }, // Invert for better visualization
    { subject: "Moat Strength", value: idea.ideaScore.moatStrength },
    { subject: "Regulatory Risk", value: 10 - idea.ideaScore.regulatoryRisk }, // Invert for better visualization
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <h3 className="border-border border-b bg-muted/50 px-4 py-3 font-semibold text-foreground text-lg">
        📊 IDEA SCORE RADAR CHART
      </h3>
      <div className="p-4 space-y-4">
        <div className="text-center bg-muted/50 border border-border text-primary p-3 rounded-lg">
          <strong>Overall Idea Score: {idea.ideaScore.totalScore}/100</strong>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-border pb-1">
            <span>Problem Severity:</span>
            <span>{idea.ideaScore.problemSeverity}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Founder Market Fit:</span>
            <span>{idea.ideaScore.founderMarketFit}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Technical Feasibility:</span>
            <span>{idea.ideaScore.technicalFeasibility}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Monetization Potential:</span>
            <span>{idea.ideaScore.monetizationPotential}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Urgency Score:</span>
            <span>{idea.ideaScore.urgencyScore}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Market Timing Score:</span>
            <span>{idea.ideaScore.marketTimingScore}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Execution Difficulty:</span>
            <span>{idea.ideaScore.executionDifficulty}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1">
            <span>Moat Strength:</span>
            <span>{idea.ideaScore.moatStrength}</span>
          </div>
          <div className="flex justify-between">
            <span>Regulatory Risk:</span>
            <span>{idea.ideaScore.regulatoryRisk}</span>
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
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
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
  );
};

// Main Component
const IdeaDetailsView: React.FC<IdeaDetailsViewProps> = ({ idea }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection idea={idea} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col-reverse items-start gap-8 lg:flex-row">
          {/* Left Column - Main Story */}
          <div className="min-w-0 flex-2 space-y-8 lg:w-2/3">
            <QuickOverview idea={idea} />
            <WhyThisMatters idea={idea} />
            <DetailedOverview idea={idea} />
            <TheClaimWhyNow idea={idea} />
            <WhatToBuild idea={idea} />
            <ExecutionPlan idea={idea} />
            <MarketGap idea={idea} />
            <CompetitiveLandscape idea={idea} />
            <RevenueModel idea={idea} />
            <ExecutionValidation idea={idea} />
            <CallToAction idea={idea} />
            <ChatSection idea={idea} />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:sticky top-24 w-full flex-1 space-y-6 lg:w-1/3 lg:max-w-sm">
            <SidebarStats idea={idea} />
            <StrategicPosition idea={idea} />
            <KeyDifferentiators idea={idea} />
            <SidebarRadar idea={idea} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailsView;
