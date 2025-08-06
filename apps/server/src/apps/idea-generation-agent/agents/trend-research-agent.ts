import { generateText } from "ai";
import type { AgentContext, TrendData } from "../../../types/apps/idea-generation-agent";
import type { ResearchDirectorData } from "./master-research-director";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";
import { debugLogger } from "../../../utils/logger";

export class TrendResearchAgent {
  /**
   * Enhanced TrendResearchAgent - Now guided by Master Research Director
   * Uses Perplexity Deep Research with Director's research theme
   */
  static async execute(
    context: AgentContext,
    researchDirection?: ResearchDirectorData
  ): Promise<TrendData | null> {
    try {
      console.log("📈 Step 2: Enhanced Trend Research");

      const systemPrompt = `You are an elite trend research specialist with deep expertise in identifying emerging patterns that create immediate software startup opportunities. Your research is guided by today's strategic research direction.

**Research Mission Parameters:**
${
  researchDirection
    ? `
- Research Theme: ${researchDirection.researchTheme}
- Geographic Focus: ${researchDirection.geographicFocus}  
- Industry Focus: ${researchDirection.industryRotation}
- Diversity Mandates: ${researchDirection.diversityMandates.join(", ")}
`
    : "General global technology and market trend research"
}

**Critical Requirements:**
1. **Human-Validated Signals**: The trend MUST be backed by genuine online community engagement (Reddit threads with 500+ comments, viral Twitter discussions, Product Hunt buzz, active forum debates)
2. **Software-Solvable**: Focus on trends creating immediate opportunities for SaaS, APIs, web/mobile apps, or lightweight services
3. **Timing-Sensitive**: Identify trends in the "early adopter" phase - not too early (theoretical) or too late (saturated)
4. **Global Applicability**: Focus on trends that can create opportunities across different markets and regions worldwide
5. **Buildable Solutions**: Ensure the trend opens paths to <$10K MVP, 3-6 month development cycle solutions

**Validation Framework:**
- Social Media Signals: Active discussions in target communities
- Market Movement: New funding rounds, product launches, policy changes
- Behavioral Shifts: Changes in how target users work, shop, communicate
- Technology Enablers: New APIs, platforms, or capabilities becoming accessible

Return structured JSON with enhanced data:
{
  "title": "string (Compelling, specific trend title that captures the essence and industry context)",
  "description": "string (Rich narrative explaining the trend's emergence, current traction, and global implications. Include specific examples of online community engagement)",
  "trendStrength": number (1-10, weighted for current market momentum),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
  "timingUrgency": number (1-10, how time-sensitive this opportunity window is),
  "supportingData": ["Specific Reddit thread or community discussion", "Key news event or policy change", "Quantitative metrics if available", "Global market evidence and adoption signals"]
}

Focus on trends that are currently generating genuine excitement and discussion in real communities, not theoretical future possibilities.`;

      const userPrompt = `Conduct deep research to identify one powerful emerging trend that is generating significant buzz in online communities and creating immediate opportunities for software-based solutions.

**Strategic Research Direction:**
${
  researchDirection
    ? `
Focus your research on: ${researchDirection.researchTheme}
Market context: Global market opportunities
Industry vertical: ${researchDirection.industryRotation}

Research approach: ${researchDirection.researchApproach}
`
    : "Conduct broad global technology and market trend research"
}

**Diversity Requirements - MUST AVOID:**
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map((idea) => `- Theme: "${idea.title}" - Focus area already covered`)
        .join("\n")
    : "- No restrictions - establish new research territory"
}

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

      debugLogger.logParsingAttempt(
        "EnhancedTrendResearchAgent",
        content,
        parseResult
      );

      if (!parseResult.success) {
        console.error(
          "❌ Failed to parse enhanced trend data:",
          parseResult.error
        );
        debugLogger.logError(
          "EnhancedTrendResearchAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          { parseResult, originalContent: content }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const trendData = parseResult.data as TrendData;

      console.log("✅ Step 2: Enhanced Trend Research Completed:", {
        title: trendData.title,
        trendStrength: trendData.trendStrength,
        catalystType: trendData.catalystType,
        timingUrgency: trendData.timingUrgency,
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
        title: researchDirection
          ? `${researchDirection.industryRotation} Innovation in ${researchDirection.geographicFocus}`
          : "AI-Powered Workflow Automation for SMBs",
        description: researchDirection
          ? `Emerging trend in ${researchDirection.geographicFocus} focused on ${researchDirection.industryRotation} digital transformation.`
          : "Small to medium businesses are increasingly adopting AI-powered tools to automate repetitive workflows, driven by labor shortages and cost pressures.",
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
  }
}
