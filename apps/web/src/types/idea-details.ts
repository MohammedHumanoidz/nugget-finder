import type { SynthesizedIdea, TrendData } from "@/types/apps/idea-generation-agent";

// Extended type definitions for the IdeaDetailsView component

export interface IdeaScore {
  id: string;
  totalScore: number;
  problemSeverity: number;
  founderMarketFit: number;
  technicalFeasibility: number;
  monetizationPotential: number;
  urgencyScore: number;
  marketTimingScore: number;
  executionDifficulty: number;
  moatStrength: number;
  regulatoryRisk: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueStream {
  id: string;
  name: string;
  description: string;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyMetrics {
  id: string;
  ltv: number;
  ltvDescription: string;
  cac: number;
  cacDescription: string;
  ltvCacRatio: number;
  ltvCacRatioDescription: string;
  paybackPeriod: number;
  paybackPeriodDescription: string;
  runway: number;
  runwayDescription: string;
  breakEvenPoint: string;
  breakEvenPointDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialProjection {
  id: string;
  year: number;
  revenue: number;
  costs: number;
  netMargin: number;
  revenueGrowth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonetizationDataWithRelations {
  id: string;
  primaryModel: string;
  pricingStrategy: string;
  businessScore: number;
  confidence: number;
  revenueModelValidation: string;
  pricingSensitivity: string;
  revenueStreams: RevenueStream[];
  keyMetrics: KeyMetrics | null;
  financialProjections: FinancialProjection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectCompetitor {
  name: string;
  justification: string;
  strengths: string[];
  weaknesses: string[];
}

export interface IndirectCompetitor {
  name: string;
  justification: string;
  strengths?: string[];
  weaknesses?: string[];
}

export interface MarketCompetitionWithRelations {
  id: string;
  marketConcentrationLevel: "LOW" | "MEDIUM" | "HIGH";
  marketConcentrationJustification: string;
  directCompetitors: DirectCompetitor[];
  indirectCompetitors: IndirectCompetitor[];
  competitorFailurePoints: string[];
  unfairAdvantage: string[];
  moat: string[];
  competitivePositioningScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketGap {
  id: string;
  title: string;
  description: string;
  impact: string;
  target: string;
  opportunity: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategicPositioning {
  id: string;
  name: string;
  targetSegment: string;
  valueProposition: string;
  keyDifferentiators: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionPlan {
  id: string;
  mvpDescription: string;
  keyMilestones: any[]; // JSON field
  resourceRequirements: string;
  teamRequirements: string[];
  riskFactors: string[];
  technicalRoadmap: string;
  goToMarketStrategy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TractionSignals {
  id: string;
  waitlistCount?: number | null;
  socialMentions?: number | null;
  searchVolume?: number | null;
  competitorFunding?: number | null;
  patentActivity?: number | null;
  regulatoryChanges: string[];
  mediaAttention?: number | null;
  expertEndorsements: string[];
  earlyAdopterSignals: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FrameworkFit {
  id: string;
  jobsToBeDone: string[];
  blueOceanFactors: any; // JSON field
  leanCanvasScore: number;
  designThinkingStage: string;
  innovationDilemmaFit: string;
  crossingChasmStage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatToBuild {
  id: string;
  platformDescription: string;
  coreFeaturesSummary: string[];
  userInterfaces: string[];
  keyIntegrations: string[];
  pricingStrategyBuildRecommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

// Main component prop type
export interface IdeaDetailsViewProps {
  idea: SynthesizedIdea & {
    whyNow: TrendData;
    ideaScore: IdeaScore;
    monetizationStrategy: MonetizationDataWithRelations;
    marketCompetition: MarketCompetitionWithRelations;
    marketGap: MarketGap;
    strategicPositioning: StrategicPositioning;
    executionPlan: ExecutionPlan;
    tractionSignals: TractionSignals;
    frameworkFit: FrameworkFit;
    whatToBuild?: WhatToBuild;
  };
}