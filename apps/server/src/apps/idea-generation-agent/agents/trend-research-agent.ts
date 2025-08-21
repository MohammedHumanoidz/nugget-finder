/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { generateText } from "ai";
import type {
  AgentContext,
  TrendData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { debugLogger } from "../../../utils/logger";
import { getPrompt } from "../../../utils/prompt-helper";
import type { ResearchDirectorData } from "./master-research-director";

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

      // Get dynamic prompt from database with fallback
      const baseSystemPrompt = await getPrompt(
        "TrendResearchAgent",
        "systemPrompt",
        `You are an elite trend research specialist with deep expertise in identifying emerging patterns that create immediate software startup opportunities. Your research is guided by today's strategic research direction.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on GLOBAL trends that affect people worldwide
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Look for universal human behaviors and problems
- Trends should be globally applicable, not region-specific

**Research Mission Parameters:**
${
  researchDirection
    ? `
- Research Theme: ${researchDirection.researchTheme}
- Global Market Focus: ${researchDirection.globalMarketFocus}  
- Industry Focus: ${researchDirection.industryRotation}
- Diversity Mandates: ${researchDirection.diversityMandates.join(", ")}
`
    : "General global technology and market trend research"
}

**Critical Requirements:**
1. **Human-Validated Signals**: The trend MUST be backed by genuine online community engagement worldwide
2. **Simple Software Solutions**: Focus on trends creating opportunities for easy-to-use apps and web tools
3. **Right Timing**: Identify trends that are growing but not overcrowded yet
4. **Global Applicability**: Focus on trends that affect people everywhere, not just specific countries
5. **Buildable Solutions**: Ensure the trend opens paths to simple, affordable software solutions

**Validation Framework:**
- Social Media Signals: Active discussions in consumer communities, lifestyle forums
- Behavioral Shifts: Changes in how people live, shop, learn, communicate, spend time
- Technology Adoption: New apps, platforms, or tools becoming popular with everyday users
- Cultural Movements: Lifestyle trends, generational shifts, changing values

Return structured JSON with enhanced data:
{
  "title": "string (Clear, simple trend title using everyday language, no jargon or locations)",
  "description": "string (Plain English explanation of the trend, why it's happening globally, and what people are saying about it online)",
  "trendStrength": number (1-10, weighted for current market momentum),
  "catalystType": "TECHNOLOGY_BREAKTHROUGH" | "REGULATORY_CHANGE" | "MARKET_SHIFT" | "SOCIAL_TREND" | "ECONOMIC_FACTOR",
  "timingUrgency": number (1-10, how time-sensitive this opportunity window is),
  "supportingData": ["Specific social media discussion or community trend", "Key lifestyle change or behavioral shift", "Quantitative metrics if available", "Global adoption patterns and consumer evidence"]
}

Focus on trends that are currently generating genuine excitement and discussion in real communities, particularly those affecting individual consumers and their daily lives.
`
      );

      // Get dynamic user prompt from database with fallback
      const baseUserPrompt = await getPrompt(
        "TrendResearchAgent",
        "userPrompt",
        `Conduct deep research to identify one powerful emerging trend that is generating significant buzz in online communities and creating immediate opportunities for consumer-focused software solutions.

**Strategic Research Direction:**
${
  researchDirection
    ? `
Focus your research on: ${researchDirection.researchTheme}
Market context: Global market opportunities
Industry vertical: ${researchDirection.industryRotation}

Research approach: ${researchDirection.researchApproach}
`
    : "Conduct broad global consumer lifestyle and technology trend research"
}

**Diversity Requirements - MUST AVOID:**
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map((idea) => `- Theme: "${idea.title}" - Focus area already covered`)
        .join("\n")
    : "- No restrictions - establish new research territory"
}

Find a trend that is genuinely creating conversation, excitement, and early adoption among everyday people. Provide evidence of real human engagement and community validation, particularly from consumer communities and lifestyle discussions.`
      );

      // Build complete user prompt with context
      const userPrompt = `${baseUserPrompt}

**Strategic Research Direction:**
${
        researchDirection
          ? `
Focus your research on: ${researchDirection.researchTheme}
Market context: Global market opportunities
Industry vertical: ${researchDirection.industryRotation}

Research approach: ${researchDirection.researchApproach}
`
          : "Conduct broad global consumer lifestyle and technology trend research"
      }

**Diversity Requirements - MUST AVOID:**
${
        context.previousIdeas && context.previousIdeas.length > 0
          ? context.previousIdeas
              .map((idea) => `- Theme: "${idea.title}" - Focus area already covered`)
              .join("\n")
          : "- No restrictions - establish new research territory"
      }`;
      // Build complete system prompt with context
      const systemPrompt = `${baseSystemPrompt}

**Research Mission Parameters:**
${
  researchDirection
    ? `
- Research Theme: ${researchDirection.researchTheme}
- Global Market Focus: ${researchDirection.globalMarketFocus}  
- Industry Focus: ${researchDirection.industryRotation}
- Diversity Mandates: ${researchDirection.diversityMandates.join(", ")}
`
    : "General global technology and market trend research"
}

${
  researchDirection
    ? `
Focus your research on: ${researchDirection.researchTheme}
Market context: Global market opportunities
Industry vertical: ${researchDirection.industryRotation}

Research approach: ${researchDirection.researchApproach}
`
    : "Conduct broad global consumer lifestyle and technology trend research"
}

**Diversity Requirements - MUST AVOID:**
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map((idea) => `- Theme: "${idea.title}" - Focus area already covered`)
        .join("\n")
    : "- No restrictions - establish new research territory"
}`;

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

      console.log("🔍 TrendAgent response structure debug:", {
        hasResponse: !!response,
        hasChoices: !!response?.choices,
        choicesLength: response?.choices?.length,
        hasFirstChoice: !!response?.choices?.[0],
        hasMessage: !!response?.choices?.[0]?.message,
        hasContent: !!response?.choices?.[0]?.message?.content,
        contentLength: response?.choices?.[0]?.message?.content?.length,
        contentPreview: response?.choices?.[0]?.message?.content?.substring(0, 100)
      });

      if (!response?.choices?.[0]?.message?.content || response.choices[0].message.content.trim() === "" || response.choices[0].message.content === "NO CONTENT") {
        debugLogger.logError(
          "EnhancedTrendResearchAgent",
          new Error("No response from Perplexity"),
          { 
            response,
            responseKeys: response ? Object.keys(response) : null,
            choicesType: typeof response?.choices,
            firstChoiceType: typeof response?.choices?.[0],
            contentLength: response?.choices?.[0]?.message?.content?.length || 0
          }
        );
        
        // Instead of throwing, use fallback directly
        console.log("🔄 Perplexity returned no content, using enhanced fallback trend data");
        return {
          title: researchDirection
            ? `${researchDirection.industryRotation} Innovation in ${researchDirection.globalMarketFocus}`
            : "Personal Organization Tools for Busy Individuals",
          description: researchDirection
            ? `Emerging trend in ${researchDirection.globalMarketFocus} focused on ${researchDirection.industryRotation} solutions that help people manage their daily lives.`
            : "Busy individuals worldwide are looking for simple tools to help them stay organized, manage their time better, and coordinate their daily activities more effectively, driven by increasingly complex modern life demands.",
          trendStrength: 8,
          catalystType: "SOCIAL_TREND" as const,
          timingUrgency: 7,
          supportingData: [
            "Active discussions in global lifestyle and productivity communities",
            "Growing adoption of personal organization and time management apps", 
            "Increasing consumer demand for simple daily life management tools"
          ]
        };
      }

      const content = response.choices[0].message.content;
      console.log("🔍 Enhanced Trend raw response length:", content.length);
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      // Enhanced LLM structuring with better prompts
      const structureWithLLM = async (content: string): Promise<string> => {
        const structuringPrompt = `You are an expert data analyst specializing in consumer trend research. Convert the following comprehensive trend analysis into the exact JSON structure requested.

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
          maxOutputTokens: 800,
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

        // Instead of throwing an error, use fallback data to continue the pipeline
        console.log("🔄 Using enhanced fallback trend data");
        return {
          title: researchDirection
            ? `${researchDirection.industryRotation} Consumer Trends`
            : "Personal Productivity and Life Organization",
          description: researchDirection
            ? `Growing trends in ${researchDirection.globalMarketFocus} focused on ${researchDirection.industryRotation} solutions that help people manage their daily lives better.`
            : "People worldwide are looking for simple tools to help them organize their daily lives, manage their time better, and reduce everyday stress and frustration.",
          trendStrength: 7,
          catalystType: "SOCIAL_TREND" as const,
          timingUrgency: 6,
          supportingData: [
            "Analysis faced parsing challenges but consumer signals suggest strong demand",
            "Global communities discussing personal productivity solutions",
            "Increasing adoption of lifestyle management tools",
          ],
        };
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
          ? `${researchDirection.industryRotation} Innovation in ${researchDirection.globalMarketFocus}`
          : "Personal Organization Tools for Busy Individuals",
        description: researchDirection
          ? `Emerging trend in ${researchDirection.globalMarketFocus} focused on ${researchDirection.industryRotation} solutions that help people manage their daily lives.`
          : "Busy individuals worldwide are looking for simple tools to help them stay organized, manage their time better, and coordinate their daily activities more effectively, driven by increasingly complex modern life demands.",
        trendStrength: 8,
        catalystType: "SOCIAL_TREND" as const,
        timingUrgency: 7,
        supportingData: [
          "Active discussions in global lifestyle and productivity communities",
          "Growing adoption of personal organization and time management apps",
          "Increasing consumer demand for simple daily life management tools",
        ],
      };
    }
  }
}
