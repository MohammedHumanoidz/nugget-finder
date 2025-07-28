// routers/appRouter.ts
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { agentRouter } from "./agent-router";
import { subscriptionRouter } from "./subscription";

export const appRouter = router({
	// Health check
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	// Private data example
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// Agent routes
	agents: agentRouter,

	// Subscription routes
	subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
