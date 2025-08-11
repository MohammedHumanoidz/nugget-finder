import type { MetadataRoute } from "next";

// This function generates the robots.txt file at build time.
// It is the recommended approach in Next.js App Router.
// Documentation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nuggetfinder.ai";

	return {
		rules: [
			// Default rule for all user agents
			{
				userAgent: "*",
				allow: "/",
				crawlDelay: 1, // Optional: delay between crawls
			},
			// Specific rules for AI crawlers to ensure they can access content
			{
				userAgent: [
					"GPTBot",
					"ClaudeBot",
					"PerplexityBot",
					"ChatGPT-User",
					"CCBot",
					"anthropic-ai",
					"Claude-Web",
				],
				allow: "/",
			},
			// Specific rules for major search engines
			{
				userAgent: [
					"Googlebot",
					"Bingbot",
					"Slurp",
					"DuckDuckBot",
					"Baiduspider",
					"YandexBot",
				],
				allow: "/",
			},
			// Block crawlers that can be overly aggressive or are not desired
			{
				userAgent: ["SemrushBot", "AhrefsBot", "MJ12bot"],
				disallow: "/", // Disallow access to the entire site for these bots
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`, // Points crawlers to the sitemap
	};
}
