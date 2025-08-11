// Server-side authenticated API utilities

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { cookies } from "next/headers";
import { cache } from "react";
import type { AppRouter } from "../../../server/types";

// Get server URL with fallback
const getServerUrl = () => {
	return process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
};

// Create an authenticated server-side tRPC client
const createAuthenticatedTrpcClient = async () => {
	const cookieStore = await cookies();

	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${getServerUrl()}/trpc`,
				headers: async () => {
					// Forward all cookies for authentication
					const cookieHeader = cookieStore.toString();
					return {
						cookie: cookieHeader,
					};
				},
				fetch(url, options) {
					return fetch(url, {
						...options,
						// Add caching for better performance
						next: { revalidate: 0 }, // Don't cache authenticated requests
					});
				},
			}),
		],
	});
};

// Cached function to get authenticated idea by ID
export const getAuthenticatedIdeaById = cache(async (id: string) => {
	try {
		console.log(`[DEBUG] Attempting to fetch authenticated idea ${id}...`);
		const client = await createAuthenticatedTrpcClient();
		const result = await client.ideas.getIdeaById.query({ ideaId: id });
		console.log("[DEBUG] Authenticated fetch successful:", !!result);
		return result;
	} catch (error: any) {
		console.error("[DEBUG] Authenticated fetch failed:", {
			message: error?.message,
			name: error?.name,
			cause: error?.cause,
			data: error?.data,
		});

		// Re-throw specific errors to be handled by the page
		// Check for VIEW_LIMIT_EXCEEDED in multiple places where it might appear
		if (
			error?.message === "VIEW_LIMIT_EXCEEDED" ||
			error?.message?.includes("VIEW_LIMIT_EXCEEDED") ||
			error?.data?.message?.includes("VIEW_LIMIT_EXCEEDED") ||
			(error?.data?.code === "INTERNAL_SERVER_ERROR" &&
				error?.message?.includes("VIEW_LIMIT_EXCEEDED"))
		) {
			console.log("[DEBUG] Re-throwing VIEW_LIMIT_EXCEEDED error");
			throw new Error("VIEW_LIMIT_EXCEEDED");
		}

		// For other errors, return null to allow fallback
		console.log("[DEBUG] Returning null for fallback");
		return null;
	}
});

// Cached function to get user limits
export const getUserLimits = cache(async () => {
	try {
		console.log("Fetching user limits...");
		const client = await createAuthenticatedTrpcClient();
		const result = await client.ideas.getLimits.query();
		console.log("User limits fetch successful:", result);
		return result;
	} catch (error) {
		console.error("User limits fetch failed:", error);
		return null;
	}
});
