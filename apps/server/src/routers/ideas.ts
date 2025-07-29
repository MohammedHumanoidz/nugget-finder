import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
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
  getIdeas: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await getIdeasForUser(ctx.session.user.id, input);
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
});