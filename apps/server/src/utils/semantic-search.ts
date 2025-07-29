import Fuse from 'fuse.js';
import { PorterStemmer } from 'natural';
// @ts-ignore - stopword module doesn't have proper types
import { removeStopwords } from 'stopword';

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
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time',
    'if', 'up', 'out', 'many', 'then', 'them', 'can', 'would', 'like'
  ]);

  /**
   * Clean and normalize text for processing
   */
  static preprocessText(text: string): string[] {
    // Convert to lowercase and remove special characters
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into tokens
    const tokens = cleanText.split(' ').filter(token => token.length > 2);

    // Remove stopwords
    const withoutStopwords = removeStopwords(tokens);

    // Apply stemming
    const stemmed = withoutStopwords.map((token: string) => PorterStemmer.stem(token));

    return stemmed;
  }

  /**
   * Create searchable corpus from idea data
   */
  static createSearchCorpus(idea: Partial<SearchableIdea>): string {
    const fields = [
      idea.title || '',
      idea.description || '',
      idea.narrativeHook || '',
      ...(idea.tags || [])
    ];

    return fields.join(' ').toLowerCase();
  }

  /**
   * Calculate Jaccard similarity between two token sets
   */
  static jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate cosine similarity between two token arrays
   */
  static cosineSimilarity(tokens1: string[], tokens2: string[]): number {
    // Create frequency maps
    const freq1 = this.getTokenFrequency(tokens1);
    const freq2 = this.getTokenFrequency(tokens2);
    
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
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
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
    
    // Configure Fuse.js for fuzzy search
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'narrativeHook', weight: 0.2 },
        { name: 'searchCorpus', weight: 0.1 }
      ],
      threshold: 0.6,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    };

    this.fuseIndex = new Fuse(ideas, fuseOptions);
  }

  /**
   * Perform semantic search with personalization
   */
  search(
    query: string,
    personalization?: PersonalizationContext,
    options?: { limit?: number; threshold?: number }
  ): SearchResult[] {
    const limit = options?.limit || 20;
    const threshold = options?.threshold || 0.5;

    // Preprocess the query
    const queryTokens = TextProcessor.preprocessText(query);
    const queryText = query.toLowerCase();

    // Get fuzzy search results from Fuse.js
    const fuseResults = this.fuseIndex.search(query);

    // Calculate semantic scores for all ideas
    const scoredResults: SearchResult[] = this.ideas.map(idea => {
      // Find Fuse.js score for this idea
      const fuseResult = fuseResults.find(r => r.item.id === idea.id);
      const fuseScore = fuseResult ? (1 - (fuseResult.score || 1)) : 0;

      // Calculate token-based similarities
      const ideaTokens = TextProcessor.preprocessText(idea.searchCorpus);
      const jaccardScore = TextProcessor.jaccardSimilarity(queryTokens, ideaTokens);
      const cosineScore = TextProcessor.cosineSimilarity(queryTokens, ideaTokens);
      
      // Calculate fuzzy match on title and description
      const titleFuzzy = TextProcessor.fuzzyMatch(queryText, idea.title.toLowerCase());
      const descFuzzy = TextProcessor.fuzzyMatch(queryText, idea.description.toLowerCase());

      // Combine base semantic scores
      const baseScore = (
        fuseScore * 0.3 +
        jaccardScore * 0.25 +
        cosineScore * 0.25 +
        titleFuzzy * 0.15 +
        descFuzzy * 0.05
      );

      // Calculate personalization boost
      const personalizedBoost = this.calculatePersonalizationBoost(
        idea,
        personalization
      );

      // Final combined score
      const finalScore = Math.min(baseScore + personalizedBoost, 1.0);

      return {
        ...idea,
        relevanceScore: baseScore,
        personalizedScore: finalScore,
        matchHighlights: fuseResult?.matches?.map(m => 
          typeof m.value === 'string' ? m.value : ''
        ).filter(Boolean)
      };
    });

    // Filter by threshold and sort by final score
    return scoredResults
      .filter(result => result.personalizedScore >= threshold)
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);
  }

  /**
   * Calculate personalization boost score
   */
  private calculatePersonalizationBoost(
    idea: SearchableIdea,
    personalization?: PersonalizationContext
  ): number {
    if (!personalization) return 0;

    let boost = 0;
    const ideaText = idea.searchCorpus.toLowerCase();

    // Skills match boost
    if (personalization.skills) {
      const skillTokens = TextProcessor.preprocessText(personalization.skills);
      const ideaTokens = TextProcessor.preprocessText(ideaText);
      const skillMatch = TextProcessor.jaccardSimilarity(skillTokens, ideaTokens);
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
      const categoryTokens = TextProcessor.preprocessText(personalization.categories);
      const ideaTokens = TextProcessor.preprocessText(ideaText);
      const categoryMatch = TextProcessor.jaccardSimilarity(categoryTokens, ideaTokens);
      boost += categoryMatch * 0.2;
    }

    // Complexity/feasibility alignment (based on idea score)
    if (personalization.timeAvailability && idea.ideaScore?.technicalFeasibility) {
      const timeBonus = this.getTimeComplexityBonus(
        personalization.timeAvailability,
        idea.ideaScore.technicalFeasibility
      );
      boost += timeBonus * 0.1;
    }

    return Math.min(boost, 0.3); // Cap boost at 30%
  }

  /**
   * Calculate time/complexity alignment bonus
   */
  private getTimeComplexityBonus(timeAvailability: string, feasibility: number): number {
    const timeValue = timeAvailability.toLowerCase();
    
    if (timeValue.includes('part-time') || timeValue.includes('weekend')) {
      // Prefer easier ideas for part-time builders
      return feasibility > 7 ? 0.8 : feasibility > 5 ? 0.5 : 0.2;
    } else if (timeValue.includes('full-time')) {
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
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'narrativeHook', weight: 0.2 },
        { name: 'searchCorpus', weight: 0.1 }
      ],
      threshold: 0.6,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    });
  }
}