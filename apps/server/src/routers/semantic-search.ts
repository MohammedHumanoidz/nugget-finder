import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { prisma } from "../utils/configs/db.config";
import {
	type PersonalizationContext,
	type SearchableIdea,
	SemanticSearchEngine,
	TextProcessor,
} from "../utils/semantic-search";

// Input validation schemas
const semanticSearchSchema = z.object({
	query: z.string().min(1, "Search query is required"),
	personalization: z
		.object({
			skills: z.string().optional(),
			goals: z.string().optional(),
			categories: z.string().optional(),
			revenueGoal: z.number().optional(),
			timeAvailability: z.string().optional(),
		})
		.optional(),
	options: z
		.object({
			limit: z.number().min(1).max(50).optional().default(20),
			threshold: z.number().min(0).max(1).optional().default(0.15),
			strict: z.boolean().optional().default(false),
		})
		.optional()
		.default(() => ({ limit: 20, threshold: 0.15, strict: false })),
});

// Global search engine instance (in production, consider caching)
let searchEngine: SemanticSearchEngine | null = null;
let lastIndexUpdate = 0;
const INDEX_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const semanticSearchRouter = router({
	/**
	 * Perform semantic search on startup ideas
	 */
	search: publicProcedure
		.input(semanticSearchSchema)
		.mutation(async ({ input }) => {
			try {
				const { query, personalization, options } = input;

				// Load and prepare search index
				const searchableIdeas = await loadSearchableIdeas();

				// Update search engine if needed
				if (!searchEngine || Date.now() - lastIndexUpdate > INDEX_CACHE_TTL) {
					searchEngine = new SemanticSearchEngine(searchableIdeas);
					lastIndexUpdate = Date.now();
				}

				// Perform the search
				const results = searchEngine.search(query, personalization, {
					limit: options.limit,
					threshold: options.strict ? 0.7 : options.threshold,
				});

				// Transform results for frontend
				const transformedResults = results.map((result) => ({
					id: result.id,
					title: result.title,
					description: result.description,
					narrativeHook: result.narrativeHook,
					tags: result.tags,
					ideaScore: result.ideaScore,
					relevanceScore: Math.round(result.relevanceScore * 100),
					personalizedScore: Math.round(result.personalizedScore * 100),
					matchHighlights: result.matchHighlights || [],
					// Include personalization matches for badges
					personalizationMatches: getPersonalizationMatches(
						result,
						personalization,
					),
				}));

				return {
					results: transformedResults,
					query,
					totalResults: transformedResults.length,
					searchTime: Date.now() - lastIndexUpdate,
					hasPersonalization: !!personalization,
					threshold: options.strict ? 70 : Math.round(options.threshold * 100),
				};
			} catch (error) {
				console.error("Semantic search error:", error);
				throw new Error("Failed to perform semantic search");
			}
		}),

	/**
	 * Get search suggestions based on partial query
	 */
	suggestions: publicProcedure
		.input(
			z.object({
				partialQuery: z.string(),
				limit: z.number().optional().default(5),
			}),
		)
		.query(async ({ input }) => {
			try {
				const { partialQuery, limit } = input;

				if (partialQuery.length < 2) {
					return { suggestions: [] };
				}

				// Load ideas for suggestion generation
				const ideas = await prisma.dailyIdea.findMany({
					select: {
						title: true,
						description: true,
						tags: true,
					},
					take: 100, // Sample for performance
				});

				// Extract common terms and phrases
				const suggestions = generateSearchSuggestions(
					ideas,
					partialQuery,
					limit,
				);

				return { suggestions };
			} catch (error) {
				console.error("Search suggestions error:", error);
				return { suggestions: [] };
			}
		}),

	/**
	 * Get search analytics and popular queries
	 */
	analytics: publicProcedure.query(async () => {
		try {
			// In a real app, you'd track search queries in a separate table
			const totalIdeas = await prisma.dailyIdea.count();

			// Sample popular search terms (in production, track actual queries)
			const popularTerms = [
				"AI",
				"SaaS",
				"mobile app",
				"e-commerce",
				"productivity",
				"healthcare",
				"education",
				"fintech",
				"automation",
				"analytics",
			];

			return {
				totalIdeas,
				popularTerms,
				searchFeatures: {
					fuzzyMatching: true,
					personalization: true,
					semanticScoring: true,
				},
			};
		} catch (error) {
			console.error("Search analytics error:", error);
			throw new Error("Failed to get search analytics");
		}
	}),
});

/**
 * Load all daily ideas and prepare them for search
 */
async function loadSearchableIdeas(): Promise<SearchableIdea[]> {
	const ideas = await prisma.dailyIdea.findMany({
		include: {
			ideaScore: true,
		},
	});

	return ideas.map((idea) => {
		const searchableIdea: SearchableIdea = {
			id: idea.id,
			title: idea.title,
			description: idea.description,
			narrativeHook: idea.narrativeHook || undefined,
			tags: idea.tags || [],
			ideaScore: idea.ideaScore
				? {
						totalScore: idea.ideaScore.totalScore,
						problemSeverity: idea.ideaScore.problemSeverity,
						technicalFeasibility: idea.ideaScore.technicalFeasibility,
						marketTimingScore: idea.ideaScore.marketTimingScore,
					}
				: null,
			searchCorpus: "", // Will be set below
		};

		// Create search corpus
		searchableIdea.searchCorpus =
			TextProcessor.createSearchCorpus(searchableIdea);

		return searchableIdea;
	});
}

/**
 * Identify personalization matches for badge display
 */
function getPersonalizationMatches(
	result: any,
	personalization?: PersonalizationContext,
): string[] {
	if (!personalization) return [];

	const matches: string[] = [];
	const ideaText = result.searchCorpus.toLowerCase();

	// Check for skill matches
	if (personalization.skills) {
		const skills = personalization.skills.toLowerCase().split(/[,\s]+/);
		const matchedSkills = skills.filter(
			(skill) => skill.length > 2 && ideaText.includes(skill),
		);
		matches.push(...matchedSkills.map((skill) => `Skill: ${skill}`));
	}

	// Check for category matches
	if (personalization.categories) {
		const categories = personalization.categories.toLowerCase().split(/[,\s]+/);
		const matchedCategories = categories.filter(
			(cat) => cat.length > 2 && ideaText.includes(cat),
		);
		matches.push(...matchedCategories.map((cat) => `Category: ${cat}`));
	}

	// Check for goal alignment
	if (personalization.goals) {
		const goalKeywords = ["app", "platform", "tool", "service", "solution"];
		const matchedGoals = goalKeywords.filter(
			(keyword) =>
				personalization.goals!.toLowerCase().includes(keyword) &&
				ideaText.includes(keyword),
		);
		matches.push(...matchedGoals.map((goal) => `Goal: ${goal}`));
	}

	return matches.slice(0, 3); // Limit to top 3 matches
}

/**
 * Generate search suggestions based on existing content
 */
function generateSearchSuggestions(
	ideas: Array<{ title: string; description: string; tags: string[] }>,
	partialQuery: string,
	limit: number,
): string[] {
	const query = partialQuery.toLowerCase();
	const suggestions = new Set<string>();

	// Extract suggestions from titles and tags
	for (const idea of ideas) {
		// Title-based suggestions
		if (idea.title.toLowerCase().includes(query)) {
			suggestions.add(idea.title);
		}

		// Tag-based suggestions
		for (const tag of idea.tags) {
			if (tag.toLowerCase().includes(query)) {
				suggestions.add(tag);
			}
		}

		// Extract key phrases from descriptions
		const words = idea.description.toLowerCase().split(/\s+/);
		for (let i = 0; i < words.length - 1; i++) {
			const phrase = `${words[i]} ${words[i + 1]}`;
			if (phrase.includes(query) && phrase.length > query.length) {
				suggestions.add(phrase);
			}
		}
	}

	// Common search templates
	const templates = [
		`${query} startup idea`,
		`${query} business`,
		`${query} app`,
		`${query} platform`,
		`${query} tool`,
		`AI-powered ${query}`,
		`${query} for small business`,
		`${query} SaaS`,
	];

	templates.forEach((template) => {
		if (template.length > partialQuery.length + 3) {
			suggestions.add(template);
		}
	});

	return Array.from(suggestions).slice(0, limit);
}
