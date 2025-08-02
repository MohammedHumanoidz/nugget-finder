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
});