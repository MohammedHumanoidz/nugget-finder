import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import prisma from "../../prisma";
import {
  getUserIdeaLimits,
  saveIdeaForUser,
  unsaveIdeaForUser,
  claimIdeaForUser,
  unclaimIdeaForUser,
  getUserSavedIdeas,
  getUserClaimedIdeas,
  getIdeasForUser,
} from "../utils/idea-management";
import IdeaGenerationAgentController from "../apps/idea-generation-agent/idea-generation-agent.controller";
import { onDemandIdeaGenerationJob } from "../trigger/on-demand-idea-generation";

export const ideasRouter = router({
  // Get user's idea limits and remaining quotas
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    return await getUserIdeaLimits(ctx.session.user.id);
  }),

  // Get ideas filtered for the current user
  getIdeas: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await getIdeasForUser(ctx?.session?.user?.id ?? '', input);
    }),

  // Save an idea
  saveIdea: protectedProcedure
    .input(
      z.object({
        ideaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await saveIdeaForUser(ctx.session.user.id, input.ideaId);
    }),

  // Unsave an idea
  unsaveIdea: protectedProcedure
    .input(
      z.object({
        ideaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await unsaveIdeaForUser(ctx.session.user.id, input.ideaId);
    }),

  // Claim an idea
  claimIdea: protectedProcedure
    .input(
      z.object({
        ideaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await claimIdeaForUser(ctx.session.user.id, input.ideaId);
    }),

  // Unclaim an idea
  unclaimIdea: protectedProcedure
    .input(
      z.object({
        ideaId: z.string().uuid(),
      })
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
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit = 20, offset = 0 } = input || {};
      
      try {
        const minedIdeas = await prisma.userGeneratedIdea.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
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
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { ideaId } = input;
      console.log(`[DEBUG] Protected endpoint called with userId: ${userId}, ideaId: ${ideaId}`);

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
      console.log("[DEBUG] Already viewed check:", { alreadyViewed: !!alreadyViewed, ideaId });

      // If not viewed before and user has no more views left, throw error
      if (!alreadyViewed && !limits.canView) {
        console.log("[DEBUG] THROWING VIEW_LIMIT_EXCEEDED - User has no views left");
        throw new Error('VIEW_LIMIT_EXCEEDED');
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
        throw new Error('Idea not found');
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
        isClaimedByOther: idea.claimedIdeas ? idea.claimedIdeas.userId !== userId : null,
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
          createdAt: 'asc',
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
          createdAt: 'asc',
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
          createdAt: 'asc',
        },
      });

      // Create a map to group by date
      const trendMap = new Map<string, { saved: number; claimed: number; viewed: number; date: string; day: number }>();

      // Initialize all days in the past 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
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
        const dateKey = save.createdAt.toISOString().split('T')[0];
        const existing = trendMap.get(dateKey);
        if (existing) {
          existing.saved += 1;
        }
      });

      // Count claimed ideas by date
      claimedTrends.forEach((claim) => {
        const dateKey = claim.createdAt.toISOString().split('T')[0];
        const existing = trendMap.get(dateKey);
        if (existing) {
          existing.claimed += 1;
        }
      });

      // Count viewed ideas by date
      viewedTrends.forEach((view) => {
        const dateKey = view.createdAt.toISOString().split('T')[0];
        const existing = trendMap.get(dateKey);
        if (existing) {
          existing.viewed += 1;
        }
      });

      // Convert map to array and sort by date
      const chartData = Array.from(trendMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return chartData;
    } catch (error) {
      console.error("Error getting activity trends:", error);
      return [];
    }
  }),

  // Generate ideas on demand based on user prompt (background job version)
  generateOnDemand: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Query cannot be empty"),
        count: z.number().min(1).max(3).optional().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      console.log(`[DEBUG] generateOnDemand called with userId: ${userId}, query: "${input.query}"`);
      
      try {
        console.log(`[DEBUG] Creating idea generation request for user ${userId}`);
        
        // Create a new idea generation request record
        const ideaGenerationRequest = await prisma.ideaGenerationRequest.create({
          data: {
            userId,
            prompt: input.query,
            status: "PENDING",
            currentStep: "Initializing",
            progressMessage: "Preparing to generate your business ideas...",
            imageState: "confused"
          }
        });

        console.log(`[DEBUG] Created request ${ideaGenerationRequest.id}, triggering background job`);

        // For now, skip background job and go directly to fallback execution for testing  
        console.log("[DEBUG] Executing fallback generation directly");
        
        // Execute the generation directly in the background (fire and forget)
        setImmediate(async () => {
          try {
            console.log("[DEBUG] Starting fallback execution...");
            await prisma.ideaGenerationRequest.update({
              where: { id: ideaGenerationRequest.id },
              data: {
                status: "RUNNING"
              }
            });

            console.log("[DEBUG] Updated status to RUNNING, calling generateIdeasOnDemand...");
            // Use the existing controller method with requestId for progress tracking
            const generatedIdeas = await IdeaGenerationAgentController.generateIdeasOnDemand(
              input.query,
              userId,
              ideaGenerationRequest.id,
              input.count
            );

            console.log(`[DEBUG] Generated ${generatedIdeas.length} ideas, updating to COMPLETED...`);
            await prisma.ideaGenerationRequest.update({
              where: { id: ideaGenerationRequest.id },
              data: {
                status: "COMPLETED",
                currentStep: "Complete",
                progressMessage: `🎉 Found ${generatedIdeas.length} amazing business opportunities for you!`,
                imageState: "found",
                generatedIdeaIds: generatedIdeas.map((idea: any) => idea.id)
              }
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
                errorMessage: fallbackError instanceof Error ? fallbackError.message : "Unknown error"
              }
            });
          }
        });
        
        return { requestId: ideaGenerationRequest.id };
      } catch (error) {
        console.error("[ERROR] Failed to generate ideas on demand:", error);
        throw new Error("Failed to generate ideas. Please try again.");
      }
    }),

  // Get the status of an idea generation request
  getGenerationStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid("Invalid request ID"),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      try {
        console.log(`[DEBUG] Getting generation status for request ${input.requestId}, user ${userId}`);
        
        const request = await prisma.ideaGenerationRequest.findFirst({
          where: {
            id: input.requestId,
            userId // Ensure user can only access their own requests
          }
        });

        if (!request) {
          console.log(`[DEBUG] Request ${input.requestId} not found for user ${userId}`);
          throw new Error("Request not found or access denied");
        }

        console.log(`[DEBUG] Found request ${input.requestId}, status: ${request.status}, step: ${request.currentStep}`);

        return {
          requestId: request.id,
          status: request.status,
          currentStep: request.currentStep,
          progressMessage: request.progressMessage,
          imageState: request.imageState,
          generatedIdeaIds: request.generatedIdeaIds,
          errorMessage: request.errorMessage,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        };
      } catch (error) {
        console.error("[ERROR] Failed to get generation status:", error);
        throw new Error("Failed to get generation status");
      }
    }),

  // Get user's generated ideas
  getGeneratedIdeas: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit = 20, offset = 0 } = input || {};
      
      try {
        const generatedIdeas = await prisma.userGeneratedIdea.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
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
      })
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
          throw new Error('Generated idea not found or access denied');
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
});