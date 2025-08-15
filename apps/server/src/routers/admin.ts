import { z } from "zod";
import { adminProcedure, router } from "../lib/trpc";
import { prisma } from "../utils/configs/db.config";

export const adminRouter = router({
  // Featured Nuggets Management
  getFeaturedSchedule: adminProcedure
    .input(z.object({ 
      date: z.string().transform((str) => new Date(str)).optional() 
    }))
    .query(async ({ input }) => {
      const targetDate = input.date || new Date();
      const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      return await prisma.featuredNuggetsSchedule.findFirst({
        where: { date: dateOnly },
        include: { 
          creator: { select: { name: true, email: true } }
        }
      });
    }),

  updateFeaturedSchedule: adminProcedure
    .input(z.object({
      date: z.string().transform((str) => new Date(str)),
      ideaIds: z.array(z.string()).max(3, "Maximum 3 ideas allowed"),
    }))
    .mutation(async ({ input, ctx }) => {
      const dateOnly = new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate());
      
      return await prisma.featuredNuggetsSchedule.upsert({
        where: { date: dateOnly },
        update: { 
          ideaIds: input.ideaIds,
          updatedAt: new Date()
        },
        create: {
          date: dateOnly,
          ideaIds: input.ideaIds,
          order: 1,
          createdBy: ctx.session.user.id
        }
      });
    }),

  getAvailableIdeas: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      search: z.string().optional()
    }))
    .query(async ({ input }) => {
      return await prisma.dailyIdea.findMany({
        where: input.search ? {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } }
          ]
        } : undefined,
        select: { 
          id: true, 
          title: true, 
          narrativeHook: true,
          createdAt: true,
          ideaScore: {
            select: { totalScore: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      });
    }),

  getFeaturedScheduleRange: adminProcedure
    .input(z.object({
      startDate: z.string().transform((str) => {
        const date = new Date(str);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }),
      endDate: z.string().transform((str) => {
        const date = new Date(str);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      })
    }))
    .query(async ({ input }) => {
      return await prisma.featuredNuggetsSchedule.findMany({
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate
          }
        },
        orderBy: { date: 'asc' }
      });
    }),

  // Feature Visibility Management
  getFeatureVisibilityDefaults: adminProcedure.query(async () => {
    try {
      // Try to get the most recent idea to see current defaults
      const recentIdea = await prisma.dailyIdea.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
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
        }
      });
      
      return recentIdea || {
        isFreeQuickOverview: true,
        isFreeWhyThisMatters: true,
        isFreeDetailedOverview: true,
        isFreeTheClaimWhyNow: false,
        isFreeWhatToBuild: false,
        isFreeExecutionPlan: false,
        isFreeMarketGap: false,
        isFreeCompetitiveLandscape: false,
        isFreeRevenueModel: false,
        isFreeExecutionValidation: false,
        isFreeChat: false,
      };
    } catch (error: any) {
      // If migration hasn't been run yet, return default values
      console.warn('Feature visibility fields not yet migrated, using defaults:', error.message);
      return {
        isFreeQuickOverview: true,
        isFreeWhyThisMatters: true,
        isFreeDetailedOverview: true,
        isFreeTheClaimWhyNow: false,
        isFreeWhatToBuild: false,
        isFreeExecutionPlan: false,
        isFreeMarketGap: false,
        isFreeCompetitiveLandscape: false,
        isFreeRevenueModel: false,
        isFreeExecutionValidation: false,
        isFreeChat: false,
      };
    }
  }),

  updateFeatureVisibilityDefaults: adminProcedure
    .input(z.object({
      isFreeQuickOverview: z.boolean(),
      isFreeWhyThisMatters: z.boolean(),
      isFreeDetailedOverview: z.boolean(),
      isFreeTheClaimWhyNow: z.boolean(),
      isFreeWhatToBuild: z.boolean(),
      isFreeExecutionPlan: z.boolean(),
      isFreeMarketGap: z.boolean(),
      isFreeCompetitiveLandscape: z.boolean(),
      isFreeRevenueModel: z.boolean(),
      isFreeExecutionValidation: z.boolean(),
      isFreeChat: z.boolean(),
      applyToAllIdeas: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input }) => {
      try {
        const { applyToAllIdeas, ...settingsData } = input;
        
        if (applyToAllIdeas) {
          // Update ALL existing ideas with the new settings
          const result = await prisma.dailyIdea.updateMany({
            data: settingsData
          });
          
          return { 
            success: true, 
            updatedCount: result.count,
            message: `Updated ${result.count} ideas with new feature visibility settings`
          };
        } else {
          // Update only future ideas (created after now) with new defaults
          const result = await prisma.dailyIdea.updateMany({
            where: { 
              createdAt: { gte: new Date() } 
            },
            data: settingsData
          });
          
          return { 
            success: true, 
            updatedCount: result.count,
            message: `Updated ${result.count} future ideas with new defaults`
          };
        }
      } catch (error: any) {
        // If migration hasn't been run yet
        console.warn('Feature visibility fields not yet migrated, cannot update defaults:', error.message);
        return { 
          success: false, 
          updatedCount: 0,
          message: 'Feature visibility migration not yet run. Please run database migration first.'
        };
      }
    }),

  updateIdeaFeatureVisibility: adminProcedure
    .input(z.object({
      ideaId: z.string(),
      settings: z.object({
        isFreeQuickOverview: z.boolean(),
        isFreeWhyThisMatters: z.boolean(),
        isFreeDetailedOverview: z.boolean(),
        isFreeTheClaimWhyNow: z.boolean(),
        isFreeWhatToBuild: z.boolean(),
        isFreeExecutionPlan: z.boolean(),
        isFreeMarketGap: z.boolean(),
        isFreeCompetitiveLandscape: z.boolean(),
        isFreeRevenueModel: z.boolean(),
        isFreeExecutionValidation: z.boolean(),
        isFreeChat: z.boolean(),
      })
    }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.dailyIdea.update({
          where: { id: input.ideaId },
          data: input.settings
        });
      } catch (error: any) {
        console.warn('Feature visibility fields not yet migrated, cannot update idea:', error.message);
        throw new Error('Feature visibility migration not yet run. Please run database migration first.');
      }
    }),

  // Prompt Management
  getPrompts: adminProcedure.query(async () => {
    return await prisma.adminPrompts.findMany({
      where: { isActive: true },
      include: {
        updater: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { agentName: 'asc' },
        { promptKey: 'asc' }
      ]
    });
  }),

  getPromptsByAgent: adminProcedure
    .input(z.object({
      agentName: z.string()
    }))
    .query(async ({ input }) => {
      return await prisma.adminPrompts.findMany({
        where: { 
          agentName: input.agentName,
          isActive: true 
        },
        include: {
          updater: {
            select: { name: true, email: true }
          }
        },
        orderBy: { promptKey: 'asc' }
      });
    }),

  updatePrompt: adminProcedure
    .input(z.object({
      id: z.string().optional(),
      agentName: z.string().optional(),
      promptKey: z.string().optional().default('systemPrompt'),
      promptContent: z.string().min(10, "Prompt must be at least 10 characters")
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.id) {
        // Update existing prompt
        return await prisma.adminPrompts.update({
          where: { id: input.id },
          data: { 
            promptContent: input.promptContent,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date()
          }
        });
      } else if (input.agentName) {
        // Create new prompt
        return await prisma.adminPrompts.create({
          data: {
            agentName: input.agentName,
            promptKey: input.promptKey || 'systemPrompt',
            promptContent: input.promptContent,
            updatedBy: ctx.session.user.id
          }
        });
      } else {
        throw new Error('Either id or agentName must be provided');
      }
    }),

  createPrompt: adminProcedure
    .input(z.object({
      agentName: z.string(),
      promptKey: z.string(),
      promptContent: z.string().min(10)
    }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.adminPrompts.create({
        data: {
          ...input,
          updatedBy: ctx.session.user.id
        }
      });
    }),

  deletePrompt: adminProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input }) => {
      return await prisma.adminPrompts.update({
        where: { id: input.id },
        data: { isActive: false }
      });
    }),

  // Analytics endpoints
  getStats: adminProcedure.query(async () => {
    const [totalUsers, totalNuggets] = await Promise.all([
      prisma.user.count(),
      prisma.dailyIdea.count()
    ]);

    return {
      totalUsers,
      totalNuggets
    };
  }),

  getTodaysFeaturedNuggets: adminProcedure.query(async () => {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const schedule = await prisma.featuredNuggetsSchedule.findFirst({
      where: { 
        date: dateOnly,
        isActive: true
      },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    if (!schedule || !schedule.ideaIds?.length) {
      return [];
    }

    // Get the actual ideas
    const ideas = await prisma.dailyIdea.findMany({
      where: {
        id: { in: schedule.ideaIds }
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        createdAt: true,
        _count: {
          select: {
            viewedIdeas: true,
            savedIdeas: true
          }
        },
        claimedIdeas: {
          select: { id: true }
        }
      }
    });

    // Maintain the order from the schedule
    const orderedIdeas = schedule.ideaIds
      .map(id => ideas.find(idea => idea.id === id))
      .filter((idea): idea is NonNullable<typeof idea> => idea !== undefined);

    return orderedIdeas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      category: idea.tags?.[0] || 'General',
      status: 'Published',
      views: idea._count?.viewedIdeas || 0,
      saves: idea._count?.savedIdeas || 0,
      claims: idea.claimedIdeas ? 1 : 0
    }));
  }),

  getEngagementData: adminProcedure
    .input(z.object({
      days: z.number().default(30)
    }))
    .query(async ({ input }) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Get engagement data aggregated by date
      const [viewsData, savesData, claimsData] = await Promise.all([
        // Views by date
        prisma.viewedIdeas.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        // Saves by date
        prisma.savedIdeas.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        // Claims by date
        prisma.claimedIdeas.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      // Create a map of date strings to engagement counts
      const engagementMap = new Map<string, { views: number; saves: number; claims: number }>();

      // Initialize all dates with zero counts
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        engagementMap.set(dateStr, { views: 0, saves: 0, claims: 0 });
      }

      // Populate views
      viewsData.forEach(item => {
        const dateStr = item.createdAt.toISOString().split('T')[0];
        const existing = engagementMap.get(dateStr);
        if (existing) {
          existing.views = item._count.id;
        }
      });

      // Populate saves
      savesData.forEach(item => {
        const dateStr = item.createdAt.toISOString().split('T')[0];
        const existing = engagementMap.get(dateStr);
        if (existing) {
          existing.saves = item._count.id;
        }
      });

      // Populate claims
      claimsData.forEach(item => {
        const dateStr = item.createdAt.toISOString().split('T')[0];
        const existing = engagementMap.get(dateStr);
        if (existing) {
          existing.claims = item._count.id;
        }
      });

      // Convert to array format
      return Array.from(engagementMap.entries()).map(([date, counts]) => ({
        date,
        views: counts.views,
        saves: counts.saves,
        claims: counts.claims
      }));
    }),

});