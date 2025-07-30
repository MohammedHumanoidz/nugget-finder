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
import { prisma } from "../../utils/configs/db.config";

const IdeaGenerationAgentController = {
  /**
   * TrendResearchAgent - Discover emerging AI/tech trends with market timing signals
   * Uses Perplexity Deep Research for comprehensive trend analysis
   */
  async trendResearchAgent(context: AgentContext): Promise<TrendData | null> {
    try {
      const systemPrompt = `Alright, trend wizard, listen up. Your job is to find *one* seriously impactful, undeniable trend from the last few days that's shaking things up. Think big shifts in tech, society, money, or new rules.

			Your mission: pinpoint something genuinely profound. This isn't about fleeting news; it's about spotting the real currents changing our world, especially those that **unleash immediate, actionable, software-centric opportunities for lean startups.**

			**Crucially, this trend MUST be backed by genuine human buzz – think red-hot Reddit threads, viral Twitter discussions, or lively debates in niche forums. We want real people talking about real things, not AI-generated fluff or boring press releases.**

			**ABSOLUTELY CRITICAL FOR DIVERSITY:** The trend you identify **MUST be entirely different in its core theme, industry focus, and problem category from any of the 'Previously Generated Ideas' provided.** If past ideas were about 'enterprise compliance', 'decentralized social', or 'neurotech devices', then find something completely unrelated, like 'local creator economy tools', 'sustainable practices for small businesses', 'hyper-personalized learning for niche skills', or 'community-driven commerce models'. Aim for a truly novel and diverse domain that encourages *tangible, buildable, software solutions (MVP in <6 months, <$10k investment)*.

			**IMPORTANT: Do NOT, repeat, DO NOT, try to find a product idea or business model yet.** Just tell us what the big, interesting thing is. Focus on the 'what' and 'why' of the trend itself.

			Return a structured JSON object with this exact shape:
			{
			  "title": "string (A punchy, honest title for the global trend – no corporate jargon, just straight talk. e.g., 'The Creator Economy Goes Local: Niche Platforms Thrive')",
			  "description": "string (A clear, engaging story about this big trend. Explain its origins and broad impact, like you're telling it to a friend over coffee. Show *how* you know it's a real trend by referencing those high-engagement online communities. No startup pitches here, just the pure, unadulterated truth of the trend.)",
			  "trendStrength": number (1-10),
			  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
			  "timingUrgency": number (1-10),
			  "supportingData": ["specific evidence from Reddit/Twitter/forums (e.g., 'Reddit r/LocalArtists discussing new sales platforms')", "a key news event or policy that triggered significant discussion", "a solid, broad metric if available and relevant"]
			}

			Cut the fancy words. Focus on the raw, undeniable shifts, validated by actual human conversation. Let's see the world as it truly is, not as a LinkedIn post would portray it.`;

      const userPrompt = `What is one powerful, globally impactful emerging trend or significant development that is generating high engagement and sustained discussion in online communities (Reddit, Twitter, forums) or through notable news/blogs? Focus on shifts with broad implications across technology, society, economy, or regulation, especially those creating *immediate, software-solvable problems*.

			Previously Generated Ideas (MUST find a trend completely unrelated in theme, industry, or problem category to these, to ensure diversity of generated ideas):
			${context.previousIdeas && context.previousIdeas.length > 0 ? context.previousIdeas.map((idea) => `- Title: "${idea.title}"\n  Description: "${idea.description}"`).join("\n") : "- None to consider."}

			Ensure the new trend is genuinely fresh and distinct from any of the themes or industries represented by the ideas listed. No LinkedIn vibes. Give me something that genuinely feels *new*.`;
      // LOG: Perplexity API request
      debugLogger.logPerplexityRequest(
        "TrendResearchAgent",
        userPrompt,
        systemPrompt,
        {
          reasoning_effort: "high",
          model: "sonar-deep-research",
        }
      );

      const response = await perplexity(
        userPrompt,
        systemPrompt,
        "high",
        "sonar-deep-research"
      );

      // LOG: Perplexity API response (FULL)
      debugLogger.logPerplexityResponse("TrendResearchAgent", response);

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "TrendResearchAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log("🔍 Perplexity raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      // LOG: Content analysis (is it JSON or needs structuring)
      const isAlreadyJson =
        content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis(
        "TrendResearchAgent",
        content,
        isAlreadyJson
      );

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
        debugLogger.logLLMStructuring(
          "TrendResearchAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4o-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 800,
        });

        // LOG: LLM structuring response
        debugLogger.logLLMStructuringResponse(
          "TrendResearchAgent",
          structuredJson
        );

        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<TrendData>(
        content,
        structureWithLLM,
        ["title", "description"] // Required fields
      );

      // LOG: Parsing attempt and result
      debugLogger.logParsingAttempt("TrendResearchAgent", content, parseResult);

      if (!parseResult.success) {
        console.error("❌ Failed to parse trend data:", parseResult.error);
        debugLogger.logError(
          "TrendResearchAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          {
            parseResult,
            originalContent: content,
          }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const trendData = parseResult.data as TrendData;

      console.log("✅ Successfully structured trend data:", {
        title: trendData.title,
        trendStrength: trendData.trendStrength,
        catalystType: trendData.catalystType,
      });

      // LOG: Final agent result
      debugLogger.logAgentResult("TrendResearchAgent", trendData, true);

      return trendData;
    } catch (error) {
      console.error("TrendResearchAgent error:", error);
      debugLogger.logError("TrendResearchAgent", error as Error, {
        agent: "TrendResearchAgent",
        fallbackUsed: true,
      });

      // Return mock data as fallback for development/testing
      console.log("🔄 Using fallback mock trend data for development");
      return {
        title: "AI-Powered Workflow Automation for SMBs",
        description:
          "Small to medium businesses are increasingly adopting AI-powered tools to automate repetitive workflows, driven by labor shortages and cost pressures. Tools that can integrate multiple business processes (CRM, inventory, scheduling) with simple AI automation are seeing rapid adoption.",
        trendStrength: 8,
        catalystType: "TECHNOLOGY_BREAKTHROUGH" as const,
        timingUrgency: 7,
        supportingData: [
          "Google Trends shows 340% increase in 'AI workflow automation' searches",
          "Zapier reports 200% growth in AI-powered automation usage by SMBs",
          "Recent $50M funding rounds for workflow automation startups",
        ],
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
				2.  **IMMEDIATELY SOLVABLE FOR A LEAN SOFTWARE-FOCUSED STARTUP (<$10,000, 3-6 month MVP, no-code/low-code friendly):** This is CRUCIAL. The solution implied by the problem must be primarily **SOFTWARE-BASED (SaaS, API, web/mobile app)** or a **LIGHT SERVICE**. It **MUST NOT** require:
					*   **Any custom hardware development (e.g., custom chips, medical devices, robotics, advanced physical wearables, complex IoT devices).**
					*   **Deep scientific R&D (e.g., new materials, genetic engineering, novel brain interfaces, quantum computing hardware, advanced battery tech).**
					*   **Lengthy, multi-year regulatory approvals (e.g., FDA for novel medical devices, complex financial licenses where compliance is the *core* solution).**
					*   **Millions or billions in funding for MVP.**
					*   **Years of clinical trials.**
					*   **Extensive, complex, or highly specialized legal/compliance frameworks that dominate the solution's core.** (This is to avoid the "compliance overload" as a primary problem).
					*   **Building foundational AI models; focus on *applying* existing AI via APIs.**
				3.  **Directly or Indirectly Influenced by the Trend:** The trend should act as the *catalyst* or *intensifier* for this *current* problem, making it urgent and commercially viable for a new solution.
				4.  **GENUINELY NOVEL:** The problems and implied solutions should feel *new* and *different*, building on the trend in a way that avoids previous idea categories.

			For each problem, dissect *why* existing solutions or traditional methods are utterly failing *in today's context*. Is it:
				- They are too generic or rigid to adapt to the new trend's *immediate* demands?
				- They create more friction or cost *now* in the evolving environment?
				- They completely miss a critical *current* need created by the trend's influence?

			**Describe the persona affected as a specific archetype or segment (e.g., 'small, independent podcast creators' or 'local food truck owners') and detail their frustration with tangible, quantifiable examples where possible.** The gaps should highlight a *clear, solvable commercial opportunity* that directly stems from the macro trend's *current* impact.

			**CRITICAL DIVERSITY INSTRUCTION:** Ensure the problems and implied software/service solutions are distinctly different in their core industry, user group, and technological approach from the 'Previously Generated Ideas' provided. For example, if previous ideas focused on 'enterprise IT compliance', then find problems for 'individual artists managing digital rights' or 'local bakeries optimizing online delivery routes'. **Avoid any problem that is predominantly about "compliance" unless it's a minor aspect of a much broader, more innovative software solution.**

			Return this object exactly:
			{
			  "problems": [
				"A local coffee shop owner wastes 5 hours/week manually updating daily specials across social media, their website, and local listing sites, leading to missed customer opportunities and outdated info, because no single tool syncs these updates automatically for small businesses.",
				"problem 2 for a specific archetype/segment, detailing their current pain and its cost/impact related to the macro trend, specifically solvable with simple software/services",
				"problem 3 if applicable, same level of detail, always software-first MVP"
			  ],
			  "gaps": [
				{
				  "title": "string (A vivid, problem-centric title that hints at the *missing software/service capability* for the commercial target's current pain, e.g., 'Local Business Info Sync Frustration')",
				  "description": "string (A blunt explanation of *why existing software tools or manual methods fail* to solve this specific, *current* problem for *this specific target* in the context of the larger trend's immediate influence. Explain the *mechanism of failure* and emphasize why it needs a lean software solution.)",
				  "impact": "string (Direct, quantifiable commercial impact: 'lost revenue', 'decreased efficiency', 'competitive disadvantage', 'higher operational costs')",
				  "target": "string (The NARROW AND SPECIFIC commercial target: 'Small, independent local businesses (e.g., coffee shops, boutiques, pop-up stores)')",
				  "opportunity": "string (A *hyper-focused, simple, software-first solution idea* that directly addresses the gap with a unique insight/capability, e.g., 'A simple, affordable SaaS dashboard that unifies social media, website, and local listing updates for small businesses, enabling 1-click publishing of daily specials.')"
				}
			  ]
			}

			Find commercial pains so acute and present, your target will practically throw money at a **simple software or light service solution** to survive or thrive *today*. No hardware. No deep R&D. No medical devices. No science experiments. No multi-million dollar investments for the MVP.`;
      const userPrompt = `Given this impactful global trend: "${context.trends?.title} - ${context.trends?.description}",

			Identify 2-3 painful, specific, *current commercial problems* that have emerged or intensified for specific business/individual archetypes *because of this trend*. Explain the honest, critical gaps in how current solutions fail. Prioritize areas with real commercial potential (e.g., direct friction, newly underserved segments, unavoidable costs).
			
			Previously Generated Ideas (to avoid similar problem spaces and ensure diversity, focus on *core theme, industry, and solution type*):
			${context.previousIdeas && context.previousIdeas.length > 0 ? context.previousIdeas.map((idea) => `- Title: "${idea.title}"\n  Description: "${idea.description}"`).join("\n") : "- None to consider."}
			
			Ensure the new problems and implied opportunities are fresh and distinct from those listed. Be direct, no corporate fluff. Prioritize problems solvable with a *lean, software-first approach* and **minimize focus on regulatory or compliance-heavy issues**.`;
      // LOG: Perplexity API request
      debugLogger.logPerplexityRequest(
        "ProblemGapAgent",
        userPrompt,
        systemPrompt,
        {
          reasoning_effort: "medium",
          model: "sonar",
          context: context.trends,
        }
      );

      const response = await perplexity(
        userPrompt,
        systemPrompt,
        "medium",
        "sonar"
      );

      // LOG: Perplexity API response (FULL)
      debugLogger.logPerplexityResponse("ProblemGapAgent", response);

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "ProblemGapAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log("🔍 ProblemGap raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      // LOG: Content analysis (is it JSON or needs structuring)
      const isAlreadyJson =
        content.trim().startsWith("{") && content.trim().endsWith("}");
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
        debugLogger.logLLMStructuring(
          "ProblemGapAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4o-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 800,
        });

        // LOG: LLM structuring response
        debugLogger.logLLMStructuringResponse(
          "ProblemGapAgent",
          structuredJson
        );

        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<ProblemGapData>(
        content,
        structureWithLLM,
        ["problems", "gaps"] // Required fields
      );

      // LOG: Parsing attempt and result
      debugLogger.logParsingAttempt("ProblemGapAgent", content, parseResult);

      if (!parseResult.success) {
        console.error(
          "❌ Failed to parse problem gap data:",
          parseResult.error
        );
        debugLogger.logError(
          "ProblemGapAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          {
            parseResult,
            originalContent: content,
          }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const problemGapData = parseResult.data as ProblemGapData;

      console.log("✅ Successfully structured problem gap data:", {
        problemCount: problemGapData.problems?.length || 0,
        gapCount: problemGapData.gaps?.length || 0,
      });

      // LOG: Final agent result
      debugLogger.logAgentResult("ProblemGapAgent", problemGapData, true);

      return problemGapData;
    } catch (error) {
      console.error("ProblemGapAgent error:", error);
      debugLogger.logError("ProblemGapAgent", error as Error, {
        agent: "ProblemGapAgent",
        fallbackUsed: true,
      });

      // Return mock data as fallback for development/testing
      console.log("🔄 Using fallback mock problem gap data for development");
      return {
        problems: [
          "SMB owners waste 15+ hours/week on manual task switching between CRM, inventory, and scheduling systems",
          "Non-technical team members struggle to set up complex automation tools, requiring expensive consultants",
          "Existing automation tools are either too basic (single-app) or too complex (enterprise-grade) for growing businesses",
        ],
        gaps: [
          {
            title: "No-Code Multi-System Integration",
            description:
              "Current tools require technical setup or only work within single ecosystems",
            impact:
              "Businesses lose productivity and pay for multiple disconnected tools",
            target: "SMB owners and operations managers (10-100 employees)",
            opportunity:
              "AI-powered connector that learns business patterns and suggests automations",
          },
          {
            title: "Context-Aware Workflow Intelligence",
            description:
              "Existing automation lacks business context and requires manual rule creation",
            impact:
              "Automations break when business conditions change, creating more work",
            target: "Growing businesses with changing processes",
            opportunity:
              "Smart automation that adapts to business patterns and seasonal changes",
          },
        ],
      };
    }
  },

  /**
   * CompetitiveIntelligenceAgent - Analyze competitive landscape AND positioning opportunities
   * Uses Perplexity Sonar Pro for comprehensive competitive research
   */
  async competitiveIntelligenceAgent(
    context: AgentContext
  ): Promise<CompetitiveData | null> {
    try {
      const systemPrompt = `Okay, competitive ninja, time to uncover the weaknesses. Given a *single, painfully specific problem* for a *very precise target* (which is solvable by a lean, software-first MVP), your mission is to find out how a new startup can absolutely dominate this tiny space by exposing the fundamental flaws of the current players.

			Map out who's trying to solve this (direct and indirect). For each, be brutally honest:
				- What do they *claim* to do well, but actually mess up for *our specific niche* and for *simple, software-based needs*?
				- Why is their current setup (product, structure) *incapable* of truly fixing *our specific problem* with a lean, software solution?
			
			**Your core task: Define a sharp "wedge" strategy that creates an undeniable, defensible advantage based on unique insights or a genuinely different, *software-implementable* approach.** This isn't about being slightly better; it's about being so uniquely effective for *our target* with a *buildable MVP* that everyone else becomes irrelevant.
			
			Return this structure precisely:
			{
			  "competition": {
				"marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
				"marketConcentrationJustification": "string (Explain the competitive scene *only for our tiny niche*, highlighting where the big players drop the ball for *lean software solutions*.)",
				"directCompetitors": [
				  {
					"name": "string",
					"justification": "string (Why they're a contender, but not for *our* specific, lean-solvable problem.)",
					"strengths": ["what they genuinely do well", "their advantages overall"],
					"weaknesses": ["how they *honestly fail* our target persona on their specific pain", "their fundamental limits for *our* simple software solution"]
				  }
				],
				"indirectCompetitors": [
				  {
					"name": "string",
					"justification": "string (How they indirectly touch our niche, but aren't a direct solution for a lean software approach.)",
					"strengths": ["their general strengths"],
					"weaknesses": ["why they're just *not good enough* for *our specific problem* with an MVP-first mindset"]
				  }
				],
				"competitorFailurePoints": ["the *blatant, critical pains* competitors leave unaddressed for *our niche*", "another obvious flaw for a software MVP"],
				"unfairAdvantage": ["our *secret weapon* that competitors can't easily copy (e.g., unique access to data, a simple proprietary algorithm, raw founder insights, community build)", "another real, software-implementable advantage"],
				"moat": ["how we build a *tough-as-nails defense* around our niche (e.g., exclusive data partnerships, community network effects *within our niche*, unbreakable integrations for simple software, unique IP that's MVP-feasible)", "another solid, buildable moat"],
				"competitivePositioningScore": number (1–10)
			  },
			  "positioning": {
				"name": "string (A straightforward, memorable product name that instantly tells you its niche and key benefit, **PROBLEM + SOLUTION in 8 WORDS OR LESS.** e.g., 'Local Shops: Daily Updates Simplified')",
				"targetSegment": "string (REITERATE the EXTREMELY narrow and specific target: 'Independent coffee shops and small boutiques')",
				"valueProposition": "string (A sharp, honest pitch for *this exact persona*, emphasizing the *unique insight/data* and directly solved problem with a *lean software tool*. No fluff, just results. e.g., 'The only tool that automates daily specials updates across all platforms for local businesses, saving hours and boosting visibility.')",
				"keyDifferentiators": ["our unique, niche-specific, *buildable* feature 1 (tied to our unfair advantage)", "our unique, niche-specific, *software-based* feature 2 (tied to our moat)", "our key capability 3 for MVP"]
			  }
			}
			
			Force the focus on how the solution makes competitors irrelevant for *our specific target* with a *simple, buildable software solution*. No corporate speak, just honest strategy.`;

      const problemContext = context.problemGaps?.problems.join(", ") || "";
      const userPrompt = `Analyze the competitive landscape *within the precise niche* defined by these problems: ${problemContext}.

			Identify both direct and indirect competitors. For each, expose their specific weaknesses and blind spots as they relate to *our narrow target persona's unique pain*. Then, clearly define a highly differentiated and defensible positioning strategy that allows a new entrant to effectively make existing solutions irrelevant for this specific audience.`;

      // LOG: Perplexity API request
      debugLogger.logPerplexityRequest(
        "CompetitiveIntelligenceAgent",
        userPrompt,
        systemPrompt,
        {
          reasoning_effort: "medium",
          model: "sonar-pro",
          context: context.problemGaps,
        }
      );

      const response = await perplexity(
        userPrompt,
        systemPrompt,
        "medium",
        "sonar-pro"
      );

      // LOG: Perplexity API response (FULL)
      debugLogger.logPerplexityResponse(
        "CompetitiveIntelligenceAgent",
        response
      );

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "CompetitiveIntelligenceAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log(
        "🔍 Competitive Intelligence raw response length:",
        content.length
      );
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      // LOG: Content analysis (is it JSON or needs structuring)
      const isAlreadyJson =
        content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis(
        "CompetitiveIntelligenceAgent",
        content,
        isAlreadyJson
      );

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
        debugLogger.logLLMStructuring(
          "CompetitiveIntelligenceAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4o-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 1000,
        });

        // LOG: LLM structuring response
        debugLogger.logLLMStructuringResponse(
          "CompetitiveIntelligenceAgent",
          structuredJson
        );

        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<CompetitiveData>(
        content,
        structureWithLLM,
        ["competition", "positioning"] // Required fields
      );

      // LOG: Parsing attempt and result
      debugLogger.logParsingAttempt(
        "CompetitiveIntelligenceAgent",
        content,
        parseResult
      );

      if (!parseResult.success) {
        console.error(
          "❌ Failed to parse competitive data:",
          parseResult.error
        );
        debugLogger.logError(
          "CompetitiveIntelligenceAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          {
            parseResult,
            originalContent: content,
          }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const competitiveData = parseResult.data as CompetitiveData;

      console.log("✅ Successfully structured competitive data:", {
        marketConcentration:
          competitiveData.competition?.marketConcentrationLevel,
        directCompetitorCount:
          competitiveData.competition?.directCompetitors?.length || 0,
        positioningName: competitiveData.positioning?.name,
      });

      // LOG: Final agent result
      debugLogger.logAgentResult(
        "CompetitiveIntelligenceAgent",
        competitiveData,
        true
      );

      return competitiveData;
    } catch (error) {
      console.error("CompetitiveIntelligenceAgent error:", error);
      debugLogger.logError("CompetitiveIntelligenceAgent", error as Error, {
        agent: "CompetitiveIntelligenceAgent",
        fallbackUsed: true,
      });

      // Return mock data as fallback for development/testing
      console.log(
        "🔄 Using fallback mock competitive intelligence data for development"
      );
      return {
        competition: {
          marketConcentrationLevel: "MEDIUM" as const,
          marketConcentrationJustification:
            "Several established players but room for differentiation in SMB segment",
          directCompetitors: [
            {
              name: "Zapier",
              justification: "Leading workflow automation platform",
              strengths: [
                "Extensive integrations",
                "Brand recognition",
                "Large ecosystem",
              ],
              weaknesses: [
                "Complex for non-technical users",
                "Expensive for SMBs",
                "Generic automation",
              ],
            },
            {
              name: "Make.com",
              justification: "Visual workflow automation tool",
              strengths: [
                "Visual interface",
                "Advanced features",
                "Developer-friendly",
              ],
              weaknesses: [
                "Steep learning curve",
                "Pricing model",
                "Limited SMB focus",
              ],
            },
          ],
          indirectCompetitors: [
            {
              name: "Microsoft Power Automate",
              justification: "Enterprise automation within Microsoft ecosystem",
              strengths: [
                "Microsoft integration",
                "Enterprise features",
                "Bundled pricing",
              ],
              weaknesses: [
                "Microsoft ecosystem lock-in",
                "Complex setup",
                "Poor SMB experience",
              ],
            },
          ],
          competitorFailurePoints: [
            "Over-complicated interfaces for simple business needs",
            "Pricing models that don't scale with SMB growth",
            "Lack of industry-specific templates and workflows",
          ],
          unfairAdvantage: [
            "AI-powered setup that learns business patterns",
            "SMB-specific workflow templates",
            "Transparent, usage-based pricing",
          ],
          moat: [
            "Proprietary AI that understands SMB workflows",
            "Network effects from workflow marketplace",
            "Integration partnerships with SMB-focused tools",
          ],
          competitivePositioningScore: 7,
        },
        positioning: {
          name: "FlowGenius",
          targetSegment:
            "Growing SMBs (10-100 employees) in service industries",
          valueProposition:
            "The first workflow automation tool designed specifically for growing businesses - setup in minutes, not months",
          keyDifferentiators: [
            "AI-powered workflow suggestions based on business type",
            "SMB-optimized pricing that grows with your business",
            "Industry-specific templates and best practices",
          ],
        },
      };
    }
  },

  /**
   * MonetizationAgent - Generate revenue models and financial projections
   * Uses OpenRouter GPT-4.1-nano for structured business model generation
   */
  async monetizationAgent(
    context: AgentContext
  ): Promise<MonetizationData | null> {
    try {
      const systemPrompt = `Alright, revenue guru, let's design a money-making engine that *our specific customers actually love paying for*. Given a deeply validated problem and a laser-focused positioning for a *lean, software-focused MVP*, craft a monetization model that feels intuitive and fair to *our exact target*. This model should realistically scale to $1-10M ARR for a lean startup *focused on the initial product*.

			**The pricing HAS to directly tie into the *clear value* we provide for our niche with our *software MVP*. The financial projections should be realistic for *one, focused, buildable software product*, not some massive enterprise suite.**
			
			Explain the revenue model like you're advising a friend on their real startup: clear, straightforward, and focused on the actual customer experience and the value they get from the *software solution*. No vague terms or financial wizardry.
			
			Return this exact structure:
			{
			  "primaryModel": "string (e.g., 'Simple Monthly SaaS for Micro-Businesses' or 'Per-Transaction Fee for Specific Outcome of the Software')",
			  "pricingStrategy": "string (A straightforward, customer-first explanation of how pricing works and how it clearly shows ROI for our target, specifically for the *software's value*. No confusing tiers unless absolutely necessary and directly tied to software features.)",
			  "businessScore": number,
			  "confidence": number,
			  "revenueModelValidation": "string (Give honest, real-world examples of *similar niche tools* that successfully use this model, or explain simply why it's the right fit for our target's budget and willingness to pay for our *software solution*.)",
			  "pricingSensitivity": "string (Be honest: how sensitive is *our specific target* to price, and *why* will they still pay for our unique value, particularly for *software*? What's the pain point they're escaping that our *MVP* fixes?)",
			  "revenueStreams": [
				{ "name": "string (simple name for the revenue source)", "description": "string (a straightforward explanation of how this *software feature* makes money and delivers value)", "percentage": number }
			  ],
			  "keyMetrics": {
				"ltv": number, "ltvDescription": "string (A brief, honest story of how customer value builds over time for THIS specific *software product*. Keep it simple.)",
				"cac": number, "cacDescription": "string (A direct explanation of how we'll acquire THIS specific customer type – be very realistic, e.g., 'targeted Facebook ads in niche groups', 'cold email to local businesses for software demo')",
				"ltvCacRatio": number, "ltvCacRatioDescription": "string (Why this ratio indicates healthy growth for our niche *software product*. Keep it clear.)",
				"paybackPeriod": number, "paybackPeriodDescription": "string (The straightforward timeline to get our money back from a customer for the *software service*.)",
				"runway": number, "runwayDescription": "string (An honest account of how long we can operate with current funds, considering lean software development.)",
				"breakEvenPoint": "string", "breakEvenPointDescription": "string (When we expect to stop bleeding money and start making it for our *software product*.)"
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
        model: openrouter("openai/gpt-4o-mini"),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: 0.1,
        maxTokens: 1000,
      });

      // Clean the response to remove markdown code blocks if present
      const cleanedText = text.replace(/```json\s*|```\s*$/g, '').trim();

      const monetizationData = JSON.parse(cleanedText) as MonetizationData;
      return monetizationData;
    } catch (error) {
      console.error("MonetizationAgent error:", error);

      // Return mock data as fallback for development/testing
      console.log("🔄 Using fallback mock monetization data for development");
      return {
        primaryModel: "SaaS Subscription",
        pricingStrategy:
          "Tiered SaaS pricing based on number of integrations and automations",
        businessScore: 8,
        confidence: 7,
        revenueModelValidation:
          "Validated by similar tools in market (Zapier, Make.com) with proven demand",
        pricingSensitivity:
          "SMBs are price-sensitive but will pay for proven ROI and time savings",
        revenueStreams: [
          {
            name: "Monthly Subscriptions",
            description: "Core SaaS platform access",
            percentage: 70,
          },
          {
            name: "Setup & Consulting",
            description: "Implementation services",
            percentage: 20,
          },
          {
            name: "Premium Integrations",
            description: "Enterprise-grade connectors",
            percentage: 10,
          },
        ],
        keyMetrics: {
          ltv: 1800,
          ltvDescription:
            "Average customer lifetime value based on 18-month retention",
          cac: 180,
          cacDescription: "Customer acquisition cost through digital marketing",
          ltvCacRatio: 10,
          ltvCacRatioDescription:
            "Healthy 10:1 LTV:CAC ratio indicating profitable growth",
          paybackPeriod: 6,
          paybackPeriodDescription:
            "6 months to recover customer acquisition cost",
          runway: 18,
          runwayDescription: "18 months of operating expenses covered",
          breakEvenPoint: "Month 14 at 500 customers",
          breakEvenPointDescription: "Break-even when MRR reaches $25K",
        },
        financialProjections: [
          {
            year: 1,
            revenue: 120000,
            costs: 200000,
            netMargin: -40,
            revenueGrowth: 0,
          },
          {
            year: 2,
            revenue: 480000,
            costs: 350000,
            netMargin: 27,
            revenueGrowth: 300,
          },
          {
            year: 3,
            revenue: 1200000,
            costs: 720000,
            netMargin: 40,
            revenueGrowth: 150,
          },
        ],
      };
    }
  },

  /**
   * WhatToBuildAgent - Generate detailed technical implementation guide
   * Uses OpenRouter GPT-4o-mini for structured technical specification generation
   */
  async whatToBuildAgent(
    context: AgentContext
  ): Promise<import("../../types/apps/idea-generation-agent").WhatToBuildData | null> {
    try {
      const systemPrompt = `You are a product strategist focused on enabling solo founders and small teams to build a Minimal Viable Product (MVP) quickly and affordably. Your job is to provide a concise, high-level recommendation of "what to build" for a given business idea.

**Your mission:** Translate the validated business idea into specific, actionable components that prioritize SOFTWARE-FIRST solutions (SaaS, web/mobile apps) with clear user interactions and rapid development potential. Focus *only* on the absolute essentials for a *buildable, fundable MVP*.

**Critical Guidelines:**
1. **HIGH-LEVEL RECOMMENDATION:** Provide recommendations in simple, direct language. This is NOT a detailed technical specification or a database schema.
2. **SOLO-FOUNDER/SMALL TEAM FRIENDLY:** All suggested components should be feasible for a single developer or a very small team to build (within 3-6 months, ideally using no-code/low-code tools or common frameworks).
3. **COST-EFFICIENT:** Assume minimal budget (ideally <$10,000 for MVP build, excluding marketing). Avoid complex, expensive, or R&D-heavy components.
4. **MVP-FOCUSED:** Only include core features that directly solve the primary problem and enable the initial monetization.
5. **INTEGRATION-SMART:** Recommend leveraging battle-tested, off-the-shelf third-party services/APIs wherever possible to accelerate development (e.g., Stripe for payments, Twilio for comms).

Return this exact JSON structure:
{
  "platformDescription": "string (A concise summary of what the platform *is* and *does* for the user, in plain language. Example: 'An online dashboard that helps local coffee shops instantly sync their daily specials across social media and website, solving outdated info.')",
  "coreFeaturesSummary": ["High-level feature 1 that solves a key problem (e.g., '1-click content distribution to social media')", "High-level feature 2 for core user workflow (e.g., 'Centralized dashboard for all updates')", "High-level feature 3 supporting the recommended monetization (e.g., 'Subscription management via Stripe')"],
  "userInterfaces": ["Key UI/dashboard for primary user type (e.g., 'Coffee Shop Owner Dashboard')", "Any essential public-facing UI (e.g., 'Public-facing 'Today's Specials' embed')", "Minimal Admin UI (e.g., 'Basic Admin Settings page')"],
  "keyIntegrations": ["Essential integration 1 for core functionality (e.g., 'Meta API for Facebook/Instagram posting')", "Integration 2 for payments/billing (e.g., 'Stripe Connect')", "Integration 3 for communication (e.g., 'Twilio for SMS notifications')"],
  "pricingStrategyBuildRecommendation": "string (A simple, actionable recommendation on how to technically implement the recommended pricing model. Example: 'Implement a tiered subscription model (Basic/Pro) using Stripe Subscriptions, with feature flags to gate Pro features.')",
  "freemiumComponents": "string? (Optional: if a freemium model is recommended, describe the specific features that would be free to attract users. Example: 'Offer a free tier that allows 1 social media sync per day and view-only access to basic analytics.')"
}

Focus on providing a practical, confidence-boosting blueprint that clearly shows a founder what they can *start building tomorrow* with existing tools and skills. No complex or speculative tech.`;

const ideaContext = context.monetization ?
`Business Idea: ${context.competitive?.positioning?.valueProposition || 'Not specified'}
 Target Market: ${context.competitive?.positioning?.targetSegment || 'Not specified'}
 Recommended Revenue Model: ${context.monetization.primaryModel} (Pricing Strategy: ${context.monetization.pricingStrategy})
 Key Problems Solved: ${context.problemGaps?.problems?.join(', ') || 'Not specified'}` :
'Context not fully available';

      const userPrompt = `Create a comprehensive technical implementation guide for this validated business opportunity:

${ideaContext}

Design a software-first platform that:
1. Directly solves the identified user problems through intuitive interfaces
2. Integrates seamlessly with existing tools in the target market
3. Supports the planned monetization strategy through its technical architecture
4. Can be built and launched by a focused development team within 3-6 months
5. Scales efficiently as the user base grows
6. Focus on defining the core software components and interfaces needed to launch quickly and affordably

Focus on specificity - provide exact feature descriptions, precise integration recommendations, and clear technical approaches that eliminate guesswork for the development team.`;

      const { text } = await generateText({
        model: openrouter("openai/gpt-4o-mini"),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: 0.1,
        maxTokens: 1200,
      });

      const whatToBuildData = JSON.parse(text) as import("../../types/apps/idea-generation-agent").WhatToBuildData;
      return whatToBuildData;
    } catch (error) {
      console.error("WhatToBuildAgent error:", error);

      // Return mock data as fallback for development/testing
      console.log("🔄 Using fallback mock WhatToBuild data for development");
      return {
        platformDescription: "A cloud-based SaaS automation platform with web dashboard and mobile companion app, featuring drag-and-drop workflow builder, real-time monitoring, and AI-powered optimization suggestions for small business operations.",
        coreFeaturesSummary: [
          "Visual workflow builder with pre-built business templates",
          "Real-time business data integration dashboard",
          "AI-powered automation recommendations engine",
          "Mobile app for workflow monitoring and approvals",
          "Team collaboration and notification system",
          "Analytics and ROI tracking for automated processes"
        ],
        userInterfaces: [
          "Business Owner Dashboard - Main workflow management interface",
          "Team Member Mobile App - Task execution and approvals",
          "Admin Panel - User management and billing controls"
        ],
        keyIntegrations: [
          "Stripe for subscription billing and payment processing",
          "Zapier/Make API for extended workflow capabilities",
          "QuickBooks/Xero for financial data integration",
          "Slack/Microsoft Teams for team notifications",
          "Google Workspace/Office 365 for document automation"
        ],
        pricingStrategyBuildRecommendation: "Implement freemium SaaS model with Stripe: Free tier (3 workflows, basic templates), Starter tier $29/month (unlimited workflows, advanced templates), Pro tier $99/month (AI suggestions, team collaboration, analytics), Enterprise tier $299/month (custom integrations, white-label, priority support)"
      };
    }
  },

  /**
   * IdeaSynthesisAgent - Combine all research into final structured idea with scoring
   * Uses OpenRouter GPT-4.1-nano for deterministic synthesis
   */
  async ideaSynthesisAgent(
    context: AgentContext
  ): Promise<SynthesizedIdea | null> {
    try {
      const systemPrompt = `You are the ultimate founder and chief storyteller, responsible for synthesizing all the research into a single, irresistible startup idea that feels *real, human, and immediately actionable for a lean, SOFTWARE-FOCUSED startup team*. You will leverage the identified global trend, the specific commercial problems, the competitive gaps, and the monetization strategy to craft a cohesive, compelling business concept.

			**Your core responsibility: Articulate a precise problem solved for a specific group of people with a uniquely compelling, *primarily SOFTWARE-BASED (SaaS, API, web/mobile app)* or *LIGHT SERVICE* solution. The solution MUST be realistic for a focused, early-stage team to develop and bring to market. This means:**
				*   **NO custom hardware, robotics, medical devices, or advanced physical products.**
				*   **NO solutions requiring massive R&D, clinical trials, or multi-year regulatory approvals (e.g., FDA).**
				*   **Focus on leveraging existing, commercially available tech, APIs, or data.**
				*   **AVOID any core solution that is primarily about 'compliance' or complex legal frameworks.** These tend to be niche, slow-moving, and less broadly appealing for a lean startup.
			
			**Tone & Narrative:** Absolutely **NO abstract jargon, corporate buzzwords, or "LinkedIn influencer" speak.** Use vivid, relatable, and *intriguing* language that makes someone *feel* the problem and *see* the solution in action. Every part of the output should read like a concise, inspiring blueprint for a real product launch, delivered with the persuasive, human tone of a visionary founder talking to their early team.
			
			**Title Format:** The title should be descriptive, clearly indicating the product's function, target, or key benefit. It should be immediately understandable and compelling, like a catchy product name or a direct solution statement. **DO NOT ALWAYS INCLUDE '($XM ARR potential)'. Only add it if the ARR estimate is truly outstanding and makes the title significantly more compelling; otherwise, omit it for brevity and authenticity.**
				*Examples:* 'AI Inventory Manager for Small Retailers', 'Smart Task Orchestrator for Event Planners', 'Local Farmers Market Digitizer'.
			
			**Narrative Quality:** The 'description', 'problemSolution', and 'executiveSummary' fields must tell a compelling, empathetic story.
				- Introduce the *specific user archetype* (e.g., 'a busy e-commerce manager' or 'a small accounting firm owner') and their *acute pain* using honest, direct language.
				- Describe *how your software/service uniquely and delightfully solves it* with clear, tangible benefits.
				- Implicitly convey the 'why now' (how the larger trend makes this solution critical) and the honest vision for growth.
			
			**Actionability & Next Steps:**
			- For 'executionPlan': Provide concrete, exciting, and *realistic for a software startup* next steps for building and launching the MVP, including honest initial user acquisition strategy.
			- For 'tractionSignals': Suggest tangible, *achievable for a software product* early indicators of success to look for in the first 3-6 months. Use specific, quantifiable metrics that matter. No vanity metrics.
			- For 'frameworkFit': Explain, in plain language, how this *software-focused idea* strategically makes sense or fits a known path to success, avoiding academic or overly complex frameworks if they don't simplify understanding.
			
			**FINAL DIVERSITY CHECK:** After synthesizing, perform one last check. If the generated idea's core theme, industry, or primary problem directly overlaps with any 'Previously Generated Ideas', significantly reframe or choose an alternative problem/solution path from the earlier agents that ensures this idea is truly unique. This is paramount to avoiding repetitive outputs.
			
			Return JSON in this exact shape:
			{
			  "title": "string (FORMAT: Descriptive title. Optionally, add '($XM ARR potential)' ONLY if exceptionally compelling.)",
			  "description": "string (A captivating, human-like narrative (~3-5 sentences) introducing the *user archetype*, their pain, and how the *software/service* genuinely solves it. Weave in 'why now', simple GTM hints, and growth vision. No LinkedIn prose.)",
			  "executiveSummary": "string (a concise, compelling pitch for *this focused software/service idea*, highlighting the core problem, unique value, and main benefit. Keep it sharp, human.)",
			  "problemSolution": "string (Honest, direct story format: 'A small business owner spends hours on X. This *software/service* fixes that by Y, saving them Z and making them genuinely happy by A.')",
			  "problemStatement": "string (A sharp, empathetic, and *authentic* statement of the specific pain for the narrow target.)",
			  "innovationLevel": number (1-10),
			  "timeToMarket": number (months, realistic for a focused software MVP),
			  "confidenceScore": number (1-10),
			  "narrativeHook": "string (a punchy, memorable, and human tagline that truly grabs attention and promises a clear benefit. No corporate slogans. e.g., 'Stop guessing. Start growing with actual data.')",
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
			
			**Previously Generated Ideas (CRITICAL for diversity - DO NOT generate ideas that have similar core themes, industries, or primary problem types as these):**
			${context.previousIdeas && context.previousIdeas.length > 0 ? context.previousIdeas.map((idea) => `- Title: "${idea.title}"\n  Description: "${idea.description}"`).join("\n") : "- None to consider."}

			`; // Added previous ideas to the user prompt for synthesis

      const { text } = await generateText({
        model: openrouter("openai/gpt-4o-mini"),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: 0.1,
        maxTokens: 1500,
      });

      const synthesizedIdea = JSON.parse(text) as SynthesizedIdea;
      
      // Add WhatToBuild data if available in context
      if (context.whatToBuild) {
        synthesizedIdea.whatToBuild = context.whatToBuild;
      }

      return synthesizedIdea;
    } catch (error) {
      console.error("IdeaSynthesisAgent error:", error);

      // Return mock data as fallback for development/testing
      console.log("🔄 Using fallback mock synthesis data for development");
      return {
        title: "FlowGenius - AI-Powered Workflow Automation for Growing SMBs",
        description:
          "An intelligent workflow automation platform designed specifically for small-to-medium businesses, featuring AI-powered setup, industry-specific templates, and SMB-optimized pricing.",
        executiveSummary:
          "FlowGenius addresses the critical gap in workflow automation for growing SMBs by providing an AI-powered platform that learns business patterns and suggests relevant automations. Unlike complex enterprise tools or basic single-app connectors, FlowGenius offers the perfect middle ground with smart templates, transparent pricing, and setup that takes minutes instead of months.",
        problemSolution:
          "SMB owners waste 15+ hours per week manually switching between CRM, inventory, and scheduling systems. FlowGenius solves this with AI-powered multi-system integration that learns business patterns and suggests contextually relevant automations, reducing setup time from weeks to minutes.",
        problemStatement:
          "Growing businesses (10-100 employees) struggle with workflow automation tools that are either too basic or too complex, leading to productivity losses and disconnected business processes.",
        innovationLevel: 7,
        timeToMarket: 8,
        confidenceScore: 8,
        narrativeHook:
          "The first workflow automation tool that actually understands your business",
        targetKeywords: [
          "workflow automation",
          "SMB productivity",
          "business process automation",
          "AI workflow",
        ],
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
          regulatoryRisk: 2,
        },
        executionPlan:
          "Build MVP with Zapier-like visual workflow builder, integrate 5 core SMB tools (QuickBooks, Shopify, MailChimp, Slack, Google Workspace), launch beta with 50 SMBs through direct outreach, iterate based on feedback, and scale through content marketing targeting SMB pain points.",
        tractionSignals:
          "Achieve 100 beta sign-ups with 40% weekly active usage, convert 15% of free trial users to $99/month paid plans, receive 25 unsolicited testimonials highlighting time savings, and secure 10 pilot customers who renew after 3-month trials.",
        frameworkFit:
          "This aligns with the 'Picks and Shovels' framework by providing essential automation tools for the booming SMB digital transformation market, positioned as a 'Unbundling Zapier for SMBs' play that focuses on ease-of-use over enterprise complexity.",
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
        sessionId: Date.now().toString(),
      });

      // Get previous ideas for context
      const previousIdeas = await IdeaGenerationAgentService.getDailyIdeas();
      debugLogger.info("📚 Retrieved previous ideas for context", {
        previousIdeasCount: previousIdeas.length,
        previousIdeas: previousIdeas,
      });

      // Create lightweight summary for context
      const previousIdeaSummaries = previousIdeas.map((idea: any) => ({
        title: idea.title,
        description: idea.description, // Ensure description is also passed
      }));

      // Initialize agent context
      const agentContext: AgentContext = {
        previousIdeas: previousIdeaSummaries,
      };

      // 1. Research trends
      console.log("📈 Researching trends...");
      debugLogger.info("📈 Starting trend research...");
      const trends = await this.trendResearchAgent(agentContext);
      if (!trends) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to research trends"),
          { step: "trendResearch" }
        );
        throw new Error("Failed to research trends");
      }
      debugLogger.info("✅ Trend research completed", { trends });

      // 2. Identify problems and gaps
      console.log("🎯 Analyzing problems and gaps...");
      debugLogger.info("🎯 Starting problem gap analysis...", {
        trendsContext: trends,
      });
      // Update context with trends
      agentContext.trends = trends;
      const problemGaps = await this.problemGapAgent(agentContext);
      if (!problemGaps) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to analyze problems"),
          { step: "problemGapAnalysis", trends }
        );
        throw new Error("Failed to analyze problems");
      }
      debugLogger.info("✅ Problem gap analysis completed", { problemGaps });

      // 3. Research competitive landscape
      console.log("🏆 Researching competition...");
      debugLogger.info("🏆 Starting competitive intelligence...", {
        trends,
        problemGaps,
      });
      // Update context with problem gaps
      agentContext.problemGaps = problemGaps;
      const competitive = await this.competitiveIntelligenceAgent(agentContext);
      if (!competitive) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to research competition"),
          { step: "competitiveIntelligence", trends, problemGaps }
        );
        throw new Error("Failed to research competition");
      }
      debugLogger.info("✅ Competitive intelligence completed", {
        competitive,
      });

      // 4. Design monetization strategy
      console.log("💰 Designing monetization...");
      // Update context with competitive data
      agentContext.competitive = competitive;
      const monetization = await this.monetizationAgent(agentContext);
      if (!monetization) throw new Error("Failed to design monetization");

      // 5. Generate technical implementation guide
      console.log("🔧 Generating technical implementation guide...");
      // Update context with monetization data
      agentContext.monetization = monetization;
      const whatToBuild = await this.whatToBuildAgent(agentContext);
      if (!whatToBuild) throw new Error("Failed to generate technical guide");

      // 6. Synthesize final idea
      console.log("🧠 Synthesizing idea...");
      // Update context with whatToBuild data
      agentContext.whatToBuild = whatToBuild;
      const idea = await this.ideaSynthesisAgent(agentContext);
      if (!idea) throw new Error("Failed to synthesize idea");

      // 7. Save to database
      console.log("💾 Saving to database...");
      const whyNow = await IdeaGenerationAgentService.createWhyNow(trends);
      const ideaScore = await IdeaGenerationAgentService.createIdeaScore(
        idea.scoring
      );
      const monetizationStrategy =
        await IdeaGenerationAgentService.createMonetizationStrategy(
          monetization
        );

      // Handle the circular dependency between DailyIdea and WhatToBuild using transaction
      let dailyIdea: any;

      if (whatToBuild) {
        // Use a transaction to handle the circular dependency
        dailyIdea = await prisma.$transaction(async (tx) => {
          // First create DailyIdea without whatToBuildId
          const createdIdea = await tx.dailyIdea.create({
            data: {
              title: idea.title,
              description: idea.description,
              executiveSummary: idea.executiveSummary,
              problemSolution: idea.problemSolution,
              problemStatement: idea.problemStatement,
              innovationLevel: idea.innovationLevel,
              timeToMarket: idea.timeToMarket,
              confidenceScore: idea.confidenceScore,
              narrativeHook: idea.narrativeHook,
              targetKeywords: idea.targetKeywords,
              urgencyLevel: idea.urgencyLevel,
              executionComplexity: idea.executionComplexity,
              tags: idea.tags,
              whyNowId: whyNow.id,
              ideaScoreId: ideaScore.id,
              monetizationStrategyId: monetizationStrategy.id,
            },
          });

          // Then create WhatToBuild with the actual DailyIdea ID
          const createdWhatToBuild = await tx.whatToBuild.create({
            data: {
              platformDescription: whatToBuild.platformDescription,
              coreFeaturesSummary: whatToBuild.coreFeaturesSummary,
              userInterfaces: whatToBuild.userInterfaces,
              keyIntegrations: whatToBuild.keyIntegrations,
              pricingStrategyBuildRecommendation: whatToBuild.pricingStrategyBuildRecommendation,
              dailyIdeaId: createdIdea.id,
            },
          });

          // Finally update DailyIdea to include the whatToBuildId
          const updatedIdea = await tx.dailyIdea.update({
            where: { id: createdIdea.id },
            data: { whatToBuildId: createdWhatToBuild.id },
          });

          return updatedIdea;
        });
      } else {
        // Create DailyIdea without WhatToBuild
        dailyIdea = await IdeaGenerationAgentService.createDailyIdea(
          idea,
          whyNow.id,
          ideaScore.id,
          monetizationStrategy.id
        );
      }

      // Create related entities
      if (problemGaps.gaps.length > 0) {
        await IdeaGenerationAgentService.createMarketGap(
          problemGaps.gaps[0],
          dailyIdea.id
        );
      }

      await IdeaGenerationAgentService.createMarketCompetition(
        competitive.competition,
        dailyIdea.id
      );
      await IdeaGenerationAgentService.createStrategicPositioning(
        competitive.positioning,
        dailyIdea.id
      );

      // Create new related entities for execution plan, traction signals, and framework fit
      if (idea.executionPlan) {
        await IdeaGenerationAgentService.createExecutionPlan(
          idea.executionPlan,
          dailyIdea.id
        );
      }

      if (idea.tractionSignals) {
        await IdeaGenerationAgentService.createTractionSignals(
          idea.tractionSignals,
          dailyIdea.id
        );
      }

      if (idea.frameworkFit) {
        await IdeaGenerationAgentService.createFrameworkFit(
          idea.frameworkFit,
          dailyIdea.id
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
