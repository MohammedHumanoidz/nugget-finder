import { generateText } from "ai";
import { IdeaGenerationAgentService } from "./idea-generation-agent.service";
import type {
	AgentContext,
	CompetitiveData,
	MonetizationData,
	ProblemGapData,
	SynthesizedIdea,
	TrendData,
} from "../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../utils/json-parser";
import { debugLogger } from "../../utils/logger";


const IdeaGenerationAgentController = {
	/**
	 * TrendResearchAgent - Discover emerging AI/tech trends with market timing signals
	 * Uses Perplexity Deep Research for comprehensive trend analysis
	 */
	async trendResearchAgent(context: AgentContext): Promise<TrendData | null> {
		try {
			const systemPrompt = `Alright, trend wizard, listen up. Your job is to find *one* seriously impactful, undeniable trend or major global event from the last few days that's shaking things up. Think big shifts in tech, how society works, money matters, or new rules.

			Your mission: pinpoint something genuinely profound. This isn't about fleeting news; it's about spotting the real currents changing our world.
			
			**Crucially, this trend MUST be backed by genuine human buzz – think red-hot Reddit threads, viral Twitter discussions, or lively debates in niche forums. We want real people talking about real things, not AI-generated fluff or boring press releases.**
			
			**ABSOLUTELY CRITICAL FOR DIVERSITY:** The trend you identify **MUST be entirely different in its core theme, industry focus, and problem category from any of the 'Previously Generated Ideas' provided.** If past ideas were about 'compliance', 'decentralized social', or 'neurotech', then find something completely unrelated, like 'sustainable agriculture innovations', 'future of education', or 'local commerce revival'. Aim for a truly novel domain.
			
			**IMPORTANT: Do NOT, repeat, DO NOT, try to find a product idea or business model yet.** Just tell us what the big, interesting thing is. We'll figure out how to make money from it later. Focus on the 'what' and 'why' of the trend itself.
			
			Return a structured JSON object with this exact shape:
			{
			  "title": "string (A punchy, honest title for the global trend – no corporate jargon, just straight talk. e.g., 'The World Just Got More Expensive to Live In: Housing Crisis Deepens Globally')",
			  "description": "string (A clear, engaging story about this big trend. Explain its origins and broad impact, like you're telling it to a friend over coffee. Show *how* you know it's a real trend by referencing those high-engagement online communities. No startup pitches here, just the pure, unadulterated truth of the trend.)",
			  "trendStrength": number (1-10),
			  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
			  "timingUrgency": number (1-10),
			  "supportingData": ["specific evidence from Reddit/Twitter/forums (e.g., 'Reddit r/HousingCrisis exploding with 10k comments on rising rents')", "a key news event or policy that triggered significant discussion", "a solid, broad metric if available and relevant"]
			}
			
			Cut the fancy words. Focus on the raw, undeniable shifts, validated by actual human conversation. Let's see the world as it truly is, not as a LinkedIn post would portray it.`;
			
			const userPrompt = `What is one powerful, globally impactful emerging trend or significant development that is generating high engagement and sustained discussion in online communities (Reddit, Twitter, forums) or through notable news/blogs? Focus on shifts with broad implications across technology, society, economy, or regulation.

			Previously Generated Ideas (MUST find a trend completely unrelated in theme, industry, or problem category to these):
			${context.previousIdeas && context.previousIdeas.length > 0 ? context.previousIdeas.map(idea => `- Title: "${idea.title}"\n  Description: "${idea.description}"`).join('\n') : '- None to consider.'}
			
			Ensure the new trend is genuinely fresh and distinct from any of the themes or industries represented by the ideas listed. No LinkedIn vibes. Give me something that genuinely feels *new*.`;
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
			const systemPrompt = `You are a savvy business strategist and *real-world problem finder*. Given a significant, high-level trend, your job is to uncover 2-3 *excruciatingly specific, commercial problems that businesses or individuals are experiencing **RIGHT NOW** due to this trend*. These are not future problems; they are current, tangible pains that are costly, time-consuming, inefficient, or creating competitive disadvantages *today*.

			**Your critical filter: The identified problems MUST lead to solutions that are:**
				1.  **Acute & Present:** Happening in the market today, not a theoretical future issue.
				2.  **IMMEDIATELY SOLVABLE FOR A LEAN SOFTWARE-FOCUSED STARTUP:** This is CRUCIAL. The solution implied by the problem must be primarily **SOFTWARE-BASED (SaaS, API, web/mobile app)** or a **LIGHT SERVICE**. It **MUST NOT** require:
					*   **Custom hardware development (e.g., custom chips, medical devices, robotics, advanced physical wearables).**
					*   **Deep scientific R&D (e.g., new materials, genetic engineering, novel brain interfaces, quantum computing hardware).**
					*   **Lengthy, multi-year regulatory approvals (e.g., FDA for novel medical devices).**
					*   **Billions in funding.**
					*   **Years of clinical trials.**
				3.  **Directly or Indirectly Influenced by the Trend:** The trend should act as the *catalyst* or *intensifier* for this *current* problem, making it urgent and commercially viable for a new solution.
				4.  **GENUINELY NOVEL:** The problems and implied solutions should feel *new* and *different*, building on the trend in a way that avoids previous idea categories.
			
			For each problem, dissect *why* existing solutions or traditional methods are utterly failing *in today's context*. Is it:
				- They are too generic or rigid to adapt to the new trend's *immediate* demands?
				- They create more friction or cost *now* in the evolving environment?
				- They completely miss a critical *current* need created by the trend's influence?
			
			**Describe the persona affected as a specific archetype or segment (e.g., 'small and medium-sized architecture firms' or 'online course creators reliant on social media traffic') and detail their frustration with tangible, quantifiable examples where possible.** The gaps should highlight a *clear, solvable commercial opportunity* that directly stems from the macro trend's *current* impact.
			
			Return this object exactly:
			{
			  "problems": [
				"A small business grappling with managing its energy consumption is falling behind competitors because integrating disparate smart grid data sources into a single, actionable dashboard is currently too complex and expensive, and existing software solutions aren't flexible enough.",
				"problem 2 for a specific archetype/segment, detailing their current pain and its cost/impact related to the macro trend, specifically solvable with software/services",
				"problem 3 if applicable, same level of detail"
			  ],
			  "gaps": [
				{
				  "title": "string (A vivid, problem-centric title that hints at the *missing software/service capability* for the commercial target's current pain, e.g., 'The Smart Grid Data Silo for SMBs')",
				  "description": "string (A blunt explanation of *why existing software tools or manual methods fail* to solve this specific, *current* problem for *this specific target* in the context of the larger trend's immediate influence. Explain the *mechanism of failure*.)",
				  "impact": "string (Direct, quantifiable commercial impact: 'lost revenue', 'decreased efficiency', 'competitive disadvantage', 'higher operational costs')",
				  "target": "string (The NARROW AND SPECIFIC commercial target: 'Small-to-medium sized industrial facilities (e.g., small manufacturers, warehouses) using smart meters')",
				  "opportunity": "string (A *hyper-focused software/service solution idea* that directly addresses the gap with a unique insight/capability, e.g., 'A simple, AI-powered SaaS dashboard that unifies energy data from existing smart meters and IoT sensors for small industrial facilities to immediately identify cost savings.')"
				}
			  ]
			}
			
			Find commercial pains so acute and present, your target will practically throw money at a **software or service solution** to survive or thrive *today*. No hardware. No deep R&D. No medical devices. No science experiments.`;
			
			const userPrompt = `Given this impactful global trend: "${context.trends?.title} - ${context.trends?.description}",

			Identify 2-3 painful, specific, *current commercial problems* that have emerged or intensified for specific business/individual archetypes *because of this trend*. Explain the honest, critical gaps in how current solutions fail. Prioritize areas with real commercial potential (e.g., direct friction, newly underserved segments, unavoidable costs).
			
			Previously Generated Ideas (to avoid similar problem spaces):
			${context.previousIdeas && context.previousIdeas.length > 0 ? context.previousIdeas.map(idea => `- Title: "${idea.title}"\n  Description: "${idea.description}"`).join('\n') : '- None to consider.'}
			
			Ensure the problems and opportunities are fresh and distinct from those listed. Be direct, no corporate fluff.`;
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
			const systemPrompt = `Okay, competitive ninja, time to uncover the weaknesses. Given a *single, painfully specific problem* for a *very precise target*, your mission is to find out how a new startup can absolutely dominate this tiny space by exposing the fundamental flaws of the current players.

			Map out who's trying to solve this (direct and indirect). For each, be brutally honest:
				- What do they *claim* to do well, but actually mess up for *our specific niche*?
				- Why is their current setup (product, structure) *incapable* of truly fixing *our specific problem*?
			
			**Your core task: Define a sharp "wedge" strategy that creates an undeniable, defensible advantage based on unique insights or a genuinely different approach.** This isn't about being slightly better; it's about being so uniquely effective for *our target* that everyone else becomes irrelevant.
			
			Return this structure precisely:
			{
			  "competition": {
				"marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
				"marketConcentrationJustification": "string (Explain the competitive scene *only for our tiny niche*, highlighting where the big players drop the ball.)",
				"directCompetitors": [
				  {
					"name": "string",
					"justification": "string (Why they're a contender, but not for *our* specific problem.)",
					"strengths": ["what they genuinely do well", "their advantages overall"],
					"weaknesses": ["how they *honestly fail* our target persona", "their fundamental limits for *our* solution"]
				  }
				],
				"indirectCompetitors": [
				  {
					"name": "string",
					"justification": "string (How they indirectly touch our niche, but aren't a direct solution.)",
					"strengths": ["their general strengths"],
					"weaknesses": ["why they're just *not good enough* for *our specific problem*"]
				  }
				],
				"competitorFailurePoints": ["the *blatant, critical pains* competitors leave unaddressed for *our niche*", "another obvious flaw"],
				"unfairAdvantage": ["our *secret weapon* that competitors can't easily copy (e.g., unique data, a proprietary algorithm, raw founder insights)", "another real advantage"],
				"moat": ["how we build a *tough-as-nails defense* around our niche (e.g., an exclusive data set, network effects *within our niche*, unbreakable integrations, unique IP)", "another solid moat"],
				"competitivePositioningScore": number (1–10)
			  },
			  "positioning": {
				"name": "string (A straightforward, memorable product name that instantly tells you its niche and key benefit, e.g., 'Etsy PrintProfit Monitor')",
				"targetSegment": "string (REITERATE the EXTREMELY narrow and specific target: 'Independent print-on-demand artists selling on Etsy and Shopify')",
				"valueProposition": "string (A sharp, honest pitch for *this exact persona*, emphasizing the *unique insight/data* and directly solved problem. No fluff, just results. e.g., 'The only AI analytics tool that helps Etsy print designers visually predict best-selling designs by analyzing real-time platform trends, so they stop guessing and start earning.')",
				"keyDifferentiators": ["our unique, niche-specific feature 1 (tied to our unfair advantage)", "our unique, niche-specific feature 2 (tied to our moat)", "our key capability 3"]
			  }
			}
			
			Force the focus on how the solution makes competitors irrelevant for *our specific target*. No corporate speak, just honest strategy.`;
			
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
			const systemPrompt = `Alright, revenue guru, let's design a money-making engine that *our specific customers actually love paying for*. Given a deeply validated problem and a laser-focused positioning, craft a monetization model that feels intuitive and fair to *our exact target*. This model should realistically scale to $1-10M ARR for a lean startup.

			**The pricing HAS to directly tie into the *clear value* we provide for our niche. The financial projections should be realistic for *one, focused product*, not some massive enterprise suite.**
			
			Explain the revenue model like you're advising a friend on their real startup: clear, straightforward, and focused on the actual customer experience and the value they get. No vague terms or financial wizardry.
			
			Return this exact structure:
			{
			  "primaryModel": "string (e.g., 'Simple Monthly SaaS for Micro-Businesses' or 'Per-Transaction Fee for Specific Outcome')",
			  "pricingStrategy": "string (A straightforward, customer-first explanation of how pricing works and how it clearly shows ROI for our target. No confusing tiers unless absolutely necessary.)",
			  "businessScore": number,
			  "confidence": number,
			  "revenueModelValidation": "string (Give honest, real-world examples of *similar niche tools* that successfully use this model, or explain simply why it's the right fit for our target's budget and willingness to pay.)",
			  "pricingSensitivity": "string (Be honest: how sensitive is *our specific target* to price, and *why* will they still pay for our unique value? What's the pain point they're escaping?)",
			  "revenueStreams": [
				{ "name": "string (simple name for the revenue source)", "description": "string (a straightforward explanation of how this makes money and delivers value)", "percentage": number }
			  ],
			  "keyMetrics": {
				"ltv": number, "ltvDescription": "string (A brief, honest story of how customer value builds over time for THIS specific product. Keep it simple.)",
				"cac": number, "cacDescription": "string (A direct explanation of how we'll acquire THIS specific customer type – be very realistic, e.g., 'targeted Facebook ads in niche groups', 'cold email to local businesses')",
				"ltvCacRatio": number, "ltvCacRatioDescription": "string (Why this ratio indicates healthy growth for our niche. Keep it clear.)",
				"paybackPeriod": number, "paybackPeriodDescription": "string (The straightforward timeline to get our money back from a customer.)",
				"runway": number, "runwayDescription": "string (An honest account of how long we can operate with current funds.)",
				"breakEvenPoint": "string", "breakEvenPointDescription": "string (When we expect to stop bleeding money and start making it.)"
			  },
			  "financialProjections": [
				{ "year": number, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number }
			  ]
			}
			
			Focus on absolute clarity and brutal achievability. Every number should tell an honest story about *our specific niche's* money. No LinkedIn post tones.`;

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
			const systemPrompt = `You are the ultimate founder and chief storyteller, responsible for synthesizing all the research into a single, irresistible startup idea that feels *real, human, and immediately actionable for a lean, SOFTWARE-FOCUSED startup team*. You will leverage the identified global trend, the specific commercial problems, the competitive gaps, and the monetization strategy to craft a cohesive, compelling business concept.

			**Your core responsibility: Articulate a precise problem solved for a specific group of people with a uniquely compelling, *primarily SOFTWARE-BASED (SaaS, API, web/mobile app)* or *LIGHT SERVICE* solution. The solution MUST be realistic for a focused, early-stage team to develop and bring to market. This means:**
				*   **NO custom hardware, robotics, medical devices, or advanced physical products.**
				*   **NO solutions requiring massive R&D, clinical trials, or multi-year regulatory approvals (e.g., FDA).**
				*   **Focus on leveraging existing, commercially available tech, APIs, or data.**
			
			**Tone & Narrative:** Absolutely **NO abstract jargon, corporate buzzwords, or "LinkedIn influencer" speak.** Use vivid, relatable, and *intriguing* language that makes someone *feel* the problem and *see* the solution in action. Every part of the output should read like a concise, inspiring blueprint for a real product launch, delivered with the persuasive, human tone of a visionary founder talking to their early team.
			
			**Title Format:** The title should be descriptive, clearly indicating the product's function, target, or key benefit. It should be immediately understandable and compelling, like a catchy product name or a direct solution statement. **DO NOT ALWAYS INCLUDE '($XM ARR potential)'. Only add it if the ARR estimate is truly outstanding and makes the title significantly more compelling; otherwise, omit it for brevity and authenticity.**
				*Examples:* 'AI Inventory Manager for Small Retailers', 'Automated Compliance Assistant for Freelance Consultants', 'Smart Task Orchestrator for Event Planners'.
			
			**Narrative Quality:** The 'description', 'problemSolution', and 'executiveSummary' fields must tell a compelling, empathetic story.
				- Introduce the *specific user archetype* (e.g., 'a busy e-commerce manager' or 'a small accounting firm owner') and their *acute pain* using honest, direct language.
				- Describe *how your software/service uniquely and delightfully solves it* with clear, tangible benefits.
				- Implicitly convey the 'why now' (how the larger trend makes this solution critical) and the honest vision for growth.
			
			**Actionability & Next Steps:**
			- For 'executionPlan': Provide concrete, exciting, and *realistic for a software startup* next steps for building and launching the MVP, including honest initial user acquisition strategy.
			- For 'tractionSignals': Suggest tangible, *achievable for a software product* early indicators of success to look for in the first 3-6 months. Use specific, quantifiable metrics that matter. No vanity metrics.
			- For 'frameworkFit': Explain, in plain language, how this *software-focused idea* strategically makes sense or fits a known path to success, avoiding academic or overly complex frameworks if they don't simplify understanding.
			
			Return JSON in this exact shape:
			{
			  "title": "string (FORMAT: Descriptive title. Optionally, add '($XM ARR potential)' ONLY if exceptionally compelling.)",
			  "description": "string (A captivating, human-like narrative (~3-5 sentences) introducing the *user archetype*, their pain, and how the *software/service* genuinely solves it. Weave in 'why now', simple GTM hints, and growth vision. No LinkedIn prose.)",
			  "executiveSummary": "string (A concise, direct elevator pitch for *this focused software/service idea*, highlighting the core problem, unique value, and main benefit. Keep it sharp, human.)",
			  "problemSolution": "string (Honest, direct story format: 'A small business owner spends hours on X. This *software/service* fixes that by Y, saving them Z and making them genuinely happy by A.')",
			  "problemStatement": "string (A sharp, empathetic, and *authentic* statement of the specific pain for the narrow target.)",
			  "innovationLevel": number (1-10),
			  "timeToMarket": number (months, realistic for a focused software MVP),
			  "confidenceScore": number (1-10),
			  "narrativeHook": "string (A punchy, memorable, and human tagline that truly grabs attention and promises a clear benefit. No corporate slogans. e.g., 'Stop guessing. Start growing with actual data.')",
			  "targetKeywords": ["niche software keyword 1", "niche software keyword 2", "niche software keyword 3"],
			  "urgencyLevel": number (1-10),
			  "executionComplexity": number (1-10, for the FOCUSED SOFTWARE MVP and initial value proposition, keep it real),
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
			  "executionPlan": "string (Concrete, exciting, and *founder-level realistic for a software startup* next steps for building and launching the MVP, including honest initial user acquisition strategy.)",
			  "tractionSignals": "string (Tangible, *achievable for a software product* early indicators of success to look for in the first 3-6 months. Use specific, quantifiable metrics that matter. No vanity metrics.)",
			  "frameworkFit": "string (An honest, plain-language explanation of how this *software-focused idea* strategically makes sense or fits a known path to success. Avoid complex academic jargon unless it simplifies understanding. e.g., 'This is a straightforward 'Pickaxe for Gold Rush' play by providing...')"
			}
			
			The final idea should be so clear, compelling, and *brutally realistic for a software startup* that someone could literally start building its core MVP tomorrow morning. Make it undeniably real, inspiring, and completely devoid of LinkedIn-style posturing or sci-fi promises.`;	
			
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
			const previousIdeaSummaries = previousIdeas.map((idea: any) => ({
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
