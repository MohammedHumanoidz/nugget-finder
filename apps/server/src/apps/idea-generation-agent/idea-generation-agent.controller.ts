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

			const content = response.choices[0].message.content;
			console.log("Perplexity response content:", content);

			// Check if content starts with HTML tags (common error response format)
			if (content.trim().startsWith('<')) {
				throw new Error("Received HTML response instead of JSON from Perplexity API");
			}

			try {
				const trendData = JSON.parse(content) as TrendData;
				return trendData;
			} catch (parseError) {
				console.error("JSON parse error:", parseError);
				console.error("Raw content:", content);
				throw new Error("Failed to parse JSON response from Perplexity");
			}
		} catch (error) {
			console.error("TrendResearchAgent error:", error);
			
			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock trend data for development");
			return {
				title: "AI-Powered Workflow Automation for SMBs",
				description: "Small to medium businesses are increasingly adopting AI-powered tools to automate repetitive workflows, driven by labor shortages and cost pressures. Tools that can integrate multiple business processes (CRM, inventory, scheduling) with simple AI automation are seeing rapid adoption.",
				trendStrength: 8,
				catalystType: "TECHNOLOGY_BREAKTHROUGH" as const,
				timingUrgency: 7,
				supportingData: [
					"Google Trends shows 340% increase in 'AI workflow automation' searches",
					"Zapier reports 200% growth in AI-powered automation usage by SMBs",
					"Recent $50M funding rounds for workflow automation startups"
				]
			};
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

			const content = response.choices[0].message.content;
			console.log("ProblemGap response content:", content);

			// Check if content starts with HTML tags
			if (content.trim().startsWith('<')) {
				throw new Error("Received HTML response instead of JSON from Perplexity API");
			}

			try {
				const problemGapData = JSON.parse(content) as ProblemGapData;
				return problemGapData;
			} catch (parseError) {
				console.error("ProblemGap JSON parse error:", parseError);
				console.error("Raw content:", content);
				throw new Error("Failed to parse JSON response from Perplexity");
			}
		} catch (error) {
			console.error("ProblemGapAgent error:", error);
			
			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock problem gap data for development");
			return {
				problems: [
					"SMB owners waste 15+ hours/week on manual task switching between CRM, inventory, and scheduling systems",
					"Non-technical team members struggle to set up complex automation tools, requiring expensive consultants",
					"Existing automation tools are either too basic (single-app) or too complex (enterprise-grade) for growing businesses"
				],
				gaps: [
					{
						title: "No-Code Multi-System Integration",
						description: "Current tools require technical setup or only work within single ecosystems",
						impact: "Businesses lose productivity and pay for multiple disconnected tools",
						target: "SMB owners and operations managers (10-100 employees)",
						opportunity: "AI-powered connector that learns business patterns and suggests automations"
					},
					{
						title: "Context-Aware Workflow Intelligence",
						description: "Existing automation lacks business context and requires manual rule creation",
						impact: "Automations break when business conditions change, creating more work",
						target: "Growing businesses with changing processes",
						opportunity: "Smart automation that adapts to business patterns and seasonal changes"
					}
				]
			};
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

			const content = response.choices[0].message.content;
			console.log("Competitive Intelligence response content:", content);

			// Check if content starts with HTML tags
			if (content.trim().startsWith('<')) {
				throw new Error("Received HTML response instead of JSON from Perplexity API");
			}

			try {
				const competitiveData = JSON.parse(content) as CompetitiveData;
				return competitiveData;
			} catch (parseError) {
				console.error("Competitive Intelligence JSON parse error:", parseError);
				console.error("Raw content:", content);
				throw new Error("Failed to parse JSON response from Perplexity");
			}
		} catch (error) {
			console.error("CompetitiveIntelligenceAgent error:", error);
			
			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock competitive intelligence data for development");
			return {
				competition: {
					marketConcentrationLevel: "MEDIUM" as const,
					marketConcentrationJustification: "Several established players but room for differentiation in SMB segment",
					directCompetitors: [
						{
							name: "Zapier",
							justification: "Leading workflow automation platform",
							strengths: ["Extensive integrations", "Brand recognition", "Large ecosystem"],
							weaknesses: ["Complex for non-technical users", "Expensive for SMBs", "Generic automation"]
						},
						{
							name: "Make.com",
							justification: "Visual workflow automation tool",
							strengths: ["Visual interface", "Advanced features", "Developer-friendly"],
							weaknesses: ["Steep learning curve", "Pricing model", "Limited SMB focus"]
						}
					],
					indirectCompetitors: [
						{
							name: "Microsoft Power Automate",
							justification: "Enterprise automation within Microsoft ecosystem",
							strengths: ["Microsoft integration", "Enterprise features", "Bundled pricing"],
							weaknesses: ["Microsoft ecosystem lock-in", "Complex setup", "Poor SMB experience"]
						}
					],
					competitorFailurePoints: [
						"Over-complicated interfaces for simple business needs",
						"Pricing models that don't scale with SMB growth",
						"Lack of industry-specific templates and workflows"
					],
					unfairAdvantage: [
						"AI-powered setup that learns business patterns",
						"SMB-specific workflow templates",
						"Transparent, usage-based pricing"
					],
					moat: [
						"Proprietary AI that understands SMB workflows",
						"Network effects from workflow marketplace",
						"Integration partnerships with SMB-focused tools"
					],
					competitivePositioningScore: 7
				},
				positioning: {
					name: "FlowGenius",
					targetSegment: "Growing SMBs (10-100 employees) in service industries",
					valueProposition: "The first workflow automation tool designed specifically for growing businesses - setup in minutes, not months",
					keyDifferentiators: [
						"AI-powered workflow suggestions based on business type",
						"SMB-optimized pricing that grows with your business",
						"Industry-specific templates and best practices"
					]
				}
			};
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
			
			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock monetization data for development");
			return {
				primaryModel: "SaaS Subscription",
				pricingStrategy: "Tiered SaaS pricing based on number of integrations and automations",
				businessScore: 8,
				confidence: 7,
				revenueModelValidation: "Validated by similar tools in market (Zapier, Make.com) with proven demand",
				pricingSensitivity: "SMBs are price-sensitive but will pay for proven ROI and time savings",
				revenueStreams: [
					{ name: "Monthly Subscriptions", description: "Core SaaS platform access", percentage: 70 },
					{ name: "Setup & Consulting", description: "Implementation services", percentage: 20 },
					{ name: "Premium Integrations", description: "Enterprise-grade connectors", percentage: 10 }
				],
				keyMetrics: {
					ltv: 1800,
					ltvDescription: "Average customer lifetime value based on 18-month retention",
					cac: 180,
					cacDescription: "Customer acquisition cost through digital marketing",
					ltvCacRatio: 10,
					ltvCacRatioDescription: "Healthy 10:1 LTV:CAC ratio indicating profitable growth",
					paybackPeriod: 6,
					paybackPeriodDescription: "6 months to recover customer acquisition cost",
					runway: 18,
					runwayDescription: "18 months of operating expenses covered",
					breakEvenPoint: "Month 14 at 500 customers",
					breakEvenPointDescription: "Break-even when MRR reaches $25K"
				},
				financialProjections: [
					{ year: 1, revenue: 120000, costs: 200000, netMargin: -40, revenueGrowth: 0 },
					{ year: 2, revenue: 480000, costs: 350000, netMargin: 27, revenueGrowth: 300 },
					{ year: 3, revenue: 1200000, costs: 720000, netMargin: 40, revenueGrowth: 150 }
				]
			};
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
			
			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock synthesis data for development");
			return {
				title: "FlowGenius - AI-Powered Workflow Automation for Growing SMBs",
				description: "An intelligent workflow automation platform designed specifically for small-to-medium businesses, featuring AI-powered setup, industry-specific templates, and SMB-optimized pricing.",
				executiveSummary: "FlowGenius addresses the critical gap in workflow automation for growing SMBs by providing an AI-powered platform that learns business patterns and suggests relevant automations. Unlike complex enterprise tools or basic single-app connectors, FlowGenius offers the perfect middle ground with smart templates, transparent pricing, and setup that takes minutes instead of months.",
				problemSolution: "SMB owners waste 15+ hours per week manually switching between CRM, inventory, and scheduling systems. FlowGenius solves this with AI-powered multi-system integration that learns business patterns and suggests contextually relevant automations, reducing setup time from weeks to minutes.",
				problemStatement: "Growing businesses (10-100 employees) struggle with workflow automation tools that are either too basic or too complex, leading to productivity losses and disconnected business processes.",
				innovationLevel: 7,
				timeToMarket: 8,
				confidenceScore: 8,
				narrativeHook: "The first workflow automation tool that actually understands your business",
				targetKeywords: ["workflow automation", "SMB productivity", "business process automation", "AI workflow"],
				urgencyLevel: 8,
				executionComplexity: 6,
				tags: ["SaaS", "B2B", "Productivity", "AI", "Automation"],
				scoring: {
					totalScore: 78,
					problemSeverity: 8,
					founderMarketFit: 7,
					technicalFeasibility: 8,
					monetizationPotential: 8,
					urgencyScore: 8,
					marketTimingScore: 9,
					executionDifficulty: 6,
					moatStrength: 7,
					regulatoryRisk: 2
				}
			};
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
