import type {
	CompetitiveData,
	MonetizationData,
	ProblemGapData,
	SynthesizedIdea,
	TrendData,
	WhatToBuildData,
} from "../../types/apps/idea-generation-agent";
import { prisma } from "../../utils/configs/db.config";

export const IdeaGenerationAgentService = {
	async getDailyIdeas() {
		const dailyIdeas = await prisma.dailyIdea.findMany({
			where: {
				createdAt: {
					gte: new Date(new Date().setDate(new Date().getDate() - 1)),
				},
			},
			include: {
				whyNow: true,
				ideaScore: true,
				marketOpportunity: true,
				monetizationStrategy: {
					include: {
						revenueStreams: true,
						keyMetrics: true,
						financialProjections: true,
					},
				},
				whatToBuild: true,
				marketCompetition: true,
				marketGap: true,
				competitiveAdvantage: true,
				strategicPositioning: true,
				executionPlan: true,
				tractionSignals: true,
				frameworkFit: true,
			},
		});

		return dailyIdeas;
	},

	async createWhyNow(trendData: TrendData) {
		return await prisma.whyNow.create({
			data: {
				title: trendData.title,
				description: trendData.description,
				trendStrength: trendData.trendStrength,
				catalystType: trendData.catalystType,
				timingUrgency: trendData.timingUrgency,
				supportingData: trendData.supportingData,
			},
		});
	},

	async createMarketGap(
		gapData: ProblemGapData["gaps"][0],
		dailyIdeaId: string,
	) {
		return await prisma.marketGap.create({
			data: {
				title: gapData.title,
				description: gapData.description,
				impact: gapData.impact,
				target: gapData.target,
				opportunity: gapData.opportunity,
				dailyIdeaId,
			},
		});
	},

	async createMarketCompetition(
		competitionData: CompetitiveData["competition"],
		dailyIdeaId: string,
	) {
		return await prisma.marketCompetition.create({
			data: {
				marketConcentrationLevel: competitionData.marketConcentrationLevel,
				marketConcentrationJustification:
					competitionData.marketConcentrationJustification,
				directCompetitors: competitionData.directCompetitors,
				indirectCompetitors: competitionData.indirectCompetitors,
				competitorFailurePoints: competitionData.competitorFailurePoints,
				unfairAdvantage: competitionData.unfairAdvantage,
				moat: competitionData.moat,
				competitivePositioningScore:
					competitionData.competitivePositioningScore,
				dailyIdeaId,
			},
		});
	},

	async createStrategicPositioning(
		positioningData: CompetitiveData["positioning"],
		dailyIdeaId: string,
	) {
		return await prisma.strategicPositioning.create({
			data: {
				name: positioningData.name,
				targetSegment: positioningData.targetSegment,
				valueProposition: positioningData.valueProposition,
				keyDifferentiators: positioningData.keyDifferentiators,
				dailyIdeaId,
			},
		});
	},

	async createMonetizationStrategy(monetizationData: MonetizationData) {
		const strategy = await prisma.monetizationStrategy.create({
			data: {
				primaryModel: monetizationData.primaryModel,
				pricingStrategy: monetizationData.pricingStrategy,
				businessScore: monetizationData.businessScore,
				confidence: monetizationData.confidence,
				revenueModelValidation: monetizationData.revenueModelValidation,
				pricingSensitivity: monetizationData.pricingSensitivity,
			},
		});

		// Create revenue streams
		await Promise.all(
			monetizationData.revenueStreams.map((stream) =>
				prisma.revenueStream.create({
					data: {
						name: stream.name,
						description: stream.description,
						percentage: stream.percentage,
						monetizationStrategyId: strategy.id,
					},
				}),
			),
		);

		// Create key metrics
		await prisma.keyMetrics.create({
			data: {
				...monetizationData.keyMetrics,
				monetizationStrategyId: strategy.id,
			},
		});

		// Create financial projections
		await Promise.all(
			monetizationData.financialProjections.map((projection) =>
				prisma.financialProjection.create({
					data: {
						...projection,
						monetizationStrategyId: strategy.id,
					},
				}),
			),
		);

		return strategy;
	},

	async createIdeaScore(scoringData: SynthesizedIdea["scoring"]) {
		return await prisma.ideaScore.create({
			data: scoringData,
		});
	},

	async createExecutionPlan(executionPlan: string, dailyIdeaId: string) {
		return await prisma.executionPlan.create({
			data: {
				mvpDescription: executionPlan,
				keyMilestones: [], // Default to empty array
				resourceRequirements: "TBD", // Default placeholder
				teamRequirements: [], // Default to empty array
				riskFactors: [], // Default to empty array
				technicalRoadmap: "TBD", // Default placeholder
				goToMarketStrategy: "TBD", // Default placeholder
				dailyIdeaId,
			},
		});
	},

	async createTractionSignals(tractionSignals: string, dailyIdeaId: string) {
		return await prisma.tractionSignals.create({
			data: {
				earlyAdopterSignals: [tractionSignals], // Put the string summary in the array
				dailyIdeaId,
			},
		});
	},

	async createFrameworkFit(frameworkFit: string, dailyIdeaId: string) {
		return await prisma.frameworkFit.create({
			data: {
				jobsToBeDone: [], // Default to empty array
				blueOceanFactors: {}, // Default to empty object
				leanCanvasScore: 7, // Default reasonable score
				designThinkingStage: "TBD", // Default placeholder
				innovationDilemmaFit: frameworkFit, // Put the string summary here
				crossingChasmStage: "TBD", // Default placeholder
				dailyIdeaId,
			},
		});
	},

	async createWhatToBuild(whatToBuildData: WhatToBuildData, dailyIdeaId: string) {
		return await prisma.whatToBuild.create({
			data: {
				platformDescription: whatToBuildData.platformDescription,
				coreFeaturesSummary: whatToBuildData.coreFeaturesSummary,
				userInterfaces: whatToBuildData.userInterfaces,
				keyIntegrations: whatToBuildData.keyIntegrations,
				pricingStrategyBuildRecommendation: whatToBuildData.pricingStrategyBuildRecommendation,
				dailyIdeaId,
			},
		});
	},

	async createDailyIdea(
		ideaData: SynthesizedIdea,
		whyNowId: string,
		ideaScoreId: string,
		monetizationStrategyId: string,
		whatToBuildId?: string,
	) {
		const createData: any = {
			title: ideaData.title,
			description: ideaData.description,
			executiveSummary: ideaData.executiveSummary,
			problemSolution: ideaData.problemSolution,
			problemStatement: ideaData.problemStatement,
			innovationLevel: ideaData.innovationLevel,
			timeToMarket: ideaData.timeToMarket,
			confidenceScore: ideaData.confidenceScore,
			narrativeHook: ideaData.narrativeHook,
			targetKeywords: ideaData.targetKeywords,
			urgencyLevel: ideaData.urgencyLevel,
			executionComplexity: ideaData.executionComplexity,
			tags: ideaData.tags,
			whyNowId,
			ideaScoreId,
			monetizationStrategyId,
		};

		// Only add whatToBuildId if provided
		if (whatToBuildId) {
			createData.whatToBuildId = whatToBuildId;
		}

		return await prisma.dailyIdea.create({
			data: createData,
		});
	},
};
