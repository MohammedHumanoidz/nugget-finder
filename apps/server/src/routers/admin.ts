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
});