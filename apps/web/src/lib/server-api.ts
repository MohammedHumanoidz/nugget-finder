// Server-side API utilities for SSR

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { cache } from "react";
import type { AppRouter } from "../../../server/types";

// Get server URL with fallback
const getServerUrl = () => {
	return process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
};

// Create a server-side tRPC client
const serverTrpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getServerUrl()}/trpc`,
			// Don't include credentials for server-side requests
			fetch(url, options) {
				return fetch(url, {
					...options,
					// Add caching for better performance
					next: { revalidate: 60 }, // Revalidate every 60 seconds
				});
			},
		}),
	],
});

// Fallback HTTP fetch function for tRPC queries
async function fallbackFetch<T>(
	endpoint: string,
	input: any,
): Promise<T | null> {
	try {
		console.log(
			`Attempting fallback fetch to: ${getServerUrl()}/trpc/${endpoint}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: input }))}`,
		);

		// Format as tRPC query request
		const queryParams = new URLSearchParams({
			batch: "1",
			input: JSON.stringify({ 0: input }),
		});

		const response = await fetch(
			`${getServerUrl()}/trpc/${endpoint}?${queryParams}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				next: { revalidate: 60 },
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Fallback fetch response:", data);

		// Handle tRPC batch response format
		return data[0]?.result?.data || data.result?.data || data;
	} catch (error) {
		console.error(`Fallback fetch failed for ${endpoint}:`, error);
		return null;
	}
}

// Cached function to get daily ideas
export const getDailyIdeas = cache(async () => {
	try {
		console.log("Attempting to fetch daily ideas via tRPC client...");
		const result = await serverTrpcClient.agents.getDailyIdeas.query({
			limit: 50,
			offset: 0,
		});
		console.log("tRPC fetch successful:", result);
		return result;
	} catch (error) {
		console.error("tRPC fetch failed, trying fallback:", error);

		// Try fallback HTTP request
		const fallbackResult = await fallbackFetch<{ ideas: any[] }>(
			"agents.getDailyIdeas",
			{
				limit: 50,
				offset: 0,
			},
		);

		return fallbackResult || { ideas: [] };
	}
});

// Cached function to get idea by ID
export const getIdeaById = cache(async (id: string) => {
	try {
		console.log(`Attempting to fetch idea ${id} via tRPC client...`);
		const result = await serverTrpcClient.agents.getIdeaById.query({ id });
		console.log("tRPC fetch successful:", result);
		return result;
	} catch (error) {
		console.error("tRPC fetch failed, trying fallback:", error);

		// Try fallback HTTP request
		const fallbackResult = await fallbackFetch<any>("agents.getIdeaById", {
			id,
		});

		return fallbackResult;
	}
});

// Cached function for semantic search
export const semanticSearchIdeas = cache(
	async (query: string, limit = 12, offset = 0) => {
		try {
			console.log(
				`Attempting semantic search for: "${query}" via tRPC client...`,
			);
			// TODO: Implement semanticSearch endpoint in agent router
			console.log(
				"Semantic search not implemented yet, returning empty result",
			);
			const result = {
				ideas: [],
				pagination: { total: 0, limit, offset, hasMore: false },
			};
			console.log("Semantic search successful:", result);
			return result;
		} catch (error) {
			console.error("Semantic search failed, trying fallback:", error);

			// Try fallback HTTP request
			const fallbackResult = await fallbackFetch<{
				ideas: any[];
				hasMore: boolean;
			}>("agents.semanticSearch", {
				query,
				limit,
				offset,
			});

			return fallbackResult || { ideas: [], hasMore: false };
		}
	},
);

// Get latest 3 ideas for homepage - sorted by creation date and score
export const getTodaysTopIdeas = cache(async () => {
	try {
		console.log("Fetching today's top ideas with scheduled check...");
		
		// First check for scheduled featured nuggets
		// Create a UTC date for today to match how admin panel saves dates
		const now = new Date();
		const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
		
		console.log("=== FEATURED NUGGETS DEBUG START ===");
		console.log("Current local time:", now.toString());
		console.log("Current UTC time:", now.toUTCString());
		console.log("Query date (UTC):", today.toISOString());
		console.log("Query date parts:", {
			year: now.getUTCFullYear(),
			month: now.getUTCMonth(),
			date: now.getUTCDate()
		});
		
		try {
			console.log("Making admin.getPublicFeaturedSchedule query...");
			const scheduled = await serverTrpcClient.admin.getPublicFeaturedSchedule.query({
				date: today.toISOString()
			});
			
			console.log("Admin query response:", JSON.stringify(scheduled, null, 2));
			
			if (scheduled?.ideaIds?.length && scheduled.ideaIds.length > 0) {
				console.log(`✅ Found ${scheduled.ideaIds.length} scheduled ideas for today`);
				console.log("Scheduled idea IDs:", scheduled.ideaIds);
				
				// Fetch the scheduled ideas in order
				console.log("Fetching individual scheduled ideas...");
				//@ts-ignore
				const scheduledIdeas = await Promise.all(
					scheduled.ideaIds.map(async (id, index) => {
						try {
							console.log(`Fetching idea ${index + 1}/${scheduled.ideaIds.length}: ${id}`);
							const idea = await serverTrpcClient.agents.getIdeaById.query({ id });
							console.log(`✅ Successfully fetched idea: ${idea?.title || 'Unknown'}`);
							return idea;
						} catch (error) {
							console.error(`❌ Failed to fetch scheduled idea ${id}:`, error);
							return null;
						}
					})
				);
				
				const validIdeas = scheduledIdeas.filter(Boolean);
				console.log(`Valid ideas count: ${validIdeas.length}`);
				
				if (validIdeas.length > 0) {
					console.log(`🎯 Returning ${validIdeas.length} scheduled ideas`);
					console.log("Scheduled ideas titles:", validIdeas.map(idea => idea?.title));
					console.log("=== FEATURED NUGGETS DEBUG END ===");
					return validIdeas.slice(0, 3);
				}
				
				console.log("❌ No valid ideas after filtering");
			} else {
				console.log("❌ No scheduled ideas found or empty ideaIds array");
				console.log("Scheduled object:", scheduled);
			}
		} catch (adminError) {
			console.error("❌ Admin query failed:", adminError);
			console.log("Error details:", {
				message: adminError instanceof Error ? adminError.message : String(adminError),
				stack: adminError instanceof Error ? adminError.stack : undefined,
				cause: adminError instanceof Error ? adminError.cause : undefined
			});
		}
		
		console.log("📋 Using fallback logic");
		console.log("=== FEATURED NUGGETS DEBUG END ===");

		// Fallback to existing logic
		const result = await serverTrpcClient.agents.getDailyIdeas.query({
			limit: 50,
			offset: 0,
		});

		if (result?.ideas?.length > 0) {
			const latestIdeas = result.ideas
				.sort((a: any, b: any) => {
					const dateA = new Date(a.createdAt).getTime();
					const dateB = new Date(b.createdAt).getTime();
					if (dateB !== dateA) {
						return dateB - dateA;
					}
					const scoreA = a.ideaScore?.overallScore || 0;
					const scoreB = b.ideaScore?.overallScore || 0;
					return scoreB - scoreA;
				})
				.slice(0, 3);

			console.log(`Found ${latestIdeas.length} fallback ideas`);
			return latestIdeas;
		}
	} catch (error) {
		console.error("Error fetching today's top ideas:", error);
		return [];
	}
});

// Get latest 6 ideas for discover section
export const getLatestIdeasForDiscover = cache(async () => {
	try {
		console.log("Fetching latest 6 ideas for discover section...");

		// Try the tRPC client first
		try {
			const result = await serverTrpcClient.agents.getDailyIdeas.query({
				limit: 50,
				offset: 0,
			});

			if (result?.ideas?.length > 0) {
				// Sort by creation date (most recent first) and score
				const latestIdeas = result.ideas
					.sort((a: any, b: any) => {
						// First sort by creation date (most recent first)
						const dateA = new Date(a.createdAt).getTime();
						const dateB = new Date(b.createdAt).getTime();
						if (dateB !== dateA) {
							return dateB - dateA;
						}
						// Then by score if dates are the same
						const scoreA = a.ideaScore?.overallScore || 0;
						const scoreB = b.ideaScore?.overallScore || 0;
						return scoreB - scoreA;
					})
					.slice(0, 6);

				console.log(`Found ${latestIdeas.length} latest ideas for discover`);
				return latestIdeas;
			}
		} catch (error) {
			console.error("tRPC fetch failed:", error);
		}
	} catch (error) {
		console.error("Error fetching latest ideas for discover:", error);
		return [];
	}
});

// Generate static params for better performance (optional)
export async function generateStaticParams() {
	try {
		const response = await getDailyIdeas();
		if (!response?.ideas) return [];

		return response.ideas.slice(0, 10).map((idea: any) => ({
			id: idea.id,
		}));
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}
