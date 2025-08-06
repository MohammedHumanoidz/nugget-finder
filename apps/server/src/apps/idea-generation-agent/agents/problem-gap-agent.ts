import { generateText } from "ai";
import type { AgentContext, ProblemGapData } from "../../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { debugLogger } from "../../../utils/logger";

export class ProblemGapAgent {
  /**
   * Enhanced ProblemGapAgent - Uses reasoning-rich prompts from sonar-reasoning model
   * Identifies 2-3 sharply defined, systemic problems for specific personas
   */
  static async execute(context: AgentContext): Promise<ProblemGapData | null> {
    try {
      console.log("🎯 Step 3: Enhanced Problem Gap Analysis");

      const systemPrompt = `You are an elite business strategist and systemic problem identifier with deep expertise in discovering acute commercial pain points that create immediate software startup opportunities.

**Enhanced Analysis Framework:**

**Problem Identification Criteria:**
1. **Acute & Present**: Problems happening RIGHT NOW, costing real money/time/opportunities daily
2. **Persona-Specific**: Focus on specific archetypes (e.g., "independent podcast creators with limited resources" vs "content creators generally")
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
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map(
          (idea) =>
            `- Avoid: Problems similar to "${
              idea.title
            }" - ${idea.description?.substring(0, 100)}...`
        )
        .join("\n")
    : "- No restrictions - explore new problem territory"
}

Focus on immediate, specific, financially painful problems that create urgent demand for software solutions.`;

      // Use sonar-pro for enhanced analysis
      debugLogger.logPerplexityRequest(
        "EnhancedProblemGapAgent",
        userPrompt,
        systemPrompt,
        {
          reasoning_effort: "high", // Enhanced reasoning
          model: "sonar-pro", // Better model for analysis
          context: context.trends,
        }
      );

      const response = await perplexity(
        userPrompt,
        systemPrompt,
        "high", // High reasoning effort
        "sonar-pro" // Use pro model
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
      console.log(
        "🔍 Enhanced ProblemGap raw response length:",
        content.length
      );
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      const isAlreadyJson =
        content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis(
        "EnhancedProblemGapAgent",
        content,
        isAlreadyJson
      );

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

        debugLogger.logLLMStructuring(
          "EnhancedProblemGapAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4.1-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 1000,
        });

        debugLogger.logLLMStructuringResponse(
          "EnhancedProblemGapAgent",
          structuredJson
        );
        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<ProblemGapData>(
        content,
        structureWithLLM,
        ["problems", "gaps"]
      );

      debugLogger.logParsingAttempt(
        "EnhancedProblemGapAgent",
        content,
        parseResult
      );

      if (!parseResult.success) {
        console.error(
          "❌ Failed to parse enhanced problem gap data:",
          parseResult.error
        );
        debugLogger.logError(
          "EnhancedProblemGapAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          { parseResult, originalContent: content }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const problemGapData = parseResult.data as ProblemGapData;

      console.log("✅ Step 3: Enhanced Problem Gap Analysis Completed:", {
        problemCount: problemGapData.problems?.length || 0,
        gapCount: problemGapData.gaps?.length || 0,
      });

      debugLogger.logAgentResult(
        "EnhancedProblemGapAgent",
        problemGapData,
        true
      );
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
            description:
              "Current content management tools are built for Western platforms and payment systems, failing to integrate with regional social platforms, local payment gateways, and mobile-first workflows prevalent in emerging markets",
            impact:
              "Content creators lose 40-60% of potential revenue from regional sponsorships and audience monetization",
            target:
              "Independent content creators and influencers with limited resources",
            opportunity:
              "Creator-focused content management platform with native integrations for multiple platforms, mobile-optimized workflows, and streamlined monetization systems",
          },
          {
            title: "Hybrid Commerce Inventory Intelligence",
            description:
              "Existing inventory tools assume pure online or pure offline operations, creating blind spots for businesses operating across channels, particularly in markets where offline-to-online transition is rapid",
            impact:
              "15-25% revenue loss from stock-outs and overstocking, plus 8+ hours weekly manual reconciliation",
            target:
              "Small to medium e-commerce businesses in tier-2 cities with hybrid online/offline operations",
            opportunity:
              "AI-powered inventory assistant that learns from both online analytics and offline sales patterns to predict demand across channels",
          },
        ],
      };
    }
  }
}
