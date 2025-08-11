// Type definitions for idea generation agent data structures

export interface SynthesizedIdea {
	id: string;
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
	executionPlan?: string;
	tractionSignals?: string;
	frameworkFit?: string;
	whatToBuild?: WhatToBuildData;
	whyNow?: TrendData;
	createdAt: Date;
	updatedAt: Date;
}

export interface WhatToBuildData {
	platformDescription: string;
	coreFeaturesSummary: string[];
	userInterfaces: string[];
	keyIntegrations: string[];
	pricingStrategyBuildRecommendation: string;
}

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
