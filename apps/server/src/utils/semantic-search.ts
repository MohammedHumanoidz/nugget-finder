import Fuse from "fuse.js";
import { PorterStemmer } from "natural";
// @ts-ignore - stopword module doesn't have proper types
import { removeStopwords } from "stopword";

// Types for search system
export interface SearchableIdea {
	id: string;
	title: string;
	description: string;
	narrativeHook?: string;
	tags: string[];
	searchCorpus: string;
	ideaScore?: {
		totalScore?: number;
		problemSeverity?: number;
		technicalFeasibility?: number;
		marketTimingScore?: number;
	} | null;
}

export interface PersonalizationContext {
	skills?: string;
	goals?: string;
	categories?: string;
	revenueGoal?: number;
	timeAvailability?: string;
}

export interface SearchResult extends SearchableIdea {
	relevanceScore: number;
	personalizedScore: number;
	matchHighlights?: string[];
}

/**
 * Text preprocessing utilities
 */
export class TextProcessor {
	private static stopWords = new Set([
		"a",
		"an",
		"and",
		"are",
		"as",
		"at",
		"be",
		"by",
		"for",
		"from",
		"has",
		"he",
		"in",
		"is",
		"it",
		"its",
		"of",
		"on",
		"that",
		"the",
		"to",
		"was",
		"were",
		"will",
		"with",
		"the",
		"this",
		"but",
		"they",
		"have",
		"had",
		"what",
		"said",
		"each",
		"which",
		"their",
		"time",
		"if",
		"up",
		"out",
		"many",
		"then",
		"them",
		"can",
		"would",
		"like",
	]);

	/**
	 * Clean and normalize text for processing
	 */
	static preprocessText(text: string): string[] {
		// Convert to lowercase and remove special characters
		const cleanText = text
			.toLowerCase()
			.replace(/[^\w\s]/g, " ")
			.replace(/\s+/g, " ")
			.trim();

		// Split into tokens - allow shorter tokens for acronyms like "SBM"
		const tokens = cleanText.split(" ").filter((token) => token.length > 1);

		// Remove stopwords but preserve important short terms
		const withoutStopwords = removeStopwords(tokens);

		// For very short tokens (like acronyms), skip stemming to preserve them
		const processed = withoutStopwords.map((token: string) => {
			if (token.length <= 3) {
				return token; // Preserve short terms like "SBM", "AI", "API"
			}
			return PorterStemmer.stem(token);
		});

		return processed;
	}

	/**
	 * Create searchable corpus from idea data
	 */
	static createSearchCorpus(idea: Partial<SearchableIdea>): string {
		const fields = [
			idea.title || "",
			idea.description || "",
			idea.narrativeHook || "",
			...(idea.tags || []),
		];

		return fields.join(" ").toLowerCase();
	}

	/**
	 * Calculate Jaccard similarity between two token sets
	 */
	static jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
		const set1 = new Set(tokens1);
		const set2 = new Set(tokens2);

		const intersection = new Set([...set1].filter((x) => set2.has(x)));
		const union = new Set([...set1, ...set2]);

		return union.size === 0 ? 0 : intersection.size / union.size;
	}

	/**
	 * Calculate cosine similarity between two token arrays
	 */
	static cosineSimilarity(tokens1: string[], tokens2: string[]): number {
		// Create frequency maps
		const freq1 = TextProcessor.getTokenFrequency(tokens1);
		const freq2 = TextProcessor.getTokenFrequency(tokens2);

		// Get all unique tokens
		const allTokens = new Set([...tokens1, ...tokens2]);

		// Calculate dot product and magnitudes
		let dotProduct = 0;
		let magnitude1 = 0;
		let magnitude2 = 0;

		for (const token of allTokens) {
			const f1 = freq1[token] || 0;
			const f2 = freq2[token] || 0;

			dotProduct += f1 * f2;
			magnitude1 += f1 * f1;
			magnitude2 += f2 * f2;
		}

		const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
		return magnitude === 0 ? 0 : dotProduct / magnitude;
	}

	/**
	 * Get token frequency map
	 */
	private static getTokenFrequency(tokens: string[]): Record<string, number> {
		const freq: Record<string, number> = {};
		for (const token of tokens) {
			freq[token] = (freq[token] || 0) + 1;
		}
		return freq;
	}

	/**
	 * Calculate fuzzy string match score using edit distance
	 */
	static fuzzyMatch(str1: string, str2: string): number {
		const maxLength = Math.max(str1.length, str2.length);
		if (maxLength === 0) return 1;

		const distance = TextProcessor.levenshteinDistance(str1, str2);
		return (maxLength - distance) / maxLength;
	}

	/**
	 * Calculate Levenshtein distance between two strings
	 */
	private static levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
		for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1, // deletion
					matrix[j - 1][i] + 1, // insertion
					matrix[j - 1][i - 1] + indicator, // substitution
				);
			}
		}

		return matrix[str2.length][str1.length];
	}
}

/**
 * Semantic search engine using classical NLP techniques
 */
export class SemanticSearchEngine {
	private fuseIndex: Fuse<SearchableIdea>;
	private ideas: SearchableIdea[] = [];

	constructor(ideas: SearchableIdea[]) {
		this.ideas = ideas;

		// Configure Fuse.js for fuzzy search - more permissive settings
		const fuseOptions = {
			keys: [
				{ name: "title", weight: 0.4 },
				{ name: "description", weight: 0.3 },
				{ name: "narrativeHook", weight: 0.15 },
				{ name: "searchCorpus", weight: 0.1 },
				{ name: "tags", weight: 0.05 },
			],
			threshold: 0.4, // More permissive than 0.6
			includeScore: true,
			includeMatches: true,
			minMatchCharLength: 1, // Allow single character matches for acronyms
			ignoreLocation: true,
			findAllMatches: true,
		};

		this.fuseIndex = new Fuse(ideas, fuseOptions);
	}

	/**
	 * Perform semantic search with personalization
	 */
	search(
		query: string,
		personalization?: PersonalizationContext,
		options?: { limit?: number; threshold?: number },
	): SearchResult[] {
		const limit = options?.limit || 20;
		const threshold = options?.threshold || 0.01; // Very low threshold for better recall

		// Preprocess the query
		const queryTokens = TextProcessor.preprocessText(query);
		const queryText = query.toLowerCase();

		// Get fuzzy search results from Fuse.js
		const fuseResults = this.fuseIndex.search(query);

		// Calculate semantic scores for all ideas
		const scoredResults: SearchResult[] = this.ideas.map((idea) => {
			// Find Fuse.js score for this idea
			const fuseResult = fuseResults.find((r) => r.item.id === idea.id);
			const fuseScore = fuseResult ? 1 - (fuseResult.score || 1) : 0;

			// Calculate token-based similarities
			const ideaTokens = TextProcessor.preprocessText(idea.searchCorpus);
			const jaccardScore = TextProcessor.jaccardSimilarity(
				queryTokens,
				ideaTokens,
			);
			const cosineScore = TextProcessor.cosineSimilarity(
				queryTokens,
				ideaTokens,
			);

			// Calculate fuzzy match on title and description
			const titleFuzzy = TextProcessor.fuzzyMatch(
				queryText,
				idea.title.toLowerCase(),
			);
			const descFuzzy = TextProcessor.fuzzyMatch(
				queryText,
				idea.description.toLowerCase(),
			);

			// Check for exact matches (boost short queries like "SBM")
			const exactMatchBoost = this.calculateExactMatchBoost(queryText, idea);

			// Check for partial matches in tags and other fields
			const partialMatchBoost = this.calculatePartialMatchBoost(
				queryText,
				idea,
			);

			// Combine base semantic scores with boosters - give much higher weight to exact matches
			const baseScore =
				fuseScore * 0.15 +
				jaccardScore * 0.1 +
				cosineScore * 0.1 +
				titleFuzzy * 0.1 +
				descFuzzy * 0.05 +
				exactMatchBoost * 0.45 + // Much higher weight for exact/fuzzy matches
				partialMatchBoost * 0.05;

			// Calculate personalization boost
			const personalizedBoost = this.calculatePersonalizationBoost(
				idea,
				personalization,
			);

			// Final combined score
			const finalScore = Math.min(baseScore + personalizedBoost, 1.0);

			return {
				...idea,
				relevanceScore: baseScore,
				personalizedScore: finalScore,
				matchHighlights: fuseResult?.matches
					?.map((m) => (typeof m.value === "string" ? m.value : ""))
					.filter(Boolean),
			};
		});

		// Filter by threshold and sort by final score
		return scoredResults
			.filter((result) => result.personalizedScore >= threshold)
			.sort((a, b) => b.personalizedScore - a.personalizedScore)
			.slice(0, limit);
	}

	/**
	 * Calculate boost for exact matches (especially useful for short queries like "SBM")
	 */
	private calculateExactMatchBoost(
		query: string,
		idea: SearchableIdea,
	): number {
		const queryLower = query.toLowerCase().trim();
		const searchFields = [
			idea.title.toLowerCase(),
			idea.description.toLowerCase(),
			idea.narrativeHook?.toLowerCase() || "",
			...idea.tags.map((tag) => tag.toLowerCase()),
			idea.searchCorpus.toLowerCase(),
		];

		console.log(`[DEBUG] Checking exact match for query: "${queryLower}"`);

		// Check for exact substring matches first
		for (const field of searchFields) {
			if (field.includes(queryLower)) {
				console.log(
					`[DEBUG] Found exact match in field: "${field.substring(0, 50)}..."`,
				);
				// Higher boost for shorter queries (like acronyms)
				const lengthBoost = queryLower.length <= 5 ? 1.0 : 0.5;
				return lengthBoost;
			}
		}

		// For short queries, do aggressive fuzzy matching
		if (queryLower.length <= 6) {
			console.log(
				`[DEBUG] Attempting fuzzy match for short query: "${queryLower}"`,
			);

			// Simple character-based fuzzy matching
			let bestScore = 0;

			for (const field of searchFields) {
				const words = field.split(/\s+/);

				for (const word of words) {
					if (word.length >= 2 && word.length <= 8) {
						// Calculate simple edit distance similarity
						const editDistance = this.levenshteinDistance(queryLower, word);
						const maxLength = Math.max(queryLower.length, word.length);
						const similarity = (maxLength - editDistance) / maxLength;

						console.log(
							`[DEBUG] "${queryLower}" vs "${word}": edit_distance=${editDistance}, similarity=${similarity}`,
						);

						// Very permissive threshold for short queries
						if (similarity >= 0.4) {
							bestScore = Math.max(bestScore, similarity);
							console.log(`[DEBUG] New best fuzzy score: ${bestScore}`);
						}
					}
				}
			}

			// If we found a good fuzzy match, return high score
			if (bestScore > 0.4) {
				console.log(`[DEBUG] Returning fuzzy boost: ${bestScore}`);
				return bestScore;
			}
		}

		return 0;
	}

	/**
	 * Special fuzzy matching for acronyms (e.g., "SBMs" should match "SMBs")
	 */
	private calculateAcronymFuzzyMatch(
		query: string,
		searchFields: string[],
	): number {
		let bestScore = 0;
		console.log(`[DEBUG] Fuzzy matching query: "${query}"`);

		for (const field of searchFields) {
			// Extract potential acronyms from the field (2-5 letter sequences)
			const acronymMatches = field.match(/\b[a-z]{2,5}s?\b/g) || [];
			console.log(
				`[DEBUG] Field: "${field.substring(0, 100)}..." found acronyms:`,
				acronymMatches,
			);

			for (const acronym of acronymMatches) {
				// Calculate character-level similarity
				const similarity = this.calculateCharacterSimilarity(query, acronym);
				console.log(
					`[DEBUG] "${query}" vs "${acronym}" similarity: ${similarity}`,
				);
				if (similarity > 0.5) {
					// 50% character similarity for better recall
					bestScore = Math.max(bestScore, similarity);
					console.log(`[DEBUG] New best score: ${bestScore}`);
				}
			}

			// Also check for edit distance on individual words
			const words = field.split(/\s+/);
			for (const word of words) {
				if (word.length >= 2 && word.length <= 8) {
					// More inclusive length range
					const editDistance = this.levenshteinDistance(query, word);
					const similarity =
						(Math.max(query.length, word.length) - editDistance) /
						Math.max(query.length, word.length);
					if (similarity > 0.5) {
						// Lower threshold for better recall
						console.log(
							`[DEBUG] Edit distance "${query}" vs "${word}": distance=${editDistance}, similarity=${similarity}`,
						);
						bestScore = Math.max(bestScore, similarity);
					}
				}
			}
		}

		console.log(`[DEBUG] Final best score for "${query}": ${bestScore}`);
		return bestScore;
	}

	/**
	 * Calculate character-level similarity for short strings
	 */
	private calculateCharacterSimilarity(str1: string, str2: string): number {
		if (str1.length === 0 || str2.length === 0) return 0;

		const chars1 = str1.split("");
		const chars2 = str2.split("");

		let matches = 0;
		const used = new Set<number>();

		// Find character matches allowing for position shifts
		for (let i = 0; i < chars1.length; i++) {
			for (let j = 0; j < chars2.length; j++) {
				if (!used.has(j) && chars1[i] === chars2[j]) {
					matches++;
					used.add(j);
					break;
				}
			}
		}

		// For very similar length strings, give higher scores
		const lengthSimilarity =
			1 -
			Math.abs(chars1.length - chars2.length) /
				Math.max(chars1.length, chars2.length);
		const characterSimilarity =
			matches / Math.max(chars1.length, chars2.length);

		// Combine both metrics, favoring character matches
		return characterSimilarity * 0.8 + lengthSimilarity * 0.2;
	}

	/**
	 * Calculate Levenshtein distance between two strings
	 */
	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
		for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1, // deletion
					matrix[j - 1][i] + 1, // insertion
					matrix[j - 1][i - 1] + indicator, // substitution
				);
			}
		}

		return matrix[str2.length][str1.length];
	}

	/**
	 * Calculate boost for partial matches in specific fields
	 */
	private calculatePartialMatchBoost(
		query: string,
		idea: SearchableIdea,
	): number {
		const queryLower = query.toLowerCase();
		let boost = 0;

		// Check tags for partial matches
		for (const tag of idea.tags) {
			if (
				tag.toLowerCase().includes(queryLower) ||
				queryLower.includes(tag.toLowerCase())
			) {
				boost += 0.3;
			}
		}

		// Check if query words appear in title
		const queryWords = queryLower.split(" ");
		const titleWords = idea.title.toLowerCase().split(" ");

		for (const queryWord of queryWords) {
			for (const titleWord of titleWords) {
				if (queryWord.length > 2 && titleWord.includes(queryWord)) {
					boost += 0.2;
				}
			}
		}

		// For short queries, add n-gram similarity boost
		if (queryLower.length <= 6) {
			const ngramBoost = this.calculateNgramSimilarity(queryLower, [
				idea.title.toLowerCase(),
				idea.description.toLowerCase(),
				...idea.tags.map((tag) => tag.toLowerCase()),
			]);
			boost += ngramBoost * 0.3;
		}

		return Math.min(boost, 1.0);
	}

	/**
	 * Calculate n-gram similarity for better matching of short queries
	 */
	private calculateNgramSimilarity(query: string, fields: string[]): number {
		let bestScore = 0;

		// Generate bigrams and trigrams from query
		const queryNgrams = new Set([
			...this.generateNgrams(query, 2),
			...this.generateNgrams(query, 3),
		]);

		if (queryNgrams.size === 0) return 0;

		for (const field of fields) {
			const words = field.split(/\s+/);

			for (const word of words) {
				if (word.length >= 2 && word.length <= 8) {
					const wordNgrams = new Set([
						...this.generateNgrams(word, 2),
						...this.generateNgrams(word, 3),
					]);

					if (wordNgrams.size > 0) {
						const intersection = new Set(
							[...queryNgrams].filter((x) => wordNgrams.has(x)),
						);
						const union = new Set([...queryNgrams, ...wordNgrams]);
						const similarity = intersection.size / union.size;

						if (similarity > 0.3) {
							bestScore = Math.max(bestScore, similarity);
						}
					}
				}
			}
		}

		return bestScore;
	}

	/**
	 * Generate n-grams from a string
	 */
	private generateNgrams(str: string, n: number): string[] {
		if (str.length < n) return [str];

		const ngrams: string[] = [];
		for (let i = 0; i <= str.length - n; i++) {
			ngrams.push(str.substring(i, i + n));
		}
		return ngrams;
	}

	/**
	 * Calculate personalization boost score
	 */
	private calculatePersonalizationBoost(
		idea: SearchableIdea,
		personalization?: PersonalizationContext,
	): number {
		if (!personalization) return 0;

		let boost = 0;
		const ideaText = idea.searchCorpus.toLowerCase();

		// Skills match boost
		if (personalization.skills) {
			const skillTokens = TextProcessor.preprocessText(personalization.skills);
			const ideaTokens = TextProcessor.preprocessText(ideaText);
			const skillMatch = TextProcessor.jaccardSimilarity(
				skillTokens,
				ideaTokens,
			);
			boost += skillMatch * 0.3;
		}

		// Goals/build intent match boost
		if (personalization.goals) {
			const goalTokens = TextProcessor.preprocessText(personalization.goals);
			const ideaTokens = TextProcessor.preprocessText(ideaText);
			const goalMatch = TextProcessor.cosineSimilarity(goalTokens, ideaTokens);
			boost += goalMatch * 0.4;
		}

		// Categories match boost
		if (personalization.categories) {
			const categoryTokens = TextProcessor.preprocessText(
				personalization.categories,
			);
			const ideaTokens = TextProcessor.preprocessText(ideaText);
			const categoryMatch = TextProcessor.jaccardSimilarity(
				categoryTokens,
				ideaTokens,
			);
			boost += categoryMatch * 0.2;
		}

		// Complexity/feasibility alignment (based on idea score)
		if (
			personalization.timeAvailability &&
			idea.ideaScore?.technicalFeasibility
		) {
			const timeBonus = this.getTimeComplexityBonus(
				personalization.timeAvailability,
				idea.ideaScore.technicalFeasibility,
			);
			boost += timeBonus * 0.1;
		}

		return Math.min(boost, 0.3); // Cap boost at 30%
	}

	/**
	 * Calculate time/complexity alignment bonus
	 */
	private getTimeComplexityBonus(
		timeAvailability: string,
		feasibility: number,
	): number {
		const timeValue = timeAvailability.toLowerCase();

		if (timeValue.includes("part-time") || timeValue.includes("weekend")) {
			// Prefer easier ideas for part-time builders
			return feasibility > 7 ? 0.8 : feasibility > 5 ? 0.5 : 0.2;
		}
		if (timeValue.includes("full-time")) {
			// Can handle more complex ideas
			return feasibility > 5 ? 0.6 : 0.3;
		}

		return 0.5; // Default neutral bonus
	}

	/**
	 * Update the search index with new ideas
	 */
	updateIndex(ideas: SearchableIdea[]): void {
		this.ideas = ideas;
		this.fuseIndex = new Fuse(ideas, {
			keys: [
				{ name: "title", weight: 0.4 },
				{ name: "description", weight: 0.3 },
				{ name: "narrativeHook", weight: 0.15 },
				{ name: "searchCorpus", weight: 0.1 },
				{ name: "tags", weight: 0.05 },
			],
			threshold: 0.4,
			includeScore: true,
			includeMatches: true,
			minMatchCharLength: 1,
			ignoreLocation: true,
			findAllMatches: true,
		});
	}
}
