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
import { parsePerplexityResponse } from "@/utils/json-parser";
import { debugLogger } from "@/utils/logger";


const IdeaGenerationAgentController = {
	/**
	 * TrendResearchAgent - Discover emerging AI/tech trends with market timing signals
	 * Uses Perplexity Deep Research for comprehensive trend analysis
	 */
	async trendResearchAgent(): Promise<TrendData | null> {
		try {
			const systemPrompt = `You're a trend-hunting ninja who spots the next big thing before everyone else. Your job: Find emerging opportunities in SaaS, B2B, B2C that are heating up RIGHT NOW and practically screaming "someone should build this!"

			Look for trends with serious "why now" momentum—new regulations creating pain, funding flowing to specific areas, consumer behavior shifts, or tech breakthroughs making things suddenly possible/affordable.
			
			Skip the generic stuff. Hunt for trends that could birth the next $5M-50M ARR businesses in specific niches.
			
			Make your description tell a story—paint the picture of opportunity like you're pitching to an excited founder.
			
			Return this JSON structure:
			{
			  "title": "string (descriptive and exciting, like 'Parents Are Panic-Buying AI Safety Gadgets for Kids')",
			  "description": "string (engaging story about why this trend is exploding and what opportunities it creates)",
			  "trendStrength": number (1-10),
			  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
			  "timingUrgency": number (1-10),
			  "supportingData": ["specific metric or source", "concrete example", "real signal"]
			}
			
			Focus on trends that could spawn products people actually want to buy and use daily.`;

			const userPrompt = `What is one powerful, emerging business trend from the past 7-14 days?
      Focus on trends with real commercial momentum — buyer pull, unmet demand, pricing inefficiencies, or shifts in consumer/business behavior. Must be actionable for SaaS/B2B/B2C founders.
`;

			// LOG: Perplexity API request
			debugLogger.logPerplexityRequest("TrendResearchAgent", userPrompt, systemPrompt, {
				reasoning_effort: "high",
				model: "sonar-deep-research"
			});

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"high",
				"sonar-deep-research",
			);

			// LOG: Perplexity API response (FULL)
			debugLogger.logPerplexityResponse("TrendResearchAgent", response);

			if (!response?.choices?.[0]?.message?.content) {
				debugLogger.logError("TrendResearchAgent", new Error("No response from Perplexity"), { response });
				throw new Error("No response from Perplexity");
			}

			const content = response.choices[0].message.content;
			console.log("🔍 Perplexity raw response length:", content.length);
			console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

			// LOG: Content analysis (is it JSON or needs structuring)
			const isAlreadyJson = content.trim().startsWith('{') && content.trim().endsWith('}');
			debugLogger.logContentAnalysis("TrendResearchAgent", content, isAlreadyJson);

			// LLM structuring function for when content is not already JSON
			const structureWithLLM = async (content: string): Promise<string> => {
				const structuringPrompt = `You are a data structuring expert. Convert the following business trend research into the exact JSON structure requested.

REQUIRED JSON STRUCTURE:
{
  "title": "string",
  "description": "string", 
  "trendStrength": number (1-10),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
  "timingUrgency": number (1-10),
  "supportingData": ["data point 1", "data point 2", "data point 3"]
}

RESEARCH CONTENT TO CONVERT:
${content}

Extract the key trend information and format it as valid JSON. Return ONLY the JSON object, no additional text.`;

				// LOG: LLM structuring request
				debugLogger.logLLMStructuring("TrendResearchAgent", structuringPrompt, content);

				const { text: structuredJson } = await generateText({
					model: openrouter("openai/gpt-4o-mini"),
					prompt: structuringPrompt,
					temperature: 0.1,
					maxTokens: 800,
				});

				// LOG: LLM structuring response
				debugLogger.logLLMStructuringResponse("TrendResearchAgent", structuredJson);

				return structuredJson;
			};

			const parseResult = await parsePerplexityResponse<TrendData>(
				content,
				structureWithLLM,
				['title', 'description'], // Required fields
			);
			
			// LOG: Parsing attempt and result
			debugLogger.logParsingAttempt("TrendResearchAgent", content, parseResult);
			
			if (!parseResult.success) {
				console.error("❌ Failed to parse trend data:", parseResult.error);
				debugLogger.logError("TrendResearchAgent", new Error(`Failed to parse Perplexity response: ${parseResult.error}`), {
					parseResult,
					originalContent: content
				});
				throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
			}

			const trendData = parseResult.data as TrendData;
			
			console.log("✅ Successfully structured trend data:", {
				title: trendData.title,
				trendStrength: trendData.trendStrength,
				catalystType: trendData.catalystType
			});

			// LOG: Final agent result
			debugLogger.logAgentResult("TrendResearchAgent", trendData, true);

			return trendData;
		} catch (error) {
			console.error("TrendResearchAgent error:", error);
			debugLogger.logError("TrendResearchAgent", error as Error, { 
				agent: "TrendResearchAgent",
				fallbackUsed: true 
			});
			
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
			const systemPrompt = `You're a problem-solving detective who uncovers the daily frustrations that make people say "there HAS to be a better way!" Given a trend, dig up 2-3 super-specific, relatable problems that real people face every day.

			Then spotlight the gaps where current solutions totally miss the mark—clunky UX, wrong pricing, missing features, or just not understanding how people actually live and work.
			
			Tell problems like mini-stories about real people's struggles. Make gaps feel like "aha!" moments where you can see exactly what needs to be built.
			
			Return this structure:
			{
			  "problems": [
				"Sarah spends 20 minutes every morning applying sunscreen to her 3 kids, then worries all day if it's still working during their beach vacation",
				"problem 2 as a relatable story",
				"problem 3"
			  ],
			  "gaps": [
				{
				  "title": "string (catchy problem name like 'The Sunscreen Guessing Game')",
				  "description": "string (what's broken about current solutions)",
				  "impact": "string (how this hurts people in real life)",
				  "target": "string (specific person like 'parents with kids 3-12 who love outdoor activities')",
				  "opportunity": "string (exciting solution idea that could work)"
				}
			  ]
			}
			
			Hunt for problems where a clever solution could genuinely improve someone's day.`;

			const userPrompt = `Given this trend: "${context.trends?.title} - ${context.trends?.description}",

Identify 2-3 painful, specific problems and explain the gaps in how current solutions fail. Prioritize areas with commercial potential (e.g. friction in workflows, outdated tooling, underserved personas, invisible costs).
`;

			// LOG: Perplexity API request
			debugLogger.logPerplexityRequest("ProblemGapAgent", userPrompt, systemPrompt, {
				reasoning_effort: "medium",
				model: "sonar",
				context: context.trends
			});

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"medium",
				"sonar",
			);

			// LOG: Perplexity API response (FULL)
			debugLogger.logPerplexityResponse("ProblemGapAgent", response);

			if (!response?.choices?.[0]?.message?.content) {
				debugLogger.logError("ProblemGapAgent", new Error("No response from Perplexity"), { response });
				throw new Error("No response from Perplexity");
			}

			const content = response.choices[0].message.content;
			console.log("🔍 ProblemGap raw response length:", content.length);
			console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

			// LOG: Content analysis (is it JSON or needs structuring)
			const isAlreadyJson = content.trim().startsWith('{') && content.trim().endsWith('}');
			debugLogger.logContentAnalysis("ProblemGapAgent", content, isAlreadyJson);

			// LLM structuring function for when content is not already JSON
			const structureWithLLM = async (content: string): Promise<string> => {
				const structuringPrompt = `You are a data structuring expert. Convert the following business problem and gap analysis into the exact JSON structure requested.

REQUIRED JSON STRUCTURE:
{
  "problems": ["problem 1", "problem 2", "problem 3"],
  "gaps": [
    {
      "title": "string",
      "description": "string",
      "impact": "string",
      "target": "string (persona or market)",
      "opportunity": "string"
    }
  ]
}

RESEARCH CONTENT TO CONVERT:
${content}

Extract the key problems and market gaps from this analysis and format them as valid JSON. Return ONLY the JSON object, no additional text.`;

				// LOG: LLM structuring request
				debugLogger.logLLMStructuring("ProblemGapAgent", structuringPrompt, content);

				const { text: structuredJson } = await generateText({
					model: openrouter("openai/gpt-4o-mini"),
					prompt: structuringPrompt,
					temperature: 0.1,
					maxTokens: 800,
				});

				// LOG: LLM structuring response
				debugLogger.logLLMStructuringResponse("ProblemGapAgent", structuredJson);

				return structuredJson;
			};

			const parseResult = await parsePerplexityResponse<ProblemGapData>(
				content,
				structureWithLLM,
				['problems', 'gaps'], // Required fields
			);
			
			// LOG: Parsing attempt and result
			debugLogger.logParsingAttempt("ProblemGapAgent", content, parseResult);
			
			if (!parseResult.success) {
				console.error("❌ Failed to parse problem gap data:", parseResult.error);
				debugLogger.logError("ProblemGapAgent", new Error(`Failed to parse Perplexity response: ${parseResult.error}`), {
					parseResult,
					originalContent: content
				});
				throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
			}

			const problemGapData = parseResult.data as ProblemGapData;
			
			console.log("✅ Successfully structured problem gap data:", {
				problemCount: problemGapData.problems?.length || 0,
				gapCount: problemGapData.gaps?.length || 0
			});

			// LOG: Final agent result
			debugLogger.logAgentResult("ProblemGapAgent", problemGapData, true);

			return problemGapData;
		} catch (error) {
			console.error("ProblemGapAgent error:", error);
			debugLogger.logError("ProblemGapAgent", error as Error, { 
				agent: "ProblemGapAgent",
				fallbackUsed: true 
			});
			
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
			const systemPrompt = `You're a competitive spy who finds the secret weaknesses in every market. Map out who's playing in this space, what they're good at, where they totally blow it, and most importantly—where a scrappy new player could sneak in and win.

			Make it feel like a strategy game—highlight competitor blind spots as golden opportunities for differentiation.
			
			Return this structure:
			{
			  "competition": {
				"marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
				"marketConcentrationJustification": "string (tell the competitive story)",
				"directCompetitors": [
				  {
					"name": "string",
					"justification": "string (why they're a threat)",
					"strengths": ["what they do well", "their advantages"],
					"weaknesses": ["where they fail users", "their blind spots"]
				  }
				],
				"indirectCompetitors": [similar structure],
				"competitorFailurePoints": ["specific way competitors disappoint users", "another failure"],
				"unfairAdvantage": ["unique angle a new player could take", "another advantage"],
				"moat": ["defensible advantage 1", "defensible advantage 2"],
				"competitivePositioningScore": number (1-10)
			  },
			  "positioning": {
				"name": "string (catchy startup name that hints at the solution)",
				"targetSegment": "string (very specific customer group)",
				"valueProposition": "string (compelling pitch that solves the real problem)",
				"keyDifferentiators": ["unique feature that competitors can't copy easily", "another differentiator"]
			  }
			}
			
			Find the positioning that makes competitors irrelevant, not just different.`;

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const userPrompt = `Analyze the competitive space for solutions solving: ${problemContext}

Return competitors, market concentration, and strategic gaps a new entrant can exploit. Focus on defensibility, differentiation, and whitespace.
`;

			// LOG: Perplexity API request
			debugLogger.logPerplexityRequest("CompetitiveIntelligenceAgent", userPrompt, systemPrompt, {
				reasoning_effort: "medium",
				model: "sonar-pro",
				context: context.problemGaps
			});

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"medium",
				"sonar-pro",
			);

			// LOG: Perplexity API response (FULL)
			debugLogger.logPerplexityResponse("CompetitiveIntelligenceAgent", response);

			if (!response?.choices?.[0]?.message?.content) {
				debugLogger.logError("CompetitiveIntelligenceAgent", new Error("No response from Perplexity"), { response });
				throw new Error("No response from Perplexity");
			}

			const content = response.choices[0].message.content;
			console.log("🔍 Competitive Intelligence raw response length:", content.length);
			console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

			// LOG: Content analysis (is it JSON or needs structuring)
			const isAlreadyJson = content.trim().startsWith('{') && content.trim().endsWith('}');
			debugLogger.logContentAnalysis("CompetitiveIntelligenceAgent", content, isAlreadyJson);

			// LLM structuring function for when content is not already JSON
			const structureWithLLM = async (content: string): Promise<string> => {
				const structuringPrompt = `You are a data structuring expert. Convert the following competitive intelligence research into the exact JSON structure requested.

REQUIRED JSON STRUCTURE:
{
  "competition": {
    "marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
    "marketConcentrationJustification": "string",
    "directCompetitors": [
      {
        "name": "string",
        "justification": "string",
        "strengths": ["s1", "s2"],
        "weaknesses": ["w1", "w2"]
      }
    ],
    "indirectCompetitors": [
      {
        "name": "string",
        "justification": "string",
        "strengths": ["s1", "s2"],
        "weaknesses": ["w1", "w2"]
      }
    ],
    "competitorFailurePoints": ["point1", "point2"],
    "unfairAdvantage": ["adv1", "adv2"],
    "moat": ["moat1", "moat2"],
    "competitivePositioningScore": "number (1-10)"
  },
  "positioning": {
    "name": "string",
    "targetSegment": "string",
    "valueProposition": "string",
    "keyDifferentiators": ["diff1", "diff2"]
  }
}

RESEARCH CONTENT TO CONVERT:
${content}

Extract the competitive analysis data and strategic positioning from this research and format them as valid JSON. Return ONLY the JSON object, no additional text.`;

				// LOG: LLM structuring request
				debugLogger.logLLMStructuring("CompetitiveIntelligenceAgent", structuringPrompt, content);

				const { text: structuredJson } = await generateText({
					model: openrouter("openai/gpt-4o-mini"),
					prompt: structuringPrompt,
					temperature: 0.1,
					maxTokens: 1000,
				});

				// LOG: LLM structuring response
				debugLogger.logLLMStructuringResponse("CompetitiveIntelligenceAgent", structuredJson);

				return structuredJson;
			};

			const parseResult = await parsePerplexityResponse<CompetitiveData>(
				content,
				structureWithLLM,
				['competition', 'positioning'], // Required fields
			);
			
			// LOG: Parsing attempt and result
			debugLogger.logParsingAttempt("CompetitiveIntelligenceAgent", content, parseResult);
			
			if (!parseResult.success) {
				console.error("❌ Failed to parse competitive data:", parseResult.error);
				debugLogger.logError("CompetitiveIntelligenceAgent", new Error(`Failed to parse Perplexity response: ${parseResult.error}`), {
					parseResult,
					originalContent: content
				});
				throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
			}

			const competitiveData = parseResult.data as CompetitiveData;
			
			console.log("✅ Successfully structured competitive data:", {
				marketConcentration: competitiveData.competition?.marketConcentrationLevel,
				directCompetitorCount: competitiveData.competition?.directCompetitors?.length || 0,
				positioningName: competitiveData.positioning?.name
			});

			// LOG: Final agent result
			debugLogger.logAgentResult("CompetitiveIntelligenceAgent", competitiveData, true);

			return competitiveData;
		} catch (error) {
			console.error("CompetitiveIntelligenceAgent error:", error);
			debugLogger.logError("CompetitiveIntelligenceAgent", error as Error, { 
				agent: "CompetitiveIntelligenceAgent",
				fallbackUsed: true 
			});
			
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
			const systemPrompt = `You're a revenue wizard who designs money-making machines that customers actually love paying for. Given a problem and solution, craft a monetization strategy that feels fair to users and scales to serious revenue.

			Make it practical and exciting—show how real people would pay, what they'd get, and how this grows into a proper business.
			
			Avoid jargon. Explain like you're chatting with a founder friend about their path to $5M+ ARR.
			
			Return this structure:
			{
			  "primaryModel": "string (like 'Hardware + Subscription + Marketplace')",
			  "pricingStrategy": "string (engaging explanation of how pricing works)",
			  "businessScore": number (1-10),
			  "confidence": number (1-10),
			  "revenueModelValidation": "string (real examples of similar models working)",
			  "pricingSensitivity": "string (how customers feel about paying)",
			  "revenueStreams": [
				{
				  "name": "string (revenue source)",
				  "description": "string (fun explanation of how this makes money)",
				  "percentage": number
				}
			  ],
			  "keyMetrics": {
				"ltv": number,
				"ltvDescription": "string (story about customer value)",
				"cac": number,
				"cacDescription": "string (how you acquire customers)",
				"ltvCacRatio": number,
				"ltvCacRatioDescription": "string (why this ratio works)",
				"paybackPeriod": number,
				"paybackPeriodDescription": "string (timeline story)",
				"runway": number,
				"runwayDescription": "string (funding timeline)",
				"breakEvenPoint": "string",
				"breakEvenPointDescription": "string (milestone story)"
			  },
			  "financialProjections": [
				{"year": 1, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number},
				{"year": 2, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number},
				{"year": 3, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number}
			  ]
			}
			
			Design for sustainable growth with room for exciting expansion opportunities.`;

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
				model: openrouter("openai/gpt-4.1-mini"),
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
			const systemPrompt = `You're the final storyteller who weaves all the research into an irresistible startup idea that makes founders say "I NEED to build this!"

			Create a title that immediately tells you what the business is and hints at the revenue potential. Write descriptions that paint the picture of real people using and loving this product.
			
			Make it feel like a business plan that's actually exciting to read and execute.
			
			Return this structure:
			{
			  "title": "string (format: 'Product Name - Brief Description ($XM ARR potential)')",
			  "description": "string (engaging story of what this business is and why it matters)",
			  "executiveSummary": "string (compelling 2-3 sentence pitch)",
			  "problemSolution": "string (story format: 'Parents struggle with X. ProductName solves this by...')",
			  "problemStatement": "string (relatable problem description)",
			  "innovationLevel": number (1-10),
			  "timeToMarket": number (months),
			  "confidenceScore": number (1-10),
			  "narrativeHook": "string (one-liner that makes people lean in)",
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
			}
			
			Make every founder who reads this think "This could be the one!"`;

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
				model: openrouter("openai/gpt-4.1-mini"),
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
			debugLogger.info("🔍 Starting daily idea generation...", { 
				timestamp: new Date().toISOString(),
				sessionId: Date.now().toString()
			});

			// Get previous ideas for context
			const previousIdeas = await IdeaGenerationAgentService.getDailyIdeas();
			debugLogger.info("📚 Retrieved previous ideas for context", { 
				previousIdeasCount: previousIdeas.length,
				previousIdeas: previousIdeas
			});

			// 1. Research trends
			console.log("📈 Researching trends...");
			debugLogger.info("📈 Starting trend research...");
			const trends = await this.trendResearchAgent();
			if (!trends) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to research trends"), { step: "trendResearch" });
				throw new Error("Failed to research trends");
			}
			debugLogger.info("✅ Trend research completed", { trends });

			// 2. Identify problems and gaps
			console.log("🎯 Analyzing problems and gaps...");
			debugLogger.info("🎯 Starting problem gap analysis...", { trendsContext: trends });
			const problemGaps = await this.problemGapAgent({ trends, previousIdeas });
			if (!problemGaps) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to analyze problems"), { step: "problemGapAnalysis", trends });
				throw new Error("Failed to analyze problems");
			}
			debugLogger.info("✅ Problem gap analysis completed", { problemGaps });

			// 3. Research competitive landscape
			console.log("🏆 Researching competition...");
			debugLogger.info("🏆 Starting competitive intelligence...", { trends, problemGaps });
			const competitive = await this.competitiveIntelligenceAgent({
				trends,
				problemGaps,
				previousIdeas,
			});
			if (!competitive) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to research competition"), { step: "competitiveIntelligence", trends, problemGaps });
				throw new Error("Failed to research competition");
			}
			debugLogger.info("✅ Competitive intelligence completed", { competitive });

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
