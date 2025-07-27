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
	async trendResearchAgent(context: AgentContext): Promise<TrendData | null> {
		try {
			const systemPrompt = `You are a world-class, unbiased trend forecaster and global intelligence analyst. Your mission: Identify *one* powerful, undeniable emerging trend or significant development that represents a major shift in technology, society, economy, or regulation.

			Your goal is to surface macro-level shifts that will fundamentally change how people live, work, or interact. Think like a top-tier journalist or researcher presenting a profound insight into "what's happening in the world."
			
			**Crucially, this trend MUST be validated by high-engagement, human-driven discussion, not just news headlines or passing fads.** Prioritize signals from:
				- **Reddit/Twitter:** Look for highly upvoted threads, heavily commented posts, and viral discussions that indicate *sustained, genuine community interest and frustration/excitement* around a topic. This filters out low-quality or AI-generated 'slop'.
				- **Developer forums, niche communities, specialized blogs:** Evidence of active problem-solving or deep technical discussion.
			
			**DO NOT filter for product ideas or specific business models (SaaS, B2B, B2C) at this stage.** Your focus is purely on the existence, significance, and driving forces of the trend itself. This trend *will* generate problems, but that's for a later agent to identify.
			
			Return a structured JSON object with this exact shape:
			{
			  "title": "string (A concise, impactful title for the global trend, e.g., 'The Surging Demand for Decentralized Identity Solutions')",
			  "description": "string (A clear, objective, and compelling narrative explaining the macro trend, its origin, and its broad implications. Crucially, reference how this trend is manifesting in *high-engagement online communities* (e.g., 'Discussions on Reddit's /r/privacy are exploding, with users detailing frustration over...'). Do NOT hint at solutions or specific startup ideas. Focus on the 'what' and 'why' of the trend itself.)",
			  "trendStrength": number (1-10),
			  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
			  "timingUrgency": number (1-10),
			  "supportingData": ["credible, high-level source or metric (e.g., 'Spike in 'digital identity' mentions on Hacker News')", "specific example of high-engagement social discussion (e.g., 'A Reddit thread on data breaches hit 5,000 comments in 24 hours')", "major news event or policy change (if relevant and confirmed by social buzz)"]
			}
			
			Focus on undeniable, impactful shifts, validated by real human interaction, not just ephemeral headlines. Let's understand the world through its actual conversations.`;
			// Build context-aware prompt to avoid repetitive ideas
			let contextualPrompt = "What is one powerful, globally impactful emerging trend or significant development that is generating high engagement and sustained discussion in online communities like Reddit, Twitter, or specialized forums or even the news and blogs? Focus on shifts with broad implications across technology, society, economy, or regulation.";
			
			if (context.previousIdeas && context.previousIdeas.length > 0) {
				const previousTitles = context.previousIdeas.map(idea => idea.title).join('", "');
				contextualPrompt += `\n\nIMPORTANT: Avoid generating trends similar to these previously analyzed ones: "${previousTitles}". Focus on discovering entirely different trend categories or novel developments.`;
			}
			
			const userPrompt = contextualPrompt;
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
			const systemPrompt = `You are a savvy business strategist and *real-world problem finder*. Given a significant, high-level trend (which might be forward-looking like '6G'), your job is to uncover 2-3 *excruciatingly specific, commercial problems that businesses or individuals are experiencing **RIGHT NOW** due to this trend*. These are not future problems; they are current, tangible pains that are costly, time-consuming, inefficient, or creating competitive disadvantages *today*.

			**Your critical filter:** The identified problems MUST be:
				1.  **Acute & Present:** Happening in the market today, not a theoretical future issue.
				2.  **Solvable for a Lean Startup:** The problem should realistically be addressed by a focused MVP from a small team, implying it's not a multi-billion dollar R&D challenge.
				3.  **Directly or Indirectly Influenced by the Trend:** The trend should act as the *catalyst* or *intensifier* for this *current* problem, making it urgent and commercially viable for a new solution. (e.g., if 6G is trending, a *current* problem might be businesses struggling with outdated 5G hardware *in light of* impending 6G standards, or planning complexity for future tech investments).
			
			For each problem, dissect *why* existing solutions or traditional methods are utterly failing *in today's context*. Is it:
				- They are too generic or rigid to adapt to the new trend's *immediate* demands?
				- They create more friction or cost *now* in the evolving environment?
				- They completely miss a critical *current* need created by the trend's influence?
			
			**Describe the persona affected as a specific archetype or segment (e.g., 'small and medium-sized architecture firms' or 'online course creators reliant on social media traffic') and detail their frustration with tangible, quantifiable examples where possible.** The gaps should highlight a *clear, solvable commercial opportunity* that directly stems from the macro trend's *current* impact.
			
			Return this object exactly:
			{
			  "problems": [
				"A small business grappling with managing its energy consumption is falling behind competitors because integrating disparate smart grid data sources into a single, actionable dashboard is currently too complex and expensive.",
				"problem 2 for a specific archetype/segment, detailing their current pain and its cost/impact related to the macro trend",
				"problem 3 if applicable, same level of detail"
			  ],
			  "gaps": [
				{
				  "title": "string (A vivid, problem-centric title that hints at the *missing capability* for the commercial target's current pain, e.g., 'The Smart Grid Data Silo for SMBs')",
				  "description": "string (A blunt explanation of *why existing tools or methods fail* to solve this specific, *current* problem for *this specific target* in the context of the larger trend's immediate influence. Explain the *mechanism of failure*.)",
				  "impact": "string (Direct, quantifiable commercial impact: 'lost revenue', 'decreased efficiency', 'competitive disadvantage', 'higher operational costs')",
				  "target": "string (The NARROW AND SPECIFIC commercial target: 'Small-to-medium sized industrial facilities (e.g., small manufacturers, warehouses)')",
				  "opportunity": "string (A *hyper-focused solution idea* that directly addresses the gap with a unique insight/capability, e.g., 'A simple, AI-powered dashboard that unifies energy data from smart meters and IoT sensors for small industrial facilities to immediately identify cost savings.')"
				}
			  ]
			}
			
			Find commercial pains so acute and present, your target will practically throw money at a solution to survive or thrive *today*.`;
			// Build context-aware prompt to avoid repetitive problems
			let contextualPrompt = `Given this impactful global trend: "${context.trends?.title} - ${context.trends?.description}",\n\nIdentify 2-3 painful, specific commercial problems that have emerged or intensified for specific business/individual archetypes. Explain the critical gaps in how current solutions fail to address these new problems. Prioritize areas with high commercial potential (e.g., significant friction in workflows, newly underserved segments, hidden costs emerging from the trend).`;
			
			if (context.previousIdeas && context.previousIdeas.length > 0) {
				const previousDescriptions = context.previousIdeas.map(idea => `${idea.title}: ${idea.description}`).join('\n- ');
				contextualPrompt += `\n\nIMPORTANT: Avoid identifying problems already addressed by these previous ideas:\n- ${previousDescriptions}\n\nFocus on discovering entirely different market gaps or unique problem areas within this trend.`;
			}
			
			const userPrompt = contextualPrompt;
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
			const systemPrompt = `You are a disruptive strategist. Given a *singular, deeply painful problem* for a *very specific target*, your mission is to identify how a new entrant can completely outmaneuver the competition by exploiting their fundamental weaknesses *within this niche*.

			Map out direct and indirect players. For each, brutally dissect:
				- What they *pretend* to do well, but fail at for *our niche*.
				- Why their existing structure or product makes it *impossible* for them to truly solve *our specific problem* effectively.
			
			**Your primary objective is to define a "wedge" positioning that creates an undeniable, defensible moat built on proprietary insights or a fundamentally different approach.** This isn't about competing better; it's about making them irrelevant for our specific user.
			
			Return this structure precisely:
			{
			  "competition": {
				"marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
				"marketConcentrationJustification": "string (explain the competitive landscape *only as it pertains to our micro-niche*, highlighting the specific gaps)",
				"directCompetitors": [
				  {
					"name": "string",
					"justification": "string (why they're a competitor *in a tangential way* for our niche)",
					"strengths": ["s1 (their general strength)", "s2"],
					"weaknesses": ["w1 (how they *specifically fail* our target persona)", "w2 (their fundamental limitation for our solution)"]
				  }
				],
				"indirectCompetitors": [
				  {
					"name": "string",
					"justification": "string (how they indirectly touch our niche)",
					"strengths": ["s1"],
					"weaknesses": ["w1 (why they're inadequate for *our specific problem*)"]
				  }
				],
				"competitorFailurePoints": ["the *critical, unaddressed pain points* that *only* a niche solution can fix", "another glaring failure point"],
				"unfairAdvantage": ["our *secret sauce* that competitors lack (e.g., unique data access, proprietary algorithm, deep domain expertise of founders)", "another unique advantage"],
				"moat": ["how we build an *impenetrable wall* around our niche (e.g., proprietary dataset, network effects *within the niche*, exclusive integrations, unique IP)", "another key moat"],
				"competitivePositioningScore": number (1–10)
			  },
			  "positioning": {
				"name": "string (a precise, memorable product name that instantly communicates its niche and benefit, e.g., 'PrintPerfect AI')",
				"targetSegment": "string (REITERATE the EXTREMELY narrow and specific target: 'Freelance artists and small print-on-demand businesses (1-3 people)')",
				"valueProposition": "string (a sharp, compelling pitch for *this exact persona*, emphasizing the *unique data/insight* and problem solved, e.g., 'The only AI analytics for print-on-demand artists that visually predicts top-performing designs by analyzing Pinterest trends and Instagram engagement, boosting your sales by 30% without guesswork.')",
				"keyDifferentiators": ["our unique capability 1 (tied to unfair advantage)", "our unique capability 2 (tied to moat)", "our unique capability 3"]
			  }
			}
			
			Force a focus on how the solution fundamentally disrupts the niche, not just competes.`;
			
			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const userPrompt = `Analyze the competitive landscape *within the precise niche* defined by these problems: ${problemContext}.

			Identify both direct and indirect competitors. For each, expose their specific weaknesses and blind spots as they relate to *our narrow target persona's unique pain*. Then, clearly define a highly differentiated and defensible positioning strategy that allows a new entrant to effectively make existing solutions irrelevant for this specific audience.`;

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
			const systemPrompt = `You're a practical revenue architect for focused, niche startups. Given a deeply validated problem and a hyper-specific positioning, design a monetization model that feels intuitive to *our exact target persona* and can realistically scale to $1-10M ARR.

			**The pricing must directly tie to the value we provide for our niche, and the financial projections should be realistic for a *single, laser-focused* product, not a sprawling enterprise suite.**
			
			Explain the revenue model as if you're coaching a friend: clear, concise, and focused on the real-world customer journey and value.
			
			Return this exact structure:
			{
			  "primaryModel": "string (e.g., 'Per-Document SaaS Subscription' or 'Tiered User/Feature SaaS for Micro-Businesses')",
			  "pricingStrategy": "string (a concise, customer-centric explanation of how pricing delivers clear ROI for the target segment)",
			  "businessScore": number,
			  "confidence": number,
			  "revenueModelValidation": "string (cite specific examples of *niche* SaaS or tool companies with similar successful models, or explain why this makes sense for the target's budget)",
			  "pricingSensitivity": "string (how sensitive is *this specific target* to price, and why will they pay for our value?)",
			  "revenueStreams": [
				{ "name": "string", "description": "string (how this stream adds value for the customer)", "percentage": number }
			  ],
			  "keyMetrics": {
				"ltv": number, "ltvDescription": "string (a brief, realistic story of how customer LTV accumulates for THIS specific product)",
				"cac": number, "cacDescription": "string (how we'll acquire THIS specific customer type, e.g., 'niche forums, targeted LinkedIn ads')",
				"ltvCacRatio": number, "ltvCacRatioDescription": "string",
				"paybackPeriod": number, "paybackPeriodDescription": "string",
				"runway": number, "runwayDescription": "string",
				"breakEvenPoint": "string", "breakEvenPointDescription": "string"
			  },
			  "financialProjections": [
				{ "year": number, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number }
			  ]
			}
			
			Focus on clarity and achievability. Every number should tell a story about *our specific niche*.`;
			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const positioningContext =
				context.competitive?.positioning.valueProposition || "";

				const userPrompt = `Design a lean, hyper-focused monetization strategy for a solution addressing these problems: ${problemContext}
      
				Value proposition for our niche: ${positioningContext}
					  
				Clearly define the primary revenue model, pricing strategy, and how it delivers clear, quantifiable ROI for our specific target persona. Include realistic revenue streams, key metrics (LTV, CAC, payback period), and simplified 3-year financial projections that reflect a laser-focused MVP with potential for scale within its niche.`;

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
			const systemPrompt = `You are the ultimate founder, responsible for synthesizing all the research into a single, irresistible startup idea that feels *tangible, human, and immediately actionable for a lean startup*. You will leverage the identified global trend, the specific commercial problems, the competitive gaps, and the monetization strategy to craft a cohesive, compelling business concept.

			**Your core responsibility is to articulate a precise problem solved for a specific group of people with a uniquely compelling, *buildable* solution. Focus on a solution that is realistic for a focused, early-stage team to develop and bring to market, which often means micro-SaaS, specialized tools, or niche service plays.**

			**Tone & Narrative:** Absolutely **avoid abstract jargon and generic buzzwords.** Use vivid, relatable, and *intriguing* language that makes someone *feel* the problem and *see* the solution in action. Every part of the output should read like a concise, inspiring blueprint for a real product launch, delivered with the persuasive, human tone of a visionary founder.

			**Title Format:** The title should be descriptive, clearly indicating the product's function, target, or key benefit. It should be immediately understandable and compelling. **Optionally, you may add '($XM ARR potential)'** at the end if the ARR estimate from monetization is particularly compelling and realistic for a focused micro-SaaS.
				*Examples:* 'Smart Sunscreen Wristband for Kids', 'AI-Powered Sketch-to-3D Tool for SMB Architects', 'Automated Compliance Assistant for Freelance Consultants'.

			**Narrative Quality:** The 'description', 'problemSolution', and 'executiveSummary' fields must tell a compelling, empathetic story.
				- Introduce the *specific user archetype* (e.g., 'a busy e-commerce manager' or 'a small accounting firm owner') and their *acute pain*.
				- Describe *how your product uniquely and delightfully solves it*.
				- Implicitly convey the 'why now' (how the larger trend makes this solution critical) and the vision for growth, similar to the engaging 'SunBuddy' example.

			**Actionability & Next Steps:**
			- For 'executionPlan': Provide concrete, exciting next steps for building and launching the MVP.
			- For 'tractionSignals': Suggest tangible, early indicators of success to look for.
			- For 'frameworkFit': Explain how this idea aligns with a recognized startup framework or investment thesis, making it strategically sound.

			Return JSON in this exact shape:
			{
			  "title": "string (FORMAT: Descriptive title clearly indicating product function, target, or key benefit. Optionally, add '($XM ARR potential)' if compelling.)",
			  "description": "string (a captivating, narrative description (~3-5 sentences) that introduces the specific *user archetype*, their pain, and how the product directly and delightfully solves it. Weave in the 'why now' and the essence of the solution, implying GTM and growth vision.)",
			  "executiveSummary": "string (a concise, compelling pitch for *this focused idea*, highlighting the specific problem solved for the niche and its unique value)",
			  "problemSolution": "string (story format: 'A small business owner spends hours on X. This product automates this by Y, saving Z and delighting them by A.')",
			  "problemStatement": "string (a sharp, empathetic statement of the specific problem for the narrow target)",
			  "innovationLevel": number (1-10),
			  "timeToMarket": number (months, realistic for a focused MVP),
			  "confidenceScore": number (1-10),
			  "narrativeHook": "string (a punchy, memorable tagline that grabs attention, e.g., 'Never worry about re-applying sunscreen again.', or 'Stop guessing. Start growing.')",
			  "targetKeywords": ["niche keyword 1", "niche keyword 2", "niche keyword 3"],
			  "urgencyLevel": number (1-10),
			  "executionComplexity": number (1-10, for the FOCUSED MVP and initial value proposition),
			  "tags": ["SaaS", "Niche", "AI", "specific-industry-tag"],
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
			  },
			  "executionPlan": "string (concrete, exciting next steps for building and launching the MVP, including initial user acquisition)",
			  "tractionSignals": "string (tangible, early indicators of success to look for in the first 3-6 months, e.g., 'X beta users achieving Y result', 'Z% conversion rate on landing page')",
			  "frameworkFit": "string (how this idea aligns with a recognized startup framework, investment thesis, or macro trend, making it strategically sound)"
			}

			The final idea should be so clear, compelling, and *realistic* that someone could literally start building its core MVP tomorrow morning. Make it undeniably real and inspiring.`;
			
			const userPrompt = `Synthesize all this detailed research into a single, utterly compelling, and *immediately actionable* startup idea. This isn't just a report; it's a blueprint for a product someone would *love* to build and *pay* for.

			**Your mission:** Transform the raw data below into a vivid, human-centric story that clearly showcases:
			1.  **Who** has this painful problem (a specific user archetype).
			2.  **What** their daily struggle feels like.
			3.  **How** your product uniquely and delightfully solves it.
			4.  **Why** now is the perfect time to build this.
			5.  **How** it will grow and make money, implicitly including the go-to-market.
			
			**Think: "Smart Sunscreen Wristband for Kids" or "AI Inventory Manager for Small Retailers" for the title and overall narrative style.** Make it relatable, exciting, and concrete.
			
			---
			**Raw Research Inputs:**
			TREND: ${context.trends?.title} - ${context.trends?.description}
			PROBLEMS: ${context.problemGaps?.problems.join(", ")}
			POSITIONING: ${context.competitive?.positioning.valueProposition}
			MONETIZATION: ${context.monetization?.primaryModel}
			---
			
			**Return the final, polished startup idea in this exact JSON format:**
			{
			  "title": "string (FORMAT: Descriptive title clearly indicating product function, target, or key benefit. Optionally, add '($XM ARR potential)' if compelling.)",
			  "description": "string (A captivating, narrative description (~3-5 sentences) that introduces the specific *user archetype*, their pain, and how the product directly and delightfully solves it. Weave in the 'why now' and the essence of the solution, implying GTM and growth vision.)",
			  "executiveSummary": "string (a concise, compelling pitch for *this focused idea*, highlighting the specific problem solved for the niche and its unique value)",
			  "problemSolution": "string (story format: 'A small business owner spends hours on X. This product automates this by Y, saving Z and delighting them by A.')",
			  "problemStatement": "string (a sharp, empathetic statement of the specific problem for the narrow target)",
			  "innovationLevel": number (1-10),
			  "timeToMarket": number (months, realistic for a focused MVP),
			  "confidenceScore": number (1-10),
			  "narrativeHook": "string (a punchy, memorable tagline that grabs attention, e.g., 'Never worry about re-applying sunscreen again.', or 'Stop guessing. Start growing.')",
			  "targetKeywords": ["niche keyword 1", "niche keyword 2", "niche keyword 3"],
			  "urgencyLevel": number (1-10),
			  "executionComplexity": number (1-10, for the FOCUSED MVP and initial value proposition),
			  "tags": ["SaaS", "Niche", "AI", "specific-industry-tag"],
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
			  },
			  "executionPlan": "string (Concrete, exciting next steps for building and launching the MVP, including initial user acquisition and validation strategy. Make it sound like a founder's immediate checklist.)",
			  "tractionSignals": "string (Tangible, early indicators of success to look for in the first 3-6 months. Examples: 'achieving 50 beta sign-ups with 20% daily active users', 'converting 10% of free trial users to paid plans', 'receiving 10 unsolicited testimonials.', 'securing 3 pilot customers who renew.')",
			  "frameworkFit": "string (How this idea aligns with a recognized startup framework, investment thesis, or macro trend, making it strategically sound. For example, 'This aligns with the 'Pickaxe for Gold Rush' framework by providing tools for X in the booming Y market,' or 'This is a classic 'Unbundling the Enterprise Suite' play for Z segment.')"
			}
			`;
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
				},
				executionPlan: "Build MVP with Zapier-like visual workflow builder, integrate 5 core SMB tools (QuickBooks, Shopify, MailChimp, Slack, Google Workspace), launch beta with 50 SMBs through direct outreach, iterate based on feedback, and scale through content marketing targeting SMB pain points.",
				tractionSignals: "Achieve 100 beta sign-ups with 40% weekly active usage, convert 15% of free trial users to $99/month paid plans, receive 25 unsolicited testimonials highlighting time savings, and secure 10 pilot customers who renew after 3-month trials.",
				frameworkFit: "This aligns with the 'Picks and Shovels' framework by providing essential automation tools for the booming SMB digital transformation market, positioned as a 'Unbundling Zapier for SMBs' play that focuses on ease-of-use over enterprise complexity."
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

			// Create lightweight summary for context
			const previousIdeaSummaries = previousIdeas.map(idea => ({
				title: idea.title,
				description: idea.description
			}));

			// Initialize agent context
			const agentContext: AgentContext = { 
				previousIdeas: previousIdeaSummaries 
			};

			// 1. Research trends
			console.log("📈 Researching trends...");
			debugLogger.info("📈 Starting trend research...");
			const trends = await this.trendResearchAgent(agentContext);
			if (!trends) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to research trends"), { step: "trendResearch" });
				throw new Error("Failed to research trends");
			}
			debugLogger.info("✅ Trend research completed", { trends });

			// 2. Identify problems and gaps
			console.log("🎯 Analyzing problems and gaps...");
			debugLogger.info("🎯 Starting problem gap analysis...", { trendsContext: trends });
			// Update context with trends
			agentContext.trends = trends;
			const problemGaps = await this.problemGapAgent(agentContext);
			if (!problemGaps) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to analyze problems"), { step: "problemGapAnalysis", trends });
				throw new Error("Failed to analyze problems");
			}
			debugLogger.info("✅ Problem gap analysis completed", { problemGaps });

			// 3. Research competitive landscape
			console.log("🏆 Researching competition...");
			debugLogger.info("🏆 Starting competitive intelligence...", { trends, problemGaps });
			// Update context with problem gaps
			agentContext.problemGaps = problemGaps;
			const competitive = await this.competitiveIntelligenceAgent(agentContext);
			if (!competitive) {
				debugLogger.logError("generateDailyIdea", new Error("Failed to research competition"), { step: "competitiveIntelligence", trends, problemGaps });
				throw new Error("Failed to research competition");
			}
			debugLogger.info("✅ Competitive intelligence completed", { competitive });

			// 4. Design monetization strategy
			console.log("💰 Designing monetization...");
			// Update context with competitive data
			agentContext.competitive = competitive;
			const monetization = await this.monetizationAgent(agentContext);
			if (!monetization) throw new Error("Failed to design monetization");

			// 5. Synthesize final idea
			console.log("🧠 Synthesizing idea...");
			// Update context with monetization data
			agentContext.monetization = monetization;
			const idea = await this.ideaSynthesisAgent(agentContext);
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

			// Create new related entities for execution plan, traction signals, and framework fit
			if (idea.executionPlan) {
				await IdeaGenerationAgentService.createExecutionPlan(
					idea.executionPlan,
					dailyIdea.id,
				);
			}

			if (idea.tractionSignals) {
				await IdeaGenerationAgentService.createTractionSignals(
					idea.tractionSignals,
					dailyIdea.id,
				);
			}

			if (idea.frameworkFit) {
				await IdeaGenerationAgentService.createFrameworkFit(
					idea.frameworkFit,
					dailyIdea.id,
				);
			}

			console.log("✅ Daily idea generated successfully:", dailyIdea.id);
			return dailyIdea.id;
		} catch (error) {
			console.error("❌ Daily idea generation failed:", error);
			return null;
		}
	},
};

export default IdeaGenerationAgentController;
