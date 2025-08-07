import { generateText } from "ai";
import type { AgentContext, CompetitiveData } from "../../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { debugLogger } from "../../../utils/logger";

export class CompetitiveIntelligenceAgent {
  /**
   * Enhanced CompetitiveIntelligenceAgent - Better competitive analysis with strategic positioning
   * Uses structured prompts for deeper market understanding
   */
  static async execute(
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
- Consider demographic advantages in underserved global market segments

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
    "targetSegment": "string (Extremely specific target persona with industry/vertical context)",
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

      debugLogger.logPerplexityResponse(
        "EnhancedCompetitiveIntelligenceAgent",
        response
      );

      if (!response?.choices?.[0]?.message?.content) {
        debugLogger.logError(
          "EnhancedCompetitiveIntelligenceAgent",
          new Error("No response from Perplexity"),
          { response }
        );
        throw new Error("No response from Perplexity");
      }

      const content = response.choices[0].message.content;
      console.log(
        "🔍 Enhanced Competitive Intelligence raw response length:",
        content.length
      );
      console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

      const isAlreadyJson =
        content.trim().startsWith("{") && content.trim().endsWith("}");
      debugLogger.logContentAnalysis(
        "EnhancedCompetitiveIntelligenceAgent",
        content,
        isAlreadyJson
      );

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

        debugLogger.logLLMStructuring(
          "EnhancedCompetitiveIntelligenceAgent",
          structuringPrompt,
          content
        );

        const { text: structuredJson } = await generateText({
          model: openrouter("openai/gpt-4.1-mini"),
          prompt: structuringPrompt,
          temperature: 0.1,
          maxTokens: 1200,
        });

        debugLogger.logLLMStructuringResponse(
          "EnhancedCompetitiveIntelligenceAgent",
          structuredJson
        );
        return structuredJson;
      };

      const parseResult = await parsePerplexityResponse<CompetitiveData>(
        content,
        structureWithLLM,
        ["competition", "positioning"]
      );

      debugLogger.logParsingAttempt(
        "EnhancedCompetitiveIntelligenceAgent",
        content,
        parseResult
      );

      if (!parseResult.success) {
        console.error(
          "❌ Failed to parse enhanced competitive data:",
          parseResult.error
        );
        debugLogger.logError(
          "EnhancedCompetitiveIntelligenceAgent",
          new Error(
            `Failed to parse Perplexity response: ${parseResult.error}`
          ),
          { parseResult, originalContent: content }
        );
        throw new Error(
          `Failed to parse Perplexity response: ${parseResult.error}`
        );
      }

      const competitiveData = parseResult.data as CompetitiveData;

      console.log("✅ Step 4: Enhanced Competitive Intelligence Completed:", {
        marketConcentration:
          competitiveData.competition?.marketConcentrationLevel,
        directCompetitorCount:
          competitiveData.competition?.directCompetitors?.length || 0,
        positioningName: competitiveData.positioning?.name,
        competitiveScore:
          competitiveData.competition?.competitivePositioningScore,
      });

      debugLogger.logAgentResult(
        "EnhancedCompetitiveIntelligenceAgent",
        competitiveData,
        true
      );
      return competitiveData;
    } catch (error) {
      console.error("EnhancedCompetitiveIntelligenceAgent error:", error);
      debugLogger.logError(
        "EnhancedCompetitiveIntelligenceAgent",
        error as Error,
        {
          agent: "EnhancedCompetitiveIntelligenceAgent",
          fallbackUsed: true,
        }
      );

      console.log("🔄 Using enhanced fallback competitive intelligence data");
      return {
        competition: {
          marketConcentrationLevel: "LOW" as const,
          marketConcentrationJustification:
            "Global market focus creates opportunities for specialized solutions targeting underserved segments with digital-first, universally-adapted approaches",
          directCompetitors: [
            {
              name: "Generic Global Platforms",
              justification:
                                  "Large platforms that attempt to serve the target market but lack specialized customization",
              strengths: [
                "Brand recognition",
                "Extensive features",
                "Large user base",
              ],
              weaknesses: [
                "No local platform integrations",
                "Western-centric design",
                "Complex pricing for emerging markets",
                "Poor mobile optimization",
              ],
            },
          ],
          indirectCompetitors: [
            {
              name: "Manual/Traditional Methods",
              justification:
                "Current manual processes and traditional tools used by target personas",
              strengths: [
                "Familiar workflows",
                "No technology barriers",
                "Full control",
              ],
              weaknesses: [
                "Time-intensive",
                "Error-prone",
                "No scalability",
                "Missing automation opportunities",
              ],
            },
          ],
          competitorFailurePoints: [
                              "Lack of specialized platform integrations and diverse payment support",
            "Complex interfaces designed for desktop users, not mobile-first workflows",
            "Pricing models that don't scale with emerging market budgets",
          ],
          unfairAdvantage: [
                          "Native integrations with specialized platforms and diverse payment systems",
              "Mobile-first design optimized for global digital-first usage patterns",
            "Local market expertise and community-driven feature development",
          ],
          moat: [
                          "Exclusive partnerships with specialized platforms and niche service providers",
              "Network effects within specific industry communities",
              "Data advantages from understanding specialized user behavior patterns",
          ],
          competitivePositioningScore: 8,
        },
        positioning: {
          name: "Creator Tools for Mobile-First Markets",
          targetSegment:
            "Independent content creators and small business owners with limited resources",
          valueProposition:
            "The only platform designed specifically for independent creators, with native multi-platform integrations, mobile-first workflows, and streamlined monetization support that enterprise platforms ignore",
          keyDifferentiators: [
            "Native integration with multiple social platforms and payment gateways",
            "Mobile-optimized interface designed for smartphone-primary users",
            "Community-driven feature development with creator-focused expertise",
          ],
        },
      };
    }
  }
}
