// routers/appRouter.ts
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { agentRouter } from "./agent-router";
import { debugRouter } from "./debug";
import { ideasRouter } from "./ideas";
import { semanticSearchRouter } from "./semantic-search";
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

	// Ideas routes (save/claim functionality)
	ideas: ideasRouter,

	// Semantic search routes
	search: semanticSearchRouter,

	// Debug routes (remove in production)
	debug: debugRouter,
});

export type AppRouter = typeof appRouter;
