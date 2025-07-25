// routers/appRouter.ts
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { agentRouter } from "./agent-router";

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
});

export type AppRouter = typeof appRouter;
