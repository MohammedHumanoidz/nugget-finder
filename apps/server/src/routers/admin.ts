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
});