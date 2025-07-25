export interface TrendData {
  title: string;
  description: string;
  trendStrength: number;
  catalystType:
    | "TECHNOLOGY_BREAKTHROUGH"
    | "REGULATORY_CHANGE"
    | "MARKET_SHIFT"
    | "SOCIAL_TREND"
    | "ECONOMIC_FACTOR";
  timingUrgency: number;
  supportingData: any[];
}

export interface ProblemGapData {
  problems: string[];
  gaps: {
    title: string;
    description: string;
    impact: string;
    target: string;
    opportunity: string;
  }[];
}

export interface CompetitiveData {
  competition: {
    marketConcentrationLevel: "LOW" | "MEDIUM" | "HIGH";
    marketConcentrationJustification: string;
    directCompetitors: any[];
    indirectCompetitors: any[];
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
}

export interface MonetizationData {
  primaryModel: string;
  pricingStrategy: string;
  businessScore: number;
  confidence: number;
  revenueModelValidation: string;
  pricingSensitivity: string;
  revenueStreams: {
    name: string;
    description: string;
    percentage: number;
  }[];
  keyMetrics: {
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
  };
  financialProjections: {
    year: number;
    revenue: number;
    costs: number;
    netMargin: number;
    revenueGrowth: number;
  }[];
}

export interface SynthesizedIdea {
  title: string;
  description: string;
  executiveSummary: string;
  problemSolution: string;
  problemStatement: string;
  innovationLevel: number;
  timeToMarket: number;
  confidenceScore: number;
  narrativeHook: string;
  targetKeywords: string[];
  urgencyLevel: number;
  executionComplexity: number;
  tags: string[];
  scoring: {
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
  };
}

export interface AgentContext {
  trends?: TrendData;
  problemGaps?: ProblemGapData;
  competitive?: CompetitiveData;
  monetization?: MonetizationData;
  previousIdeas?: any[];
}
