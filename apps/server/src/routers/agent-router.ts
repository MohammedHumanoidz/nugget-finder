// routers/agentRouter.ts

import { z } from "zod";
import IdeaGenerationAgentController from "../apps/idea-generation-agent/idea-generation-agent.controller";
import { IdeaGenerationAgentService } from "../apps/idea-generation-agent/idea-generation-agent.service";
import { publicProcedure, router } from "../lib/trpc";
import { prisma } from "../utils/configs/db.config";

// Input validation schemas
const generateIdeaSchema = z.object({
	count: z.number().min(1).max(5).optional().default(1),
	trendCategory: z.string().optional(),
});

const getIdeasSchema = z.object({
	limit: z.number().min(1).max(50).optional().default(10),
	offset: z.number().min(0).optional().default(0),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
});

const getIdeaByIdSchema = z.object({
	id: z.string().uuid(),
});

export const agentRouter = router({
	// Generate single daily idea
	generateDailyIdea: publicProcedure
		.input(
			z.object({
				trendCategory: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const ideaId = await IdeaGenerationAgentController.generateDailyIdea();

				if (!ideaId) {
					throw new Error("Failed to generate daily idea");
				}

				return {
					success: true,
					ideaId,
					message: "Daily idea generated successfully",
				};
			} catch (error) {
				console.error("Generate daily idea error:", error);
				throw new Error("Failed to generate daily idea");
			}
		}),

	// Generate multiple ideas
	generateMultipleIdeas: publicProcedure
		.input(generateIdeaSchema)
		.mutation(async ({ input }) => {
			try {
				const results = [];

				for (let i = 0; i < input.count; i++) {
					console.log(`🚀 Generating idea ${i + 1}/${input.count}...`);

					const ideaId =
						await IdeaGenerationAgentController.generateDailyIdea();

					if (ideaId) {
						results.push(ideaId);
					}

					// Add delay to avoid rate limits (except for last iteration)
					if (i < input.count - 1) {
						await new Promise((resolve) => setTimeout(resolve, 5000));
					}
				}

				return {
					success: true,
					ideaIds: results,
					generated: results.length,
					requested: input.count,
					message: `Generated ${results.length}/${input.count} ideas successfully`,
				};
			} catch (error) {
				console.error("Generate multiple ideas error:", error);
				throw new Error("Failed to generate multiple ideas");
			}
		}),

	// Get daily ideas with pagination and filtering
	getDailyIdeas: publicProcedure
		.input(getIdeasSchema)
		.query(async ({ input }) => {
			try {
				const { limit, offset, dateFrom, dateTo } = input;

				const whereClause: any = {};

				if (dateFrom || dateTo) {
					whereClause.createdAt = {};
					if (dateFrom) whereClause.createdAt.gte = dateFrom;
					if (dateTo) whereClause.createdAt.lte = dateTo;
				}

				const [ideas, totalCount] = await Promise.all([
					prisma.dailyIdea.findMany({
						where: whereClause,
						include: {
							whyNow: true,
							ideaScore: true,
							marketOpportunity: {
								include: {
									customerSegments: true,
									marketValidationSignals: true,
								},
							},
							monetizationStrategy: {
								include: {
									revenueStreams: true,
									keyMetrics: true,
									financialProjections: true,
								},
							},
							marketCompetition: true,
							marketGap: true,
							competitiveAdvantage: true,
							strategicPositioning: true,
							executionPlan: true,
							tractionSignals: true,
							frameworkFit: true,
							whatToBuild: true,
						},
						orderBy: {
							createdAt: "desc",
						},
						take: limit,
						skip: offset,
					}),
					prisma.dailyIdea.count({ where: whereClause }),
				]);

				return {
					ideas,
					pagination: {
						total: totalCount,
						limit,
						offset,
						hasMore: offset + limit < totalCount,
					},
				};
			} catch (error) {
				console.error("Get daily ideas error:", error);
				throw new Error("Failed to fetch daily ideas");
			}
		}),

	// Get single idea by ID with full details
	getIdeaById: publicProcedure
		.input(getIdeaByIdSchema)
		.query(async ({ input }) => {
			try {
				const idea = await prisma.dailyIdea.findUnique({
					where: { id: input.id },
					select: {
						// Basic fields
						id: true,
						title: true,
						description: true,
						narrativeHook: true,
						problemStatement: true,
						problemSolution: true,
						executiveSummary: true,
						tags: true,
						innovationLevel: true,
						timeToMarket: true,
						urgencyLevel: true,
						executionComplexity: true,
						confidenceScore: true,
						createdAt: true,
						updatedAt: true,
						
						// Feature visibility fields
						isFreeQuickOverview: true,
						isFreeWhyThisMatters: true,
						isFreeDetailedOverview: true,
						isFreeTheClaimWhyNow: true,
						isFreeWhatToBuild: true,
						isFreeExecutionPlan: true,
						isFreeMarketGap: true,
						isFreeCompetitiveLandscape: true,
						isFreeRevenueModel: true,
						isFreeExecutionValidation: true,
						isFreeChat: true,
						
						// Relations
						whyNow: true,
						ideaScore: true,
						marketOpportunity: {
							include: {
								customerSegments: true,
								marketValidationSignals: true,
							},
						},
						monetizationStrategy: {
							include: {
								revenueStreams: true,
								keyMetrics: true,
								financialProjections: true,
							},
						},
						marketCompetition: true,
						marketGap: true,
						competitiveAdvantage: true,
						strategicPositioning: true,
						executionPlan: true,
						tractionSignals: true,
						frameworkFit: true,
						whatToBuild: true,
					},
				});

				if (!idea) {
					throw new Error("Idea not found");
				}

				return idea;
			} catch (error) {
				console.error("Get idea by ID error:", error);
				throw new Error("Failed to fetch idea");
			}
		}),

	// Get recent ideas (last 24 hours)
	getRecentIdeas: publicProcedure.query(async () => {
		try {
			const ideas = await IdeaGenerationAgentService.getDailyIdeas();
			return ideas;
		} catch (error) {
			console.error("Get recent ideas error:", error);
			throw new Error("Failed to fetch recent ideas");
		}
	}),

	// Get idea generation statistics
	getGenerationStats: publicProcedure.query(async () => {
		try {
			const [totalIdeas, todayIdeas, weekIdeas, monthIdeas, avgScore] =
				await Promise.all([
					prisma.dailyIdea.count(),
					prisma.dailyIdea.count({
						where: {
							createdAt: {
								gte: new Date(new Date().setHours(0, 0, 0, 0)),
							},
						},
					}),
					prisma.dailyIdea.count({
						where: {
							createdAt: {
								gte: new Date(new Date().setDate(new Date().getDate() - 7)),
							},
						},
					}),
					prisma.dailyIdea.count({
						where: {
							createdAt: {
								gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
							},
						},
					}),
					prisma.ideaScore.aggregate({
						_avg: {
							totalScore: true,
						},
					}),
				]);

			return {
				totalIdeas,
				todayIdeas,
				weekIdeas,
				monthIdeas,
				averageScore: avgScore._avg.totalScore || 0,
			};
		} catch (error) {
			console.error("Get generation stats error:", error);
			throw new Error("Failed to fetch generation statistics");
		}
	}),

	// Test individual agents (for debugging)
	testTrendResearch: publicProcedure.mutation(async () => {
		try {
			const trends = await IdeaGenerationAgentController.trendResearchAgent({});
			return {
				success: !!trends,
				data: trends,
			};
		} catch (error) {
			console.error("Test trend research error:", error);
			throw new Error("Failed to test trend research agent");
		}
	}),

	testProblemGap: publicProcedure
		.input(
			z.object({
				trendTitle: z.string(),
				trendDescription: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const mockTrend = {
					title: input.trendTitle,
					description: input.trendDescription,
					trendStrength: 8,
					catalystType: "TECHNOLOGY_BREAKTHROUGH" as const,
					timingUrgency: 7,
					supportingData: [],
				};

				const problemGaps = await IdeaGenerationAgentController.problemGapAgent(
					{
						trends: mockTrend,
					},
				);

				return {
					success: !!problemGaps,
					data: problemGaps,
				};
			} catch (error) {
				console.error("Test problem gap error:", error);
				throw new Error("Failed to test problem gap agent");
			}
		}),

	// Delete idea (admin only)
	deleteIdea: publicProcedure
		.input(getIdeaByIdSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// Add admin check if needed
				// if (ctx.session.user.role !== 'ADMIN') {
				//   throw new Error("Unauthorized");
				// }

				await prisma.dailyIdea.delete({
					where: { id: input.id },
				});

				return {
					success: true,
					message: "Idea deleted successfully",
				};
			} catch (error) {
				console.error("Delete idea error:", error);
				throw new Error("Failed to delete idea");
			}
		}),
});
