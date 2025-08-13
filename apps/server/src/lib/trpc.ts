import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

// Admin procedure - moved here to avoid circular dependency
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	// Type assertion to include role field that will be available after migration
	const user = ctx.session?.user as (typeof ctx.session.user) & { role?: string };
	
	if (!user?.role || user.role !== 'admin') {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next({ ctx });
});
