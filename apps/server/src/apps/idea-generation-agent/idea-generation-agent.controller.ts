import { generateText } from "ai";
import { IdeaGenerationAgentService } from "@/apps/idea-generation-agent/idea-generation-agent.service";
import type {
	AgentContext,
	CompetitiveData,
	MonetizationData,
	ProblemGapData,
	SynthesizedIdea,
	TrendData,
} from "@/types/apps/idea-generation-agent";
import { openrouter, perplexity } from "@/utils/configs/ai.config";

const IdeaGenerationAgentController = {
	/**
	 * TrendResearchAgent - Discover emerging AI/tech trends with market timing signals
	 * Uses Perplexity Deep Research for comprehensive trend analysis
	 */
	async trendResearchAgent(): Promise<TrendData | null> {
		try {
			const systemPrompt = `You are a global trend research analyst. Your role is to surface emerging **business-relevant trends** (not just tech) across industries including SaaS, consumer, enterprise, logistics, HR, health, education, and finance.

Focus only on trends that:
- Show signs of early market pull, buyer adoption, or unmet demand
- Have supporting indicators like Google Trends spikes, social interest, funding rounds, regulation changes, or search volume
- Indicate opportunity for new product creation (B2B or B2C)

Avoid vague trends or general consumer behavior shifts without proof of commercial opportunity.

Return structured JSON only:
{
  "title": "string",
  "description": "string",
  "trendStrength": number (1-10),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH|REGULATORY_CHANGE|MARKET_SHIFT|CONSUMER_BEHAVIOR|SUPPLY_CHAIN|OTHER",
  "timingUrgency": number (1-10),
  "supportingData": ["credible data point 1", "signal or quote", "metric or headline"]
}

`;

			const userPrompt = `What is one powerful, emerging business trend from the past 7-14 days?
      Focus on trends with real commercial momentum — buyer pull, unmet demand, pricing inefficiencies, or shifts in consumer/business behavior. Must be actionable for SaaS/B2B/B2C founders.
`;

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"high",
				"sonar-deep-research",
			);

			if (!response?.choices?.[0]?.message?.content) {
				throw new Error("No response from Perplexity");
			}

			const trendData = JSON.parse(
				response.choices[0].message.content,
			) as TrendData;
			return trendData;
		} catch (error) {
			console.error("TrendResearchAgent error:", error);
			return null;
		}
	},

	/**
	 * ProblemGapAgent - Identify market problems AND gaps in single pass
	 * Uses Perplexity Sonar for market research
	 */
	async problemGapAgent(context: AgentContext): Promise<ProblemGapData | null> {
		try {
			const systemPrompt = `You are a business opportunity mapper. Given a trend, identify:
- Real-world problems rooted in specific customer roles or industries
- Gaps in how those problems are addressed today (inefficiencies, lack of tooling, unmet emotional/functional needs)

Your job is to frame problems in a way a founder could build against them.

Return this JSON:
{
  "problems": ["problem 1", "problem 2"],
  "gaps": [{
    "title": "string",
    "description": "string",
    "impact": "string",
    "target": "string (persona or market)",
    "opportunity": "string"
  }]
}
`;

			const userPrompt = `Given this trend: "${context.trends?.title} - ${context.trends?.description}",

Identify 2-3 painful, specific problems and explain the gaps in how current solutions fail. Prioritize areas with commercial potential (e.g. friction in workflows, outdated tooling, underserved personas, invisible costs).
`;

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"medium",
				"sonar",
			);

			if (!response?.choices?.[0]?.message?.content) {
				throw new Error("No response from Perplexity");
			}

			const problemGapData = JSON.parse(
				response.choices[0].message.content,
			) as ProblemGapData;
			return problemGapData;
		} catch (error) {
			console.error("ProblemGapAgent error:", error);
			return null;
		}
	},

	/**
	 * CompetitiveIntelligenceAgent - Analyze competitive landscape AND positioning opportunities
	 * Uses Perplexity Sonar Pro for comprehensive competitive research
	 */
	async competitiveIntelligenceAgent(
		context: AgentContext,
	): Promise<CompetitiveData | null> {
		try {
			const systemPrompt = `You are a competitive intelligence analyst.

Your task is to:
- Analyze the competitive landscape around the target problem
- Identify real-world direct and indirect competitors
- Extract positioning whitespace and defensibility levers (e.g. integrations, niche targeting, usage model, underserved segment)

Avoid generic tools or naming widely used platforms unless directly relevant.

Return structured JSON:
{
  "competition": {
    "marketConcentrationLevel": "LOW|MEDIUM|HIGH",
    "marketConcentrationJustification": "string",
    "directCompetitors": [{"name": "string", "justification": "string", "strengths": ["s1","s2"], "weaknesses": ["w1","w2"]}],
    "indirectCompetitors": [{"name": "string", "justification": "string", "strengths": ["s1","s2"], "weaknesses": ["w1","w2"]}],
    "competitorFailurePoints": ["point1", "point2"],
    "unfairAdvantage": ["advantage1", "advantage2"],
    "moat": ["moat1", "moat2"],
    "competitivePositioningScore": number (1-10)
  },
  "positioning": {
    "name": "string",
    "targetSegment": "string",
    "valueProposition": "string",
    "keyDifferentiators": ["diff1", "diff2"]
  }
}
`;

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const userPrompt = `Analyze the competitive space for solutions solving: ${problemContext}

Return competitors, market concentration, and strategic gaps a new entrant can exploit. Focus on defensibility, differentiation, and whitespace.
`;

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"medium",
				"sonar-pro",
			);

			if (!response?.choices?.[0]?.message?.content) {
				throw new Error("No response from Perplexity");
			}

			const competitiveData = JSON.parse(
				response.choices[0].message.content,
			) as CompetitiveData;
			return competitiveData;
		} catch (error) {
			console.error("CompetitiveIntelligenceAgent error:", error);
			return null;
		}
	},

	/**
	 * MonetizationAgent - Generate revenue models and financial projections
	 * Uses OpenRouter GPT-4.1-nano for structured business model generation
	 */
	async monetizationAgent(
		context: AgentContext,
	): Promise<MonetizationData | null> {
		try {
			const systemPrompt = `You are a monetization strategist focused on lean startups.

Design a realistic revenue model for a startup addressing known problems. Choose a model that is:
- Simple to explain and justify
- Aligned with current buying behavior
- Able to hit $1-10M ARR potential in 2-3 years if executed well

Be specific about pricing, customer types, LTV/CAC estimates, and revenue growth assumptions.

Return JSON only.
`;

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const positioningContext =
				context.competitive?.positioning.valueProposition || "";

			const userPrompt = `Design a monetization strategy for a solution addressing: ${problemContext}
      
      Value proposition: ${positioningContext}
      
      Include specific pricing, revenue streams, key metrics, and 3-year financial projections.
      
      Return JSON format:
      {
        "primaryModel": "string",
        "pricingStrategy": "string", 
        "businessScore": number (1-10),
        "confidence": number (1-10),
        "revenueModelValidation": "string",
        "pricingSensitivity": "string",
        "revenueStreams": [{"name": "string", "description": "string", "percentage": number}],
        "keyMetrics": {
          "ltv": number, "ltvDescription": "string",
          "cac": number, "cacDescription": "string", 
          "ltvCacRatio": number, "ltvCacRatioDescription": "string",
          "paybackPeriod": number, "paybackPeriodDescription": "string",
          "runway": number, "runwayDescription": "string",
          "breakEvenPoint": "string", "breakEvenPointDescription": "string"
        },
        "financialProjections": [{"year": number, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number}]
      }`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: userPrompt,
				system: systemPrompt,
				temperature: 0.1,
				maxTokens: 1000,
			});

			const monetizationData = JSON.parse(text) as MonetizationData;
			return monetizationData;
		} catch (error) {
			console.error("MonetizationAgent error:", error);
			return null;
		}
	},

	/**
	 * IdeaSynthesisAgent - Combine all research into final structured idea with scoring
	 * Uses OpenRouter GPT-4.1-nano for deterministic synthesis
	 */
	async ideaSynthesisAgent(
		context: AgentContext,
	): Promise<SynthesizedIdea | null> {
		try {
			const systemPrompt = `You are a startup idea synthesizer creating investor-grade startup concepts.
      Combine trend research, problem analysis, competitive intelligence, and monetization strategy into a complete startup idea.
      
      Focus on:
      - Clear executive summary and problem-solution fit
      - Innovation level and market timing
      - Execution complexity and confidence scoring
      - SEO-optimized narrative and keywords
      
      Return valid JSON only, no additional text.`;

			const userPrompt = `Synthesize this research into a complete startup idea:
      
      TREND: ${context.trends?.title} - ${context.trends?.description}
      PROBLEMS: ${context.problemGaps?.problems.join(", ")}
      POSITIONING: ${context.competitive?.positioning.valueProposition}
      MONETIZATION: ${context.monetization?.primaryModel}
      
      Create a comprehensive startup idea with scoring across all dimensions.
      
      Return JSON format:
      {
        "title": "string",
        "description": "string",
        "executiveSummary": "string", 
        "problemSolution": "string",
        "problemStatement": "string",
        "innovationLevel": number (1-10),
        "timeToMarket": number (months),
        "confidenceScore": number (1-10),
        "narrativeHook": "string",
        "targetKeywords": ["keyword1", "keyword2"],
        "urgencyLevel": number (1-10),
        "executionComplexity": number (1-10),
        "tags": ["tag1", "tag2"],
        "scoring": {
          "totalScore": number,
          "problemSeverity": number (1-10),
          "founderMarketFit": number (1-10),
          "technicalFeasibility": number (1-10), 
          "monetizationPotential": number (1-10),
          "urgencyScore": number (1-10),
          "marketTimingScore": number (1-10),
          "executionDifficulty": number (1-10),
          "moatStrength": number (1-10),
          "regulatoryRisk": number (1-10)
        }
      }`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: userPrompt,
				system: systemPrompt,
				temperature: 0.1,
				maxTokens: 1500,
			});

			const synthesizedIdea = JSON.parse(text) as SynthesizedIdea;
			return synthesizedIdea;
		} catch (error) {
			console.error("IdeaSynthesisAgent error:", error);
			return null;
		}
	},

	/**
	 * Master orchestration function - Runs the complete idea generation pipeline
	 */
	async generateDailyIdea(): Promise<string | null> {
		try {
			console.log("🔍 Starting daily idea generation...");

			// Get previous ideas for context
			const previousIdeas = await IdeaGenerationAgentService.getDailyIdeas();

			// 1. Research trends
			console.log("📈 Researching trends...");
			const trends = await this.trendResearchAgent();
			if (!trends) throw new Error("Failed to research trends");

			// 2. Identify problems and gaps
			console.log("🎯 Analyzing problems and gaps...");
			const problemGaps = await this.problemGapAgent({ trends, previousIdeas });
			if (!problemGaps) throw new Error("Failed to analyze problems");

			// 3. Research competitive landscape
			console.log("🏆 Researching competition...");
			const competitive = await this.competitiveIntelligenceAgent({
				trends,
				problemGaps,
				previousIdeas,
			});
			if (!competitive) throw new Error("Failed to research competition");

			// 4. Design monetization strategy
			console.log("💰 Designing monetization...");
			const monetization = await this.monetizationAgent({
				trends,
				problemGaps,
				competitive,
				previousIdeas,
			});
			if (!monetization) throw new Error("Failed to design monetization");

			// 5. Synthesize final idea
			console.log("🧠 Synthesizing idea...");
			const idea = await this.ideaSynthesisAgent({
				trends,
				problemGaps,
				competitive,
				monetization,
				previousIdeas,
			});
			if (!idea) throw new Error("Failed to synthesize idea");

			// 6. Save to database
			console.log("💾 Saving to database...");
			const whyNow = await IdeaGenerationAgentService.createWhyNow(trends);
			const ideaScore = await IdeaGenerationAgentService.createIdeaScore(
				idea.scoring,
			);
			const monetizationStrategy =
				await IdeaGenerationAgentService.createMonetizationStrategy(
					monetization,
				);

			const dailyIdea = await IdeaGenerationAgentService.createDailyIdea(
				idea,
				whyNow.id,
				ideaScore.id,
				monetizationStrategy.id,
			);

			// Create related entities
			if (problemGaps.gaps.length > 0) {
				await IdeaGenerationAgentService.createMarketGap(
					problemGaps.gaps[0],
					dailyIdea.id,
				);
			}

			await IdeaGenerationAgentService.createMarketCompetition(
				competitive.competition,
				dailyIdea.id,
			);
			await IdeaGenerationAgentService.createStrategicPositioning(
				competitive.positioning,
				dailyIdea.id,
			);

			console.log("✅ Daily idea generated successfully:", dailyIdea.id);
			return dailyIdea.id;
		} catch (error) {
			console.error("❌ Daily idea generation failed:", error);
			return null;
		}
	},
};

export default IdeaGenerationAgentController;
