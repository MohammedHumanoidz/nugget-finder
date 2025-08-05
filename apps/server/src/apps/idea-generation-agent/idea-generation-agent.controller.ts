import { generateText, streamText } from "ai";
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
import { EnhancedJsonParser } from "../../utils/enhanced-json-parser";
import { debugLogger } from "../../utils/logger";
import { prisma } from "../../utils/configs/db.config";

// Add new interface for Master Research Director
interface ResearchDirectorData {
  researchTheme: string;
  geographicFocus: string;
  industryRotation: string;
  diversityMandates: string[];
  researchApproach: string;
}

const IdeaGenerationAgentController = {
  /**
   * Master Research Director - Creates diverse research themes per day
   * Influences trend research with rotating diversity across industry + geography
   */
  async masterResearchDirector(context: AgentContext): Promise<ResearchDirectorData | null> {
    try {
      console.log("🎯 Step 1: Activating Master Research Director");

      const directorPrompt = `You are the Master Research Director for a world-class startup opportunity discovery system. Your role is to establish today's research parameters that will drive the entire pipeline toward discovering genuinely novel, diverse startup opportunities.

**Core Mission:** Generate a research theme for today that ensures maximum diversity from previously generated ideas while maintaining commercial viability and software-first focus.

**CRITICAL DIVERSITY ENFORCEMENT:** Based on the previously generated ideas, you MUST choose a research direction that is fundamentally different in:
- Industry/vertical focus
- Target user demographic  
- Geographic/cultural context
- Business model approach (B2B vs B2C vs Creative/Original)
- Technology stack or approach

**Geographic Rotation Strategy:** Rotate research focus across:
- North America (US/Canada startup ecosystems)
- Europe (Nordic innovation, German engineering, UK fintech)
- Asia-Pacific (Japan efficiency, Singapore trade, Australia resources)
- Emerging Markets (Latin America, Southeast Asia, Africa)
- Global Remote/Digital-First opportunities

**Industry Rotation Mandates:**
- If previous: Enterprise/B2B → Focus on: Consumer/Creator/Local Business
- If previous: Consumer/B2C → Focus on: SMB/Professional Services/Creative Tools
- If previous: AI/Tech → Focus on: Traditional Industries + Digital Transformation
- If previous: Local/Physical → Focus on: Remote/Digital/Global

Return this exact JSON structure:
{
  "researchTheme": "string (Today's focused research direction, e.g., 'Independent Creator Economy Tools in Southeast Asia' or 'Rural SMB Digital Infrastructure in Latin America')",
  "geographicFocus": "string (Specific region/market context that influences user needs and competitive landscape)",
  "industryRotation": "string (The industry vertical to explore today, ensuring diversity from previous)",
  "diversityMandates": ["mandate 1: avoid X from previous ideas", "mandate 2: focus on Y demographic not covered before", "mandate 3: explore Z business model not used recently"],
  "researchApproach": "string (How the trend research should be conducted - what communities, signals, and validation sources to prioritize)"
}

**Previous Research Context (MUST AVOID THESE PATTERNS):**
${context.previousIdeas && context.previousIdeas.length > 0 ? 
  context.previousIdeas.map((idea, idx) => `${idx + 1}. "${idea.title}" - Industry: ${this.extractIndustry(idea.description)}, Target: ${this.extractTarget(idea.description)}`).join('\n') : 
  'No previous ideas - establish initial research direction focusing on underserved global markets'}

Today's research must explore completely new territory. Be specific and actionable.`;

                    const { text } = await generateText({
         model: openrouter("openai/gpt-4.1-mini"),
         prompt: directorPrompt,
         temperature: 0.3,
         maxTokens: 600,
       });

       // Use enhanced JSON parser to handle markdown code blocks and formatting issues
       const parseResult = await EnhancedJsonParser.parseWithFallback<ResearchDirectorData>(
         text,
         ["researchTheme", "geographicFocus", "industryRotation"],
         {
           researchTheme: "Global Remote Work Tools for Emerging Markets",
           geographicFocus: "Southeast Asia and Latin America",
           industryRotation: "SMB Productivity and Operations",
           diversityMandates: [
             "Avoid enterprise/large corporation focus",
             "Target independent professionals and small teams",
             "Explore mobile-first, low-bandwidth solutions"
           ],
           researchApproach: "Focus on remote work communities, startup hubs in emerging markets, and mobile-first productivity discussions"
         }
       );

       if (!parseResult.success) {
         console.error("❌ Master Research Director JSON parsing failed:", parseResult.error);
         console.log("📝 Original response:", parseResult.originalText?.substring(0, 500));
         if (parseResult.cleanedText) {
           console.log("🧹 Cleaned response:", parseResult.cleanedText.substring(0, 500));
         }
       }

       const directorData = parseResult.data as ResearchDirectorData;
      
      console.log("✅ Step 1: Research Director Set Research Parameters:", {
        theme: directorData.researchTheme,
        geography: directorData.geographicFocus,
        industry: directorData.industryRotation
      });

      return directorData;
    } catch (error) {
      console.error("Master Research Director error:", error);
      // Return fallback research direction
      return {
        researchTheme: "Global Remote Work Tools for Emerging Markets",
        geographicFocus: "Southeast Asia and Latin America",
        industryRotation: "SMB Productivity and Operations",
        diversityMandates: [
          "Avoid enterprise/large corporation focus",
          "Target independent professionals and small teams",
          "Explore mobile-first, low-bandwidth solutions"
        ],
        researchApproach: "Focus on remote work communities, startup hubs in emerging markets, and mobile-first productivity discussions"
      };
    }
  },

  // Helper functions for extracting patterns from previous ideas
  extractIndustry(description: string): string {
    const industryKeywords = {
      'enterprise': ['enterprise', 'corporate', 'large business'],
      'smb': ['small business', 'SMB', 'local business'],
      'consumer': ['consumer', 'individual', 'personal'],
      'creator': ['creator', 'artist', 'content'],
      'healthcare': ['health', 'medical', 'wellness'],
      'fintech': ['finance', 'payment', 'banking'],
      'edtech': ['education', 'learning', 'student']
    };
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return industry;
      }
    }
    return 'general';
  },

  extractTarget(description: string): string {
    const targetKeywords = {
      'enterprise': ['enterprise', 'corporation', 'large company'],
      'smb': ['small business', 'SMB', 'local shop'],
      'individual': ['individual', 'personal', 'consumer'],
      'professional': ['professional', 'freelancer', 'consultant'],
      'creator': ['creator', 'artist', 'influencer']
    };
    
    for (const [target, keywords] of Object.entries(targetKeywords)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return target;
      }
    }
    return 'general';
  },

  /**
   * Enhanced TrendResearchAgent - Now guided by Master Research Director
   * Uses Perplexity Deep Research with Director's research theme
   */
  async trendResearchAgent(context: AgentContext, researchDirection?: ResearchDirectorData): Promise<TrendData | null> {
    try {
      console.log("📈 Step 2: Enhanced Trend Research");

      const systemPrompt = `You are an elite trend research specialist with deep expertise in identifying emerging patterns that create immediate software startup opportunities. Your research is guided by today's strategic research direction.

**Research Mission Parameters:**
${researchDirection ? `
- Research Theme: ${researchDirection.researchTheme}
- Geographic Focus: ${researchDirection.geographicFocus}  
- Industry Focus: ${researchDirection.industryRotation}
- Diversity Mandates: ${researchDirection.diversityMandates.join(', ')}
` : 'General global technology and market trend research'}

**Critical Requirements:**
1. **Human-Validated Signals**: The trend MUST be backed by genuine online community engagement (Reddit threads with 500+ comments, viral Twitter discussions, Product Hunt buzz, active forum debates)
2. **Software-Solvable**: Focus on trends creating immediate opportunities for SaaS, APIs, web/mobile apps, or lightweight services
3. **Timing-Sensitive**: Identify trends in the "early adopter" phase - not too early (theoretical) or too late (saturated)
4. **Geographic Relevance**: Consider how the trend manifests differently in the target geographic region
5. **Buildable Solutions**: Ensure the trend opens paths to <$10K MVP, 3-6 month development cycle solutions

**Validation Framework:**
- Social Media Signals: Active discussions in target communities
- Market Movement: New funding rounds, product launches, policy changes
- Behavioral Shifts: Changes in how target users work, shop, communicate
- Technology Enablers: New APIs, platforms, or capabilities becoming accessible

Return structured JSON with enhanced data:
{
  "title": "string (Compelling, specific trend title that captures the essence and geographic/industry context)",
  "description": "string (Rich narrative explaining the trend's emergence, current traction, and implications for the target region/industry. Include specific examples of online community engagement)",
  "trendStrength": number (1-10, weighted for current market momentum),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
  "timingUrgency": number (1-10, how time-sensitive this opportunity window is),
  "supportingData": ["Specific Reddit thread or community discussion", "Key news event or policy change", "Quantitative metrics if available", "Geographic-specific evidence"]
}

Focus on trends that are currently generating genuine excitement and discussion in real communities, not theoretical future possibilities.`;

      const userPrompt = `Conduct deep research to identify one powerful emerging trend that is generating significant buzz in online communities and creating immediate opportunities for software-based solutions.

**Strategic Research Direction:**
${researchDirection ? `
Focus your research on: ${researchDirection.researchTheme}
Geographic context: ${researchDirection.geographicFocus}
Industry vertical: ${researchDirection.industryRotation}

Research approach: ${researchDirection.researchApproach}
` : 'Conduct broad global technology and market trend research'}

**Diversity Requirements - MUST AVOID:**
${context.previousIdeas && context.previousIdeas.length > 0 ? 
  context.previousIdeas.map((idea) => `- Theme: "${idea.title}" - Focus area already covered`).join('\n') : 
  '- No restrictions - establish new research territory'}

Find a trend that is genuinely creating conversation, excitement, and early market movement. Provide evidence of real human engagement and community validation.`;

      // LOG: Enhanced Perplexity API request
      debugLogger.logPerplexityRequest(
        "EnhancedTrendResearchAgent",
        userPrompt,
        systemPrompt,
        {
          reasoning_effort: "high",
          model: "sonar-deep-research",
          researchDirection: researchDirection,
        }
      );

      const response = await perplexity(
        userPrompt,
        systemPrompt,
        "high",
        "sonar-deep-research"
      );

      // LOG: Perplexity API response (FULL)
      debugLogger.logPerplexityResponse("EnhancedTrendResearchAgent", response);

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "EnhancedTrendResearchAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log("🔍 Enhanced Trend raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      // Enhanced LLM structuring with better prompts
      const structureWithLLM = async (content: string): Promise<string> => {
        const structuringPrompt = `You are an expert data analyst specializing in trend research. Convert the following comprehensive trend analysis into the exact JSON structure requested.

REQUIRED JSON STRUCTURE:
{
  "title": "string",
  "description": "string",
  "trendStrength": number (1-10),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
  "timingUrgency": number (1-10),
  "supportingData": ["evidence point 1", "evidence point 2", "evidence point 3"]
}

TREND RESEARCH CONTENT:
${content}

Extract the core trend information and format as valid JSON. Ensure all supporting data includes specific, verifiable sources. Return ONLY the JSON object.`;

        debugLogger.logLLMStructuring(
          "EnhancedTrendResearchAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4.1-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 800,
        });

        debugLogger.logLLMStructuringResponse(
          "EnhancedTrendResearchAgent",
          structuredJson
        );

        // Clean the LLM response before returning
        return EnhancedJsonParser.cleanJsonResponse(structuredJson);
      };

      const parseResult = await parsePerplexityResponse<TrendData>(
        content,
        structureWithLLM,
        ["title", "description"] // Required fields
      );

      debugLogger.logParsingAttempt("EnhancedTrendResearchAgent", content, parseResult);

      if (!parseResult.success) {
        console.error("❌ Failed to parse enhanced trend data:", parseResult.error);
        debugLogger.logError(
          "EnhancedTrendResearchAgent",
          new Error(`Failed to parse Perplexity response: ${parseResult.error}`),
          { parseResult, originalContent: content }
        );
        throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
      }

      const trendData = parseResult.data as TrendData;

      console.log("✅ Step 2: Enhanced Trend Research Completed:", {
        title: trendData.title,
        trendStrength: trendData.trendStrength,
        catalystType: trendData.catalystType,
        timingUrgency: trendData.timingUrgency
      });

      debugLogger.logAgentResult("EnhancedTrendResearchAgent", trendData, true);
      return trendData;

    } catch (error) {
      console.error("EnhancedTrendResearchAgent error:", error);
      debugLogger.logError("EnhancedTrendResearchAgent", error as Error, {
        agent: "EnhancedTrendResearchAgent",
        fallbackUsed: true,
      });

      // Enhanced fallback with research direction context
      console.log("🔄 Using enhanced fallback trend data");
      return {
        title: researchDirection ? 
          `${researchDirection.industryRotation} Innovation in ${researchDirection.geographicFocus}` :
          "AI-Powered Workflow Automation for SMBs",
        description: researchDirection ?
          `Emerging trend in ${researchDirection.geographicFocus} focused on ${researchDirection.industryRotation} digital transformation.` :
          "Small to medium businesses are increasingly adopting AI-powered tools to automate repetitive workflows, driven by labor shortages and cost pressures.",
        trendStrength: 8,
        catalystType: "TECHNOLOGY_BREAKTHROUGH" as const,
        timingUrgency: 7,
        supportingData: [
          "Active discussions in target region startup communities",
          "Growing investment in regional digital infrastructure",
          "Increasing adoption metrics for relevant software categories",
        ],
      };
    }
  },

  /**
   * Enhanced ProblemGapAgent - Uses reasoning-rich prompts from sonar-reasoning model
   * Identifies 2-3 sharply defined, systemic problems for specific personas
   */
  async problemGapAgent(context: AgentContext): Promise<ProblemGapData | null> {
    try {
      console.log("🎯 Step 3: Enhanced Problem Gap Analysis");

      const systemPrompt = `You are an elite business strategist and systemic problem identifier with deep expertise in discovering acute commercial pain points that create immediate software startup opportunities.

**Enhanced Analysis Framework:**

**Problem Identification Criteria:**
1. **Acute & Present**: Problems happening RIGHT NOW, costing real money/time/opportunities daily
2. **Persona-Specific**: Focus on specific archetypes (e.g., "independent podcast creators in Southeast Asia" vs "content creators generally")
3. **Software-Solvable**: Problems that can be addressed with SaaS, APIs, web/mobile apps, or lightweight services within <$10K MVP budget
4. **Trend-Amplified**: Problems that are intensified or newly created by the identified trend
5. **Quantifiable Impact**: Problems with measurable business impact (lost revenue, wasted time, competitive disadvantage)

**Systemic Analysis Requirements:**
- Why do existing solutions fundamentally fail for this specific persona?
- What structural/technological/market barriers prevent current players from solving this?
- How does the trend create new urgency or change the problem dynamics?
- What makes this persona underserved by current market offerings?

**Solution Viability Filter:**
- NO hardware, IoT, medical devices, or physical products
- NO regulatory/compliance-heavy solutions as primary value
- NO deep R&D, AI model training, or multi-year development
- YES to API integration, data processing, workflow automation, communication tools
- YES to mobile-first, web-based, or lightweight service solutions

Return enhanced JSON structure:
{
  "problems": [
    "Specific persona spends X hours/week on manual process Y, losing $Z in revenue/opportunities because existing tools fail to address [specific limitation] in their workflow, particularly acute in [geographic/industry context]",
    "Second persona problem with quantified impact and clear gap in current solutions",
    "Third persona problem if applicable, same specificity and business impact focus"
  ],
  "gaps": [
    {
      "title": "string (Precise gap title that hints at the missing software capability)",
      "description": "string (Detailed explanation of WHY existing software/methods fail for this specific persona in this trend context, including the mechanism of failure)",
      "impact": "string (Quantified business impact with specific metrics where possible)",
      "target": "string (Extremely narrow persona definition with geographic/industry context)",
      "opportunity": "string (Specific software solution that leverages the trend to solve this gap uniquely)"
    }
  ]
}

Focus on problems so painful and immediate that the target persona would pay for a solution within their first trial week.`;

      const userPrompt = `Based on this validated trend: "${context.trends?.title} - ${context.trends?.description}"

Conduct deep systemic analysis to identify 2-3 excruciatingly specific commercial problems that are:
1. Currently happening (not future theoretical problems)
2. Costing specific business archetypes real money/time/opportunities TODAY
3. Intensified or newly created by this trend
4. Solvable with focused software solutions (SaaS/API/web app)
5. Underserved by existing market solutions

**Problem Discovery Focus:**
- Target specific personas within the trend's impact zone
- Quantify the pain (hours wasted, revenue lost, opportunities missed)
- Explain why current tools/methods fail for this specific use case
- Ensure problems lead to <$10K MVP, 3-6 month development solutions

**Diversity Requirements (avoid these problem spaces):**
${context.previousIdeas && context.previousIdeas.length > 0 ? 
  context.previousIdeas.map((idea) => `- Avoid: Problems similar to "${idea.title}" - ${idea.description?.substring(0, 100)}...`).join('\n') : 
  '- No restrictions - explore new problem territory'}

Focus on immediate, specific, financially painful problems that create urgent demand for software solutions.`;

             // Use sonar-pro for enhanced analysis
       debugLogger.logPerplexityRequest(
         "EnhancedProblemGapAgent",
         userPrompt,
         systemPrompt,
         {
           reasoning_effort: "high",  // Enhanced reasoning
           model: "sonar-pro",   // Better model for analysis
           context: context.trends,
         }
       );

       const response = await perplexity(
         userPrompt,
         systemPrompt,
         "high",  // High reasoning effort
         "sonar-pro"  // Use pro model
       );

      debugLogger.logPerplexityResponse("EnhancedProblemGapAgent", response);

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "EnhancedProblemGapAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log("🔍 Enhanced ProblemGap raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      const isAlreadyJson = content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis("EnhancedProblemGapAgent", content, isAlreadyJson);

      const structureWithLLM = async (content: string): Promise<string> => {
        const structuringPrompt = `You are an expert business analyst. Convert the following problem and gap analysis into the exact JSON structure.

REQUIRED JSON STRUCTURE:
{
  "problems": ["specific problem 1 with quantified impact", "specific problem 2", "specific problem 3"],
  "gaps": [
    {
      "title": "string",
      "description": "string (why existing solutions fail)",
      "impact": "string (quantified business impact)",
      "target": "string (specific persona/market)",
      "opportunity": "string (specific software solution)"
    }
  ]
}

ANALYSIS CONTENT:
${content}

Extract problems and gaps with maximum specificity and business impact quantification. Return ONLY the JSON object.`;

        debugLogger.logLLMStructuring("EnhancedProblemGapAgent", structuringPrompt, content);

                 const { text: structuredJson } = await generateText({
           model: openrouter("openai/gpt-4.1-mini"),
           prompt: structuringPrompt,
           temperature: 0.1,
           maxTokens: 1000,
         });

        debugLogger.logLLMStructuringResponse("EnhancedProblemGapAgent", structuredJson);
        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<ProblemGapData>(
        content,
        structureWithLLM,
        ["problems", "gaps"]
      );

      debugLogger.logParsingAttempt("EnhancedProblemGapAgent", content, parseResult);

      if (!parseResult.success) {
        console.error("❌ Failed to parse enhanced problem gap data:", parseResult.error);
        debugLogger.logError(
          "EnhancedProblemGapAgent",
          new Error(`Failed to parse Perplexity response: ${parseResult.error}`),
          { parseResult, originalContent: content }
        );
        throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
      }

      const problemGapData = parseResult.data as ProblemGapData;

      console.log("✅ Step 3: Enhanced Problem Gap Analysis Completed:", {
        problemCount: problemGapData.problems?.length || 0,
        gapCount: problemGapData.gaps?.length || 0,
      });

      debugLogger.logAgentResult("EnhancedProblemGapAgent", problemGapData, true);
      return problemGapData;

    } catch (error) {
      console.error("EnhancedProblemGapAgent error:", error);
      debugLogger.logError("EnhancedProblemGapAgent", error as Error, {
        agent: "EnhancedProblemGapAgent",
        fallbackUsed: true,
      });

      console.log("🔄 Using enhanced fallback problem gap data");
      return {
        problems: [
          "Independent content creators in emerging markets waste 12+ hours/week manually distributing content across platforms, losing $800+ monthly in potential sponsorship revenue because existing tools don't support local payment methods or regional platform integrations",
          "Small e-commerce businesses in tier-2 cities spend 8 hours/week on inventory tracking across online and offline channels, missing 15% of sales opportunities due to stock-outs because current tools are built for single-channel operations",
          "Remote consultants and freelancers lose 6 hours/week on client communication and project management, reducing hourly rate efficiency by 25% because existing tools lack smart scheduling and communication synthesis for global timezone coordination",
        ],
        gaps: [
          {
            title: "Multi-Platform Content Distribution for Emerging Markets",
            description: "Current content management tools are built for Western platforms and payment systems, failing to integrate with regional social platforms, local payment gateways, and mobile-first workflows prevalent in emerging markets",
            impact: "Content creators lose 40-60% of potential revenue from regional sponsorships and audience monetization",
            target: "Independent content creators and influencers in Southeast Asia, Latin America, and Africa",
            opportunity: "Regional-first content management platform with native integrations for local platforms, mobile-optimized workflows, and emerging market payment systems",
          },
          {
            title: "Hybrid Commerce Inventory Intelligence",
            description: "Existing inventory tools assume pure online or pure offline operations, creating blind spots for businesses operating across channels, particularly in markets where offline-to-online transition is rapid",
            impact: "15-25% revenue loss from stock-outs and overstocking, plus 8+ hours weekly manual reconciliation",
            target: "Small to medium e-commerce businesses in tier-2 cities with hybrid online/offline operations",
            opportunity: "AI-powered inventory assistant that learns from both online analytics and offline sales patterns to predict demand across channels",
          },
        ],
      };
    }
  },

  /**
   * Enhanced CompetitiveIntelligenceAgent - Better competitive analysis with strategic positioning
   * Uses structured prompts for deeper market understanding
   */
  async competitiveIntelligenceAgent(
    context: AgentContext
  ): Promise<CompetitiveData | null> {
    try {
      console.log("🏆 Step 4: Enhanced Competitive Intelligence");

      const systemPrompt = `You are an elite competitive intelligence analyst and strategic positioning expert. Your mission is to conduct deep competitive analysis within a specific niche and define a sharp differentiation strategy for a software startup.

**Enhanced Analysis Framework:**

**Competitive Landscape Mapping:**
1. **Niche-Specific Focus**: Analyze competitors only within the precise problem space, not the broader market
2. **Failure Point Analysis**: Identify specific ways current solutions fail the target persona
3. **Structural Limitations**: Understand why existing players can't easily fix these failures
4. **Market Concentration Assessment**: Evaluate competitive density specifically for this narrow use case

**Strategic Positioning Requirements:**
- Define a clear "wedge" strategy that makes competitors irrelevant for the target persona
- Identify unfair advantages that can be built with a lean software approach
- Establish defensible moats that scale with user adoption
- Create positioning that turns limitations into strengths

**Solution Viability Constraints:**
- Focus on positioning around software capabilities (APIs, data processing, workflow automation)
- Avoid hardware-dependent or deep R&D advantages
- Emphasize network effects, data advantages, or unique integrations possible for startups
- Consider geographic/demographic advantages in emerging markets

Return enhanced competitive analysis:
{
  "competition": {
    "marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
    "marketConcentrationJustification": "string (Detailed explanation of competitive density specifically for this narrow niche, highlighting opportunities for software-first entrants)",
    "directCompetitors": [
      {
        "name": "string",
        "justification": "string (Why they compete in this space but fail the target persona)",
        "strengths": ["genuine competitive advantages", "market position"],
        "weaknesses": ["specific failures for target persona", "structural limitations for niche"]
      }
    ],
    "indirectCompetitors": [
      {
        "name": "string", 
        "justification": "string (How they indirectly address the problem but miss the mark)",
        "strengths": ["general market strengths"],
        "weaknesses": ["why they can't serve this specific niche effectively"]
      }
    ],
    "competitorFailurePoints": ["critical pain points left unaddressed", "systematic gaps in current market"],
    "unfairAdvantage": ["specific advantages achievable with lean software approach", "data/network effects unique to this niche"],
    "moat": ["defensible barriers that strengthen with adoption", "competitive advantages difficult for incumbents to replicate"],
    "competitivePositioningScore": number (1-10)
  },
  "positioning": {
    "name": "string (Memorable positioning statement that captures the unique value for target persona - PROBLEM + SOLUTION in ≤8 words)",
    "targetSegment": "string (Extremely specific target persona with geographic/industry context)",
    "valueProposition": "string (Sharp pitch emphasizing unique insight and direct problem resolution with software solution)",
    "keyDifferentiators": ["unique capability tied to unfair advantage", "niche-specific feature competitors can't replicate", "software advantage that scales"]
  }
}

Focus on competitive intelligence that reveals clear paths to startup success through strategic differentiation.`;

      const problemContext = context.problemGaps?.problems.join(", ") || "";
      const userPrompt = `Analyze the competitive landscape within the specific niche defined by these problems: ${problemContext}

Conduct deep competitive analysis to:
1. Map all direct and indirect competitors within this precise problem space
2. Identify their specific failure points for the target personas
3. Understand why existing solutions structurally can't address these gaps
4. Define a sharp differentiation strategy that makes competitors irrelevant for this niche

**Focus Areas:**
- Why do current solutions fail the specific personas identified?
- What structural/technological barriers prevent incumbents from solving this?
- How can a software-first startup create an unfair advantage?
- What positioning makes the startup the obvious choice for the target persona?

Provide actionable competitive intelligence that guides strategic positioning and product development decisions.`;

      debugLogger.logPerplexityRequest(
        "EnhancedCompetitiveIntelligenceAgent",
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

      debugLogger.logPerplexityResponse("EnhancedCompetitiveIntelligenceAgent", response);

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "EnhancedCompetitiveIntelligenceAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log("🔍 Enhanced Competitive Intelligence raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      const isAlreadyJson = content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis("EnhancedCompetitiveIntelligenceAgent", content, isAlreadyJson);

      const structureWithLLM = async (content: string): Promise<string> => {
        const structuringPrompt = `You are an expert competitive analyst. Convert the following competitive intelligence research into the exact JSON structure requested.

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
    "competitivePositioningScore": number
  },
  "positioning": {
    "name": "string",
    "targetSegment": "string",
    "valueProposition": "string",
    "keyDifferentiators": ["diff1", "diff2"]
  }
}

COMPETITIVE ANALYSIS CONTENT:
${content}

Extract competitive data and positioning strategy. Ensure all competitive advantages are realistic for software startups. Return ONLY the JSON object.`;

        debugLogger.logLLMStructuring("EnhancedCompetitiveIntelligenceAgent", structuringPrompt, content);

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4.1-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 1200,
        });

        debugLogger.logLLMStructuringResponse("EnhancedCompetitiveIntelligenceAgent", structuredJson);
        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<CompetitiveData>(
        content,
        structureWithLLM,
        ["competition", "positioning"]
      );

      debugLogger.logParsingAttempt("EnhancedCompetitiveIntelligenceAgent", content, parseResult);

      if (!parseResult.success) {
        console.error("❌ Failed to parse enhanced competitive data:", parseResult.error);
        debugLogger.logError(
          "EnhancedCompetitiveIntelligenceAgent",
          new Error(`Failed to parse Perplexity response: ${parseResult.error}`),
          { parseResult, originalContent: content }
        );
        throw new Error(`Failed to parse Perplexity response: ${parseResult.error}`);
      }

      const competitiveData = parseResult.data as CompetitiveData;

      console.log("✅ Step 4: Enhanced Competitive Intelligence Completed:", {
        marketConcentration: competitiveData.competition?.marketConcentrationLevel,
        directCompetitorCount: competitiveData.competition?.directCompetitors?.length || 0,
        positioningName: competitiveData.positioning?.name,
        competitiveScore: competitiveData.competition?.competitivePositioningScore
      });

      debugLogger.logAgentResult("EnhancedCompetitiveIntelligenceAgent", competitiveData, true);
      return competitiveData;

    } catch (error) {
      console.error("EnhancedCompetitiveIntelligenceAgent error:", error);
      debugLogger.logError("EnhancedCompetitiveIntelligenceAgent", error as Error, {
        agent: "EnhancedCompetitiveIntelligenceAgent",
        fallbackUsed: true,
      });

      console.log("🔄 Using enhanced fallback competitive intelligence data");
      return {
        competition: {
          marketConcentrationLevel: "LOW" as const,
          marketConcentrationJustification: "Emerging market focus creates opportunities for specialized solutions targeting underserved segments with mobile-first, locally-adapted approaches",
          directCompetitors: [
            {
              name: "Generic Global Platforms",
              justification: "Large platforms that attempt to serve the target market but lack regional customization",
              strengths: ["Brand recognition", "Extensive features", "Large user base"],
              weaknesses: ["No local platform integrations", "Western-centric design", "Complex pricing for emerging markets", "Poor mobile optimization"]
            }
          ],
          indirectCompetitors: [
            {
              name: "Manual/Traditional Methods",
              justification: "Current manual processes and traditional tools used by target personas",
              strengths: ["Familiar workflows", "No technology barriers", "Full control"],
              weaknesses: ["Time-intensive", "Error-prone", "No scalability", "Missing automation opportunities"]
            }
          ],
          competitorFailurePoints: [
            "Lack of regional platform integrations and local payment support",
            "Complex interfaces designed for desktop users, not mobile-first workflows",
            "Pricing models that don't scale with emerging market budgets"
          ],
          unfairAdvantage: [
            "Native integrations with regional platforms and payment systems",
            "Mobile-first design optimized for emerging market usage patterns",
            "Local market expertise and community-driven feature development"
          ],
          moat: [
            "Exclusive partnerships with regional platforms and local service providers",
            "Network effects within specific geographic communities",
            "Data advantages from understanding regional user behavior patterns"
          ],
          competitivePositioningScore: 8
        },
        positioning: {
          name: "Regional Creator Tools for Mobile Markets",
          targetSegment: "Independent content creators and small business owners in Southeast Asia, Latin America, and Africa",
          valueProposition: "The only platform designed specifically for emerging market creators, with native regional integrations, mobile-first workflows, and local payment support that global platforms ignore",
          keyDifferentiators: [
            "Native integration with regional social platforms and payment gateways",
            "Mobile-optimized interface designed for smartphone-primary users",
            "Community-driven feature development with regional market expertise"
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
        model: openrouter("openai/gpt-4.1-mini"),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: 0.1,
        maxTokens: 1000,
      });

      // Use enhanced JSON parser to handle markdown code blocks and formatting issues
      const parseResult = await EnhancedJsonParser.parseWithFallback<MonetizationData>(
        text,
        ["primaryModel", "pricingStrategy", "revenueStreams", "keyMetrics"],
        {
          primaryModel: "SaaS Subscription",
          pricingStrategy: "Tiered SaaS pricing based on number of integrations and automations",
          businessScore: 8,
          confidence: 7,
          revenueModelValidation: "Validated by similar tools in market with proven demand",
          pricingSensitivity: "Target market is price-sensitive but will pay for proven ROI",
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
        }
      );

      if (!parseResult.success) {
        console.error("❌ Monetization Agent JSON parsing failed:", parseResult.error);
        console.log("📝 Original response:", parseResult.originalText?.substring(0, 500));
      }

      const monetizationData = parseResult.data as MonetizationData;
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
        model: openrouter("openai/gpt-4.1-mini"),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: 0.1,
        maxTokens: 1200,
      });

      // Use enhanced JSON parser to handle markdown code blocks and formatting issues
      const parseResult = await EnhancedJsonParser.parseWithFallback<import("../../types/apps/idea-generation-agent").WhatToBuildData>(
        text,
        ["platformDescription", "coreFeaturesSummary", "userInterfaces", "keyIntegrations"],
        {
          platformDescription: "A cloud-based SaaS platform with web dashboard and mobile companion app, featuring workflow builder and real-time monitoring for small business operations.",
          coreFeaturesSummary: [
            "Visual workflow builder with pre-built business templates",
            "Real-time business data integration dashboard", 
            "AI-powered automation recommendations engine"
          ],
          userInterfaces: [
            "Business Owner Dashboard - Main workflow management interface",
            "Team Member Mobile App - Task execution and approvals",
            "Admin Panel - User management and billing controls"
          ],
          keyIntegrations: [
            "Stripe for subscription billing and payment processing",
            "QuickBooks/Xero for financial data integration",
            "Slack/Microsoft Teams for team notifications"
          ],
          pricingStrategyBuildRecommendation: "Implement freemium SaaS model with Stripe: Free tier (basic features), Pro tier $99/month (advanced features), Enterprise tier $299/month (custom integrations)"
        }
      );

      if (!parseResult.success) {
        console.error("❌ WhatToBuild Agent JSON parsing failed:", parseResult.error);
        console.log("📝 Original response:", parseResult.originalText?.substring(0, 500));
      }

      const whatToBuildData = parseResult.data as import("../../types/apps/idea-generation-agent").WhatToBuildData;
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
   * Critic Agent - Silent critic that analyzes generated ideas and creates refinement prompts
   * Uses advanced reasoning to critique and improve idea quality
   */
  async criticAgent(ideas: SynthesizedIdea[], context: AgentContext): Promise<string | null> {
    try {
      console.log("🔍 Step 6: Activating Critic Agent");

      const criticPrompt = `You are a world-class startup critic and strategic advisor with deep expertise in evaluating early-stage business opportunities. Your role is to conduct a silent, comprehensive critique of generated startup ideas and create targeted refinement recommendations.

**Critique Framework:**

**Idea Quality Assessment:**
1. **Market Opportunity**: Is the market real, urgent, and sizeable enough for venture success?
2. **Problem-Solution Fit**: Does the solution genuinely address the identified problem for the specific persona?
3. **Execution Feasibility**: Can this realistically be built and launched by a small team within 6 months?
4. **Competitive Advantage**: Are the differentiators strong enough to create lasting value?
5. **Business Model Viability**: Will the target persona actually pay for this solution?

**Strategic Weaknesses to Identify:**
- Overly broad or vague targeting that reduces focus
- Solutions that are "nice to have" rather than "must have"
- Competitive advantages that can be easily replicated
- Business models that don't align with target persona behavior
- Technical complexity that exceeds startup execution capacity

**Refinement Areas:**
- Persona specificity and pain point clarity
- Solution uniqueness and defensibility
- Go-to-market strategy optimization
- Revenue model alignment with user value
- Execution roadmap realism

**Input Ideas for Critique:**
${ideas.map((idea, idx) => `
Idea ${idx + 1}: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problemStatement}
Target Keywords: ${idea.targetKeywords.join(', ')}
Execution Complexity: ${idea.executionComplexity}/10
Confidence Score: ${idea.confidenceScore}/10
Narrative Hook: ${idea.narrativeHook}
`).join('\n')}

**Context Information:**
- Research Theme: ${context.trends?.title}
- Geographic Focus: Research targeted specific regions/markets
- Competitive Landscape: ${context.competitive?.competition.marketConcentrationLevel} concentration

Conduct a thorough critique focusing on the most critical weaknesses that could prevent startup success. Generate specific, actionable refinement recommendations that will strengthen the ideas while maintaining their core viability.

Return a focused refinement prompt that addresses the most important improvements needed:`;

      const { text: refinementPrompt } = await generateText({
        model: openrouter("openai/gpt-4.1-mini"),
        prompt: criticPrompt,
        temperature: 0.2,
        maxTokens: 800,
      });

      console.log("✅ Step 6: Critic Agent Generated Refinement Recommendations");
      console.log("🔍 Refinement focus areas identified:", refinementPrompt.substring(0, 200) + "...");

      return refinementPrompt;

    } catch (error) {
      console.error("Critic Agent error:", error);
      return null;
    }
  },

  /**
   * Enhanced IdeaSynthesisAgent - Uses Trend Architect logic with critic feedback
   * Implements markdown-style output format and strategic refinement
   */
  async ideaSynthesisAgent(
    context: AgentContext,
    refinementPrompt?: string
  ): Promise<SynthesizedIdea | null> {
    try {
      console.log("🧠 Step 7: Enhanced Idea Synthesis with Trend Architect Logic");

      const trendArchitectPrompt = `You are the Trend Architect - a world-class startup idea synthesizer who transforms market research into compelling, immediately actionable business opportunities. Your expertise lies in combining trend analysis, problem identification, and competitive intelligence into cohesive startup concepts that feel inevitable and urgent.

**Enhanced Synthesis Mission:**

**Core Responsibilities:**
1. **Trend-Problem Synthesis**: Connect the identified trend directly to specific persona pain points
2. **Solution Architecture**: Design software-first solutions that leverage the trend's momentum
3. **Strategic Positioning**: Position the solution to make competitors irrelevant for the target niche
4. **Execution Clarity**: Provide clear, actionable next steps for immediate implementation

**Enhanced Description Format:**
Create a flowing narrative that naturally integrates all elements without explicit section headers:

The description should weave together the trend context, specific problem, target users, signal evidence, solution overview, timing rationale, and urgency in a cohesive narrative that reads naturally. Avoid using "Trend:", "Problem:", "Solution:", or other explicit section markers within the description text.

Structure as a compelling story that:
- Opens with the market context and why it's emerging now
- Identifies the specific user pain points with quantified impact  
- Describes the target user archetype clearly
- Provides evidence of market signals and validation
- Explains the solution approach and unique value
- Concludes with why timing is critical for success

The result should be a smooth, engaging narrative that covers all strategic elements without formatted sections.

**Enhanced Quality Criteria:**
- Software-first solution buildable within 3-6 months
- Target persona would pay within first trial week  
- Trend amplifies problem urgency significantly
- Solution creates network effects or data advantages
- Clear path to $1M+ ARR within 18 months

${refinementPrompt ? `
**CRITICAL REFINEMENT REQUIREMENTS:**
${refinementPrompt}

Apply these refinement recommendations to strengthen the final synthesis.
` : ''}

**Research Inputs to Synthesize:**
TREND: ${context.trends?.title} - ${context.trends?.description}
PROBLEMS: ${context.problemGaps?.problems.join(", ")}
COMPETITIVE POSITIONING: ${context.competitive?.positioning.valueProposition}
MONETIZATION MODEL: ${context.monetization?.primaryModel}

**Diversity Requirements (ensure novelty):**
${context.previousIdeas && context.previousIdeas.length > 0 ? 
  context.previousIdeas.map((idea) => `- Avoid themes similar to: "${idea.title}"`).join('\n') : 
  '- No restrictions - create breakthrough opportunity'}

**Output Requirements:**
Generate a single, irresistible startup idea using the enhanced narrative format above, then structure it into the required JSON format. The idea should feel so compelling and obvious that someone would start building it immediately.

**CRITICAL TITLE REQUIREMENTS:**
- NO startup names, company names, or product names (avoid names like "ChatOrderSync", "FlowGenius", "Nordic Platform", etc.)
- Focus on the SOLUTION CATEGORY and TARGET MARKET (e.g., "Multi-Channel Inventory Management for Nordic Artisans" instead of "Nordic Ceramicists Platform")
- Describe WHAT the solution does and WHO it serves, not what it's called
- Keep titles descriptive and professional, focusing on the business value

**CRITICAL DESCRIPTION REQUIREMENTS:**
- NO section headers like "Trend:", "Problem:", "Solution:", "Why Novel Now:", "Time-Sensitive:"
- Write as a flowing, cohesive narrative that naturally covers all elements
- Integrate trend context, problem description, user details, evidence, solution, and timing into smooth prose
- Make it read like a compelling business case, not a structured template

Return JSON structure:
{
  "title": "string (Descriptive solution category + target market, NO product/company names)",
  "description": "string (Compelling narrative without section headers, flowing story format)",
  "executiveSummary": "string (Sharp pitch highlighting core problem, unique value, and main benefit)",
  "problemSolution": "string (Direct story: 'Target persona spends X on Y. This solution fixes it by Z, saving them W and enabling V.')",
  "problemStatement": "string (Authentic statement of specific pain for narrow target)",
  "innovationLevel": number (1-10),
  "timeToMarket": number (months for focused software MVP),
  "confidenceScore": number (1-10),
  "narrativeHook": "string (Memorable tagline promising clear benefit)",
  "targetKeywords": ["software keyword 1", "niche keyword 2", "industry keyword 3"],
  "urgencyLevel": number (1-10),
  "executionComplexity": number (1-10 for focused software MVP),
  "tags": ["SaaS", "specific-industry", "geographic-region", "trend-category"],
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
  "executionPlan": "string (Concrete next steps for building and launching MVP with user acquisition strategy)",
  "tractionSignals": "string (Specific, achievable metrics for 3-6 month validation)",
  "frameworkFit": "string (Strategic framework explaining why this approach leads to success)"
}

Create an idea so compelling that it becomes impossible to ignore - the kind of opportunity that makes everything else feel like a distraction.`;

      const { text } = await generateText({
        model: openrouter("openai/gpt-4.1-mini"),
        prompt: trendArchitectPrompt,
        temperature: 0.1,
        maxTokens: 2000,
      });

      // Use enhanced JSON parser to handle markdown code blocks and complex responses
      const parseResult = await EnhancedJsonParser.parseWithFallback<SynthesizedIdea>(
        text,
        ["title", "description", "problemStatement", "scoring"],
        {
          title: "Multi-Platform Content Management for Emerging Market Creators",
          description: "Mobile-first content creation in emerging markets is experiencing explosive growth, driven by increased smartphone penetration and local social platform adoption. Independent creators in Southeast Asia and Latin America face a critical challenge: managing content across fragmented regional platforms while dealing with limited local monetization options. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing global tools lack regional integrations and local payment support. Active discussions in regional creator communities highlight frustration with platform fragmentation, while market data shows 300% growth in regional social platform usage. Current solutions either ignore local markets entirely or fail to provide the mobile-first, locally-adapted workflows these creators need. A specialized platform that unifies regional platform management, automates cross-posting, and enables local payment integration would capture this underserved market during a critical growth phase, before global platforms adapt their offerings.",
          executiveSummary: "A mobile-first creator management platform designed specifically for emerging market creators, solving platform fragmentation and local monetization challenges.",
          problemSolution: "Emerging market creators spend 15+ hours weekly manually managing content across regional platforms. This platform automates cross-platform posting and enables local payment integration, saving 12 hours weekly.",
          problemStatement: "Independent content creators in emerging markets face platform fragmentation and lack local monetization tools.",
          innovationLevel: 8,
          timeToMarket: 5,
          confidenceScore: 9,
          narrativeHook: "Turn regional platform chaos into creator success",
          targetKeywords: ["creator tools", "emerging markets", "mobile-first platform"],
          urgencyLevel: 9,
          executionComplexity: 6,
          tags: ["SaaS", "Creator-Economy", "Emerging-Markets"],
          scoring: {
            totalScore: 85,
            problemSeverity: 9,
            founderMarketFit: 8,
            technicalFeasibility: 8,
            monetizationPotential: 9,
            urgencyScore: 9,
            marketTimingScore: 9,
            executionDifficulty: 6,
            moatStrength: 8,
            regulatoryRisk: 3,
          },
          executionPlan: "Build MVP with regional platform integrations, launch beta with 50 creators in target markets.",
          tractionSignals: "Achieve 200 creator sign-ups with 60% monthly active usage within 3 months.",
          frameworkFit: "Geographic Arbitrage framework solving global problems with regional solutions.",
        }
      );

      if (!parseResult.success) {
        console.error("❌ Enhanced Idea Synthesis JSON parsing failed:", parseResult.error);
        console.log("📝 Original response:", parseResult.originalText?.substring(0, 500));
        if (parseResult.cleanedText) {
          console.log("🧹 Cleaned response:", parseResult.cleanedText.substring(0, 500));
        }
      }

      const synthesizedIdea = parseResult.data as SynthesizedIdea;

      // Add WhatToBuild data if available in context
      if (context.whatToBuild) {
        synthesizedIdea.whatToBuild = context.whatToBuild;
      }

      console.log("✅ Step 7: Enhanced Idea Synthesis Completed:", {
        title: synthesizedIdea.title,
        confidenceScore: synthesizedIdea.confidenceScore,
        urgencyLevel: synthesizedIdea.urgencyLevel,
        totalScore: synthesizedIdea.scoring.totalScore
      });

      return synthesizedIdea;

    } catch (error) {
      console.error("Enhanced IdeaSynthesisAgent error:", error);

      console.log("🔄 Using enhanced fallback synthesis data");
      return {
        title: "Multi-Platform Content Management for Emerging Market Creators",
        description:
          "Mobile-first content creation in emerging markets is experiencing explosive growth, driven by increased smartphone penetration and local social platform adoption. Independent creators in Southeast Asia and Latin America face a critical challenge: managing content across fragmented regional platforms while dealing with limited local monetization options. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing global tools lack regional integrations and local payment support. Active discussions in regional creator communities highlight this frustration, while market data shows 300% growth in regional social platform usage. Current solutions either ignore local markets entirely or fail to provide the mobile-first, locally-adapted workflows these creators need. A specialized platform that unifies regional platform management, automates cross-posting, and enables local payment integration would capture this underserved market during a critical growth phase, before global platforms adapt their offerings.",
        executiveSummary:
          "A mobile-first creator management platform designed specifically for emerging market creators, solving platform fragmentation and local monetization challenges that global tools ignore, enabling 3x faster content distribution and 2x revenue growth.",
        problemSolution:
          "Emerging market creators spend 15+ hours weekly manually managing content across regional platforms and lose $600+ monthly from poor monetization tools. This platform automates cross-platform posting, enables local payment integration, and provides regional analytics, saving 12 hours weekly and increasing revenue by 50-100%.",
        problemStatement:
          "Independent content creators in emerging markets face platform fragmentation and lack local monetization tools, limiting their growth and revenue potential.",
        innovationLevel: 8,
        timeToMarket: 5,
        confidenceScore: 9,
        narrativeHook:
          "Turn regional platform chaos into creator success",
        targetKeywords: [
          "creator tools",
          "emerging markets",
          "mobile-first platform",
          "regional social media"
        ],
        urgencyLevel: 9,
        executionComplexity: 6,
        tags: ["SaaS", "Creator-Economy", "Emerging-Markets", "Mobile-First"],
        scoring: {
          totalScore: 85,
          problemSeverity: 9,
          founderMarketFit: 8,
          technicalFeasibility: 8,
          monetizationPotential: 9,
          urgencyScore: 9,
          marketTimingScore: 9,
          executionDifficulty: 6,
          moatStrength: 8,
          regulatoryRisk: 3,
        },
        executionPlan:
          "Build MVP with 3 core regional platforms (TikTok regional, local social networks), implement basic cross-posting and analytics. Launch beta with 50 creators in target markets through direct outreach in regional creator communities. Integrate local payment systems in month 3. Scale through creator referral program and regional platform partnerships.",
        tractionSignals:
          "Achieve 200 creator sign-ups with 60% monthly active usage, 25% of beta users upgrade to paid plans within 2 months, creators report 40%+ time savings in first week, secure partnerships with 2 regional platforms for enhanced integrations.",
        frameworkFit:
          "This follows the 'Geographic Arbitrage' framework by providing essential automation tools for the booming SMB digital transformation market, positioned as a 'Unbundling Zapier for SMBs' play that focuses on ease-of-use over enterprise complexity.",
      };
    }
  },

    /**
   * Enhanced Master Orchestration - Runs complete enhanced idea generation pipeline
   * Implements modern multi-agent architecture with critique and refinement
   */
  async generateDailyIdea(): Promise<string | null> {
    try {
      console.log("🚀 Starting Enhanced Daily Idea Generation Pipeline");
      debugLogger.info("🚀 Enhanced daily idea generation started", {
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(),
        version: "2.0-enhanced"
      });

      // Get previous ideas for diversity enforcement
      const previousIdeas = await IdeaGenerationAgentService.getDailyIdeas();
      debugLogger.info("📚 Retrieved previous ideas for diversity context", {
        previousIdeasCount: previousIdeas.length,
      });

      const previousIdeaSummaries = previousIdeas.map((idea: any) => ({
        title: idea.title,
        description: idea.description,
      }));

      // Initialize enhanced agent context
      const agentContext: AgentContext = {
        previousIdeas: previousIdeaSummaries,
      };

      // Step 1: Master Research Director - Set today's research parameters
      console.log("🎯 Step 1: Activating Master Research Director");
      const researchDirection = await this.masterResearchDirector(agentContext);
      
      // Step 2: Enhanced Trend Research - Guided by research director
      console.log("📈 Step 2: Enhanced Trend Research");
      debugLogger.info("📈 Starting enhanced trend research with research direction");
      const trends = await this.trendResearchAgent(agentContext, researchDirection || undefined);
      if (!trends) {
        debugLogger.logError("generateDailyIdea", new Error("Failed to research trends"), { step: "enhancedTrendResearch" });
        throw new Error("Failed to research trends");
      }
      agentContext.trends = trends;
      debugLogger.info("✅ Enhanced trend research completed", { trends });

      // Step 3: Enhanced Problem Gap Analysis - Deep persona-specific problems
      console.log("🎯 Step 3: Enhanced Problem Gap Analysis");
      debugLogger.info("🎯 Starting enhanced problem gap analysis");
      const problemGaps = await this.problemGapAgent(agentContext);
      if (!problemGaps) {
        debugLogger.logError("generateDailyIdea", new Error("Failed to analyze problems"), { step: "enhancedProblemAnalysis", trends });
        throw new Error("Failed to analyze problems");
      }
      agentContext.problemGaps = problemGaps;
      debugLogger.info("✅ Enhanced problem gap analysis completed", { problemGaps });

      // Step 4: Enhanced Competitive Intelligence - Strategic positioning
      console.log("🏆 Step 4: Enhanced Competitive Intelligence");
      debugLogger.info("🏆 Starting enhanced competitive intelligence");
      const competitive = await this.competitiveIntelligenceAgent(agentContext);
      if (!competitive) {
        debugLogger.logError("generateDailyIdea", new Error("Failed to research competition"), { step: "enhancedCompetitive" });
        throw new Error("Failed to research competition");
      }
      agentContext.competitive = competitive;
      debugLogger.info("✅ Enhanced competitive intelligence completed", { competitive });

      // Step 5: Enhanced Monetization Strategy
      console.log("💰 Step 5: Enhanced Monetization Strategy");
      const monetization = await this.monetizationAgent(agentContext);
      if (!monetization) throw new Error("Failed to design monetization");
      agentContext.monetization = monetization;

      // Step 6: Generate initial idea synthesis
      console.log("🧠 Step 6: Initial Idea Synthesis");
      const whatToBuild = await this.whatToBuildAgent(agentContext);
      agentContext.whatToBuild = whatToBuild || undefined;
      const initialIdea = await this.ideaSynthesisAgent(agentContext);
      if (!initialIdea) throw new Error("Failed to synthesize initial idea");

      // Step 7: Critic Agent - Analyze and create refinement prompt
      console.log("🔍 Step 7: Critic Agent Analysis");
      const refinementPrompt = await this.criticAgent([initialIdea], agentContext);

      // Step 8: Final Refined Synthesis - Apply critic feedback
      console.log("🎨 Step 8: Final Refined Idea Synthesis");
      const finalIdea = await this.ideaSynthesisAgent(agentContext, refinementPrompt || undefined);
      if (!finalIdea) throw new Error("Failed to create final refined idea");

      const idea = finalIdea;

      // Step 9: Save to database
      console.log("💾 Step 9: Saving Enhanced Idea to Database");
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

      console.log("🎉 Enhanced Daily Idea Generated Successfully:", dailyIdea.id);
      console.log("📊 Final Idea Summary:", {
        title: idea.title,
        confidenceScore: idea.confidenceScore,
        urgencyLevel: idea.urgencyLevel,
        totalScore: idea.scoring.totalScore,
        timeToMarket: idea.timeToMarket,
        tags: idea.tags
      });
      
      debugLogger.info("🎉 Enhanced daily idea generation completed successfully", {
        ideaId: dailyIdea.id,
        pipelineVersion: "2.0-enhanced",
        totalSteps: 9,
        idea: {
          title: idea.title,
          confidenceScore: idea.confidenceScore,
          urgencyLevel: idea.urgencyLevel
        }
      });

      return dailyIdea.id;
    } catch (error) {
      console.error("❌ Enhanced Daily Idea Generation Failed:", error);
      debugLogger.logError("Enhanced Daily Idea Generation", error as Error, {
        pipelineVersion: "2.0-enhanced",
        failurePoint: "pipeline execution"
      });
      return null;
    }
  },
};

export default IdeaGenerationAgentController;
