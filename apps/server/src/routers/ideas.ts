import { z } from "zod";
import prisma from "../../prisma";
import IdeaGenerationAgentController from "../apps/idea-generation-agent/idea-generation-agent.controller";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

import {
	claimIdeaForUser,
	getIdeasForUser,
	getUserClaimedIdeas,
	getUserIdeaLimits,
	getUserSavedIdeas,
	saveIdeaForUser,
	unclaimIdeaForUser,
	unsaveIdeaForUser,
} from "../utils/idea-management";

// Configuration for non-auth search limits
const MAX_NON_AUTH_SEARCHES = Number.parseInt(
	process.env.MAX_NON_AUTH_SEARCHES || "1",
);

// In-memory storage for non-auth usage tracking (in production, use Redis)
const nonAuthUsageTracker = new Map<
	string,
	{ count: number; lastReset: Date }
>();

// Personalization data schema
const personalizationSchema = z
	.object({
		skills: z.string().optional(),
		goals: z.string().optional(),
		categories: z.string().optional(),
		revenueGoal: z.number().optional(),
		timeAvailability: z.string().optional(),
	})
	.optional();

// Helper function to track non-auth usage
function trackNonAuthUsage(sessionId: string): {
	canGenerate: boolean;
	remaining: number;
} {
	const now = new Date();
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	let usage = nonAuthUsageTracker.get(sessionId);

	// Reset if it's a new day
	if (!usage || usage.lastReset < dayStart) {
		usage = { count: 0, lastReset: dayStart };
		nonAuthUsageTracker.set(sessionId, usage);
	}

	const canGenerate = usage.count < MAX_NON_AUTH_SEARCHES;
	const remaining = Math.max(0, MAX_NON_AUTH_SEARCHES - usage.count);

	return { canGenerate, remaining };
}

function incrementNonAuthUsage(sessionId: string) {
	const usage = nonAuthUsageTracker.get(sessionId);
	if (usage) {
		usage.count += 1;
		nonAuthUsageTracker.set(sessionId, usage);
	}
}

export const ideasRouter = router({
	// Get user's idea limits and remaining quotas
	getLimits: protectedProcedure.query(async ({ ctx }) => {
		return await getUserIdeaLimits(ctx.session.user.id);
	}),

	// Get ideas filtered for the current user
	getIdeas: publicProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			return await getIdeasForUser(ctx?.session?.user?.id ?? "", input);
		}),

	// Save an idea
	saveIdea: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await saveIdeaForUser(ctx.session.user.id, input.ideaId);
		}),

	// Unsave an idea
	unsaveIdea: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await unsaveIdeaForUser(ctx.session.user.id, input.ideaId);
		}),

	// Claim an idea
	claimIdea: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await claimIdeaForUser(ctx.session.user.id, input.ideaId);
		}),

	// Unclaim an idea
	unclaimIdea: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await unclaimIdeaForUser(ctx.session.user.id, input.ideaId);
		}),

	// Get user's saved ideas
	getSavedIdeas: protectedProcedure.query(async ({ ctx }) => {
		return await getUserSavedIdeas(ctx.session.user.id);
	}),

	// Get user's claimed ideas
	getClaimedIdeas: protectedProcedure.query(async ({ ctx }) => {
		return await getUserClaimedIdeas(ctx.session.user.id);
	}),

	// Get user's mined ideas (user-generated ideas)
	getMinedIdeas: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(20),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { limit = 20, offset = 0 } = input || {};

			try {
				const minedIdeas = await prisma.userGeneratedIdea.findMany({
					where: { userId },
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
					select: {
						id: true,
						prompt: true,
						title: true,
						description: true,
						executiveSummary: true,
						problemStatement: true,
						narrativeHook: true,
						tags: true,
						confidenceScore: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				return minedIdeas;
			} catch (error) {
				console.error("Error getting mined ideas:", error);
				return [];
			}
		}),

	// Get individual idea by ID with view tracking and limits check
	getIdeaById: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { ideaId } = input;
			console.log(
				`[DEBUG] Protected endpoint called with userId: ${userId}, ideaId: ${ideaId}`,
			);

			// Check if user can view more ideas
			const limits = await getUserIdeaLimits(userId);
			console.log(`[DEBUG] View limits for user ${userId}:`, {
				canView: limits.canView,
				viewsRemaining: limits.viewsRemaining,
				ideaId,
			});

			// Check if already viewed this specific idea
			const alreadyViewed = await prisma.viewedIdeas.findUnique({
				where: {
					userId_ideaId: {
						userId,
						ideaId,
					},
				},
			});
			console.log("[DEBUG] Already viewed check:", {
				alreadyViewed: !!alreadyViewed,
				ideaId,
			});

			// If not viewed before and user has no more views left, throw error
			if (!alreadyViewed && !limits.canView) {
				console.log(
					"[DEBUG] THROWING VIEW_LIMIT_EXCEEDED - User has no views left",
				);
				throw new Error("VIEW_LIMIT_EXCEEDED");
			}
			console.log("[DEBUG] View check passed - proceeding to fetch idea");

			// Get the idea
			const idea = await prisma.dailyIdea.findUnique({
				where: { id: ideaId },
				include: {
					ideaScore: true,
					marketOpportunity: true,
					monetizationStrategy: {
						include: {
							revenueStreams: true,
							keyMetrics: true,
							financialProjections: true,
						},
					},
					whyNow: true,
					whatToBuild: true,
					marketCompetition: true,
					marketGap: true,
					competitiveAdvantage: true,
					strategicPositioning: true,
					executionPlan: true,
					tractionSignals: true,
					frameworkFit: true,
					savedIdeas: {
						where: { userId },
						select: { id: true },
					},
					claimedIdeas: {
						select: { userId: true },
					},
				},
			});

			if (!idea) {
				throw new Error("Idea not found");
			}

			// Record the view if not already viewed
			if (!alreadyViewed) {
				await prisma.viewedIdeas.create({
					data: {
						userId,
						ideaId,
					},
				});

				// Increment user's view count if they have limited views
				if (limits.viewsRemaining !== -1) {
					await prisma.user.update({
						where: { id: userId },
						data: { viewsUsed: { increment: 1 } },
					});
				}
			}

			// Transform the idea to include user-specific flags
			return {
				...idea,
				isSaved: idea.savedIdeas.length > 0,
				isClaimed: idea.claimedIdeas?.userId === userId,
				isClaimedByOther: idea.claimedIdeas
					? idea.claimedIdeas.userId !== userId
					: null,
			};
		}),

	// Get activity trends for chart (30 days)
	getActivityTrends: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		try {
			// Get saved ideas over the past 30 days
			const savedTrends = await prisma.savedIdeas.findMany({
				where: {
					userId,
					createdAt: {
						gte: thirtyDaysAgo,
					},
				},
				select: {
					createdAt: true,
				},
				orderBy: {
					createdAt: "asc",
				},
			});

			// Get claimed ideas over the past 30 days
			const claimedTrends = await prisma.claimedIdeas.findMany({
				where: {
					userId,
					createdAt: {
						gte: thirtyDaysAgo,
					},
				},
				select: {
					createdAt: true,
				},
				orderBy: {
					createdAt: "asc",
				},
			});

			// Get viewed ideas over the past 30 days
			const viewedTrends = await prisma.viewedIdeas.findMany({
				where: {
					userId,
					createdAt: {
						gte: thirtyDaysAgo,
					},
				},
				select: {
					createdAt: true,
				},
				orderBy: {
					createdAt: "asc",
				},
			});

			// Create a map to group by date
			const trendMap = new Map<
				string,
				{
					saved: number;
					claimed: number;
					viewed: number;
					date: string;
					day: number;
				}
			>();

			// Initialize all days in the past 30 days
			for (let i = 29; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateKey = date.toISOString().split("T")[0];

				trendMap.set(dateKey, {
					date: dateKey,
					day: date.getDate(),
					saved: 0,
					claimed: 0,
					viewed: 0,
				});
			}

			// Count saved ideas by date
			savedTrends.forEach((save) => {
				const dateKey = save.createdAt.toISOString().split("T")[0];
				const existing = trendMap.get(dateKey);
				if (existing) {
					existing.saved += 1;
				}
			});

			// Count claimed ideas by date
			claimedTrends.forEach((claim) => {
				const dateKey = claim.createdAt.toISOString().split("T")[0];
				const existing = trendMap.get(dateKey);
				if (existing) {
					existing.claimed += 1;
				}
			});

			// Count viewed ideas by date
			viewedTrends.forEach((view) => {
				const dateKey = view.createdAt.toISOString().split("T")[0];
				const existing = trendMap.get(dateKey);
				if (existing) {
					existing.viewed += 1;
				}
			});

			// Convert map to array and sort by date
			const chartData = Array.from(trendMap.values()).sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			);

			return chartData;
		} catch (error) {
			console.error("Error getting activity trends:", error);
			return [];
		}
	}),

	// Generate ideas on demand based on user prompt (supports both auth and non-auth users)
	generateOnDemand: publicProcedure
		.input(
			z.object({
				query: z.string().min(1, "Query cannot be empty"),
				count: z.number().min(1).max(3).optional().default(1),
				personalization: personalizationSchema,
				sessionId: z.string().optional(), // For non-auth users
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx?.session?.user?.id;
			const isAuthenticated = !!userId;

			console.log(
				`[DEBUG] generateOnDemand called with userId: ${userId || "non-auth"}, query: "${input.query}"`,
			);

			// Handle non-authenticated users
			if (!isAuthenticated) {
				const sessionId = input.sessionId || "anonymous";
				const usage = trackNonAuthUsage(sessionId);

				if (!usage.canGenerate) {
					throw new Error(
						`SEARCH_LIMIT_EXCEEDED:You've reached your search limit (${MAX_NON_AUTH_SEARCHES}/day). Please sign up for unlimited searches.`,
					);
				}

				console.log(
					`[DEBUG] Non-auth user session ${sessionId} has ${usage.remaining} searches remaining`,
				);
				incrementNonAuthUsage(sessionId);
			}

			try {
				console.log(
					`[DEBUG] Creating idea generation request for user ${userId || "non-auth"}`,
				);

				// Create a new idea generation request record
				const ideaGenerationRequest = await prisma.ideaGenerationRequest.create(
					{
						data: {
							userId: userId || undefined, // Use undefined instead of null for Prisma
							prompt: input.query,
							status: "PENDING",
							currentStep: "Initializing",
							progressMessage: "Preparing to generate your business ideas...",
							imageState: "confused",
							personalizationData: input.personalization
								? JSON.stringify(input.personalization)
								: null,
						},
					},
				);

				console.log(
					`[DEBUG] Created request ${ideaGenerationRequest.id}, triggering background job`,
				);

				// For now, skip background job and go directly to fallback execution for testing
				console.log("[DEBUG] Executing fallback generation directly");

				// Execute the generation directly in the background (fire and forget)
				setImmediate(async () => {
					try {
						console.log("[DEBUG] Starting fallback execution...");
						await prisma.ideaGenerationRequest.update({
							where: { id: ideaGenerationRequest.id },
							data: {
								status: "RUNNING",
							},
						});

						console.log(
							"[DEBUG] Updated status to RUNNING, calling generateIdeasOnDemand...",
						);
						// Use the existing controller method with requestId for progress tracking
						const generatedIdeas =
							await IdeaGenerationAgentController.generateIdeasOnDemand(
								input.query,
								userId || null, // Pass null for non-auth users
								ideaGenerationRequest.id,
								input.count,
								input.personalization || undefined,
							);

						console.log(
							`[DEBUG] Generated ${generatedIdeas.length} ideas, updating to COMPLETED...`,
						);
						await prisma.ideaGenerationRequest.update({
							where: { id: ideaGenerationRequest.id },
							data: {
								status: "COMPLETED",
								currentStep: "Complete",
								progressMessage: `🎉 Found ${generatedIdeas.length} amazing business opportunities for you!`,
								imageState: "found",
								generatedIdeaIds: generatedIdeas.map((idea: any) => idea.id),
								// Store full idea data for non-auth users in personalizationData field
								...((!userId && generatedIdeas.length > 0) && {
									personalizationData: JSON.stringify({
										...(input.personalization || {}),
										generatedIdeasData: generatedIdeas
									})
								}),
							},
						});
						console.log("[DEBUG] Fallback execution completed successfully!");
					} catch (fallbackError) {
						console.error("[ERROR] Fallback execution failed", fallbackError);
						await prisma.ideaGenerationRequest.update({
							where: { id: ideaGenerationRequest.id },
							data: {
								status: "FAILED",
								currentStep: "Failed",
								progressMessage: "Failed to generate ideas. Please try again.",
								imageState: "confused",
								errorMessage:
									fallbackError instanceof Error
										? fallbackError.message
										: "Unknown error",
							},
						});
					}
				});

				return { requestId: ideaGenerationRequest.id };
			} catch (error) {
				console.error("[ERROR] Failed to generate ideas on demand:", error);

				// Check if it's a search limit error
				if (
					error instanceof Error &&
					error.message.startsWith("SEARCH_LIMIT_EXCEEDED:")
				) {
					throw error; // Re-throw with original message
				}

				throw new Error("Failed to generate ideas. Please try again.");
			}
		}),

	// Get the status of an idea generation request (supports both auth and non-auth)
	getGenerationStatus: publicProcedure
		.input(
			z.object({
				requestId: z.string().uuid("Invalid request ID"),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx?.session?.user?.id;

			try {
				console.log(
					`[DEBUG] Getting generation status for request ${input.requestId}, user ${userId || "non-auth"}`,
				);

				const request = await prisma.ideaGenerationRequest.findFirst({
					where: {
						AND: [
							{ id: input.requestId },
							{
								OR: [
									{ userId: { equals: null } }, // Non-auth request
									{ userId: userId || undefined }, // Auth request for this user
								],
							},
						],
					},
				});

				if (!request) {
					console.log(
						`[DEBUG] Request ${input.requestId} not found for user ${userId || "non-auth"}`,
					);
					throw new Error("Request not found or access denied");
				}

				console.log(
					`[DEBUG] Found request ${input.requestId}, status: ${request.status}, step: ${request.currentStep}`,
				);

				// Parse personalization data to extract generated ideas for non-auth users
				let generatedIdeasData = null;
				if (request.personalizationData) {
					try {
						const parsed = JSON.parse(request.personalizationData);
						if (parsed.generatedIdeasData) {
							generatedIdeasData = parsed.generatedIdeasData;
						}
					} catch (error) {
						console.error("Failed to parse personalization data:", error);
					}
				}

				return {
					requestId: request.id,
					status: request.status,
					currentStep: request.currentStep,
					progressMessage: request.progressMessage,
					imageState: request.imageState,
					generatedIdeaIds: request.generatedIdeaIds,
					generatedIdeasData, // Include the full idea data for non-auth users
					errorMessage: request.errorMessage,
					createdAt: request.createdAt,
					updatedAt: request.updatedAt,
				};
			} catch (error) {
				console.error("[ERROR] Failed to get generation status:", error);
				throw new Error("Failed to get generation status");
			}
		}),

	// Get user's generated ideas
	getGeneratedIdeas: publicProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(20),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx?.session?.user?.id;
			const { limit = 20, offset = 0 } = input || {};

			try {
				const generatedIdeas = await prisma.userGeneratedIdea.findMany({
					where: { userId: userId || undefined },
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
					select: {
						id: true,
						prompt: true,
						title: true,
						description: true,
						executiveSummary: true,
						problemStatement: true,
						narrativeHook: true,
						tags: true,
						confidenceScore: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				return generatedIdeas;
			} catch (error) {
				console.error("Error getting generated ideas:", error);
				return [];
			}
		}),

	// Get full details of a user-generated idea by ID
	getGeneratedIdeaById: protectedProcedure
		.input(
			z.object({
				ideaId: z.string().uuid(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { ideaId } = input;

			try {
				const idea = await prisma.userGeneratedIdea.findFirst({
					where: {
						id: ideaId,
						userId, // Ensure user can only access their own generated ideas
					},
				});

				if (!idea) {
					throw new Error("Generated idea not found or access denied");
				}

				// Parse the full idea data from JSON
				let fullIdeaData = null;
				try {
					fullIdeaData = JSON.parse(idea.fullIdeaDataJson);
				} catch (parseError) {
					console.error("Error parsing full idea data JSON:", parseError);
				}

				return {
					...idea,
					fullIdeaData,
				};
			} catch (error) {
				console.error("Error getting generated idea by ID:", error);
				throw new Error("Failed to retrieve idea details");
			}
		}),

	// Get non-auth search limits for current session
	getNonAuthLimits: publicProcedure
		.input(
			z.object({
				sessionId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const usage = trackNonAuthUsage(input.sessionId);
			return {
				maxSearches: MAX_NON_AUTH_SEARCHES,
				remaining: usage.remaining,
				canGenerate: usage.canGenerate,
			};
		}),
});
