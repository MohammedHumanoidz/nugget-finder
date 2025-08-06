import { generateText } from "ai";
import type { AgentContext, SynthesizedIdea } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

export class IdeaSynthesisAgent {
  /**
   * Enhanced IdeaSynthesisAgent - Uses Trend Architect logic with critic feedback
   * Implements markdown-style output format and strategic refinement
   */
  static async execute(
    context: AgentContext,
    refinementPrompt?: string
  ): Promise<SynthesizedIdea | null> {
    try {
      console.log(
        "🧠 Step 7: Enhanced Idea Synthesis with Trend Architect Logic"
      );

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

${
  refinementPrompt
    ? `
**CRITICAL REFINEMENT REQUIREMENTS:**
${refinementPrompt}

Apply these refinement recommendations to strengthen the final synthesis.
`
    : ""
}

**Research Inputs to Synthesize:**
TREND: ${context.trends?.title} - ${context.trends?.description}
PROBLEMS: ${context.problemGaps?.problems.join(", ")}
COMPETITIVE POSITIONING: ${context.competitive?.positioning.valueProposition}
MONETIZATION MODEL: ${context.monetization?.primaryModel}

**Diversity Requirements (ensure novelty):**
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map((idea) => `- Avoid themes similar to: "${idea.title}"`)
        .join("\n")
    : "- No restrictions - create breakthrough opportunity"
}

**Output Requirements:**
Generate a single, irresistible startup idea using the enhanced narrative format above, then structure it into the required JSON format. The idea should feel so compelling and obvious that someone would start building it immediately.

**CRITICAL TITLE REQUIREMENTS:**
- NO startup names, company names, or product names (avoid names like "ChatOrderSync", "FlowGenius", "Nordic Platform", etc.)
- Focus on the SOLUTION CATEGORY and TARGET MARKET (e.g., "Multi-Channel Inventory Management for Independent Artisans" instead of "Artisan Platform")
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
  "tags": ["SaaS", "specific-industry", "global-market", "trend-category"],
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
      const parseResult =
        await EnhancedJsonParser.parseWithFallback<SynthesizedIdea>(
          text,
          ["title", "description", "problemStatement", "scoring"],
          {
            title:
              "Multi-Platform Content Management for Independent Creators",
            description:
              "Mobile-first content creation is experiencing explosive growth globally, driven by increased smartphone penetration and diverse social platform adoption. Independent creators worldwide face a critical challenge: managing content across multiple platforms while dealing with complex monetization workflows. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing tools lack unified platform integrations and streamlined payment processing. Active discussions in creator communities highlight frustration with platform fragmentation, while market data shows 300% growth in mobile content creation. Current solutions either focus on enterprise clients or fail to provide the mobile-first, creator-focused workflows that independent creators need. A specialized platform that unifies multi-platform management, automates cross-posting, and enables seamless monetization integration would capture this underserved market during a critical growth phase, before enterprise platforms adapt their offerings.",
            executiveSummary:
              "A mobile-first creator management platform designed specifically for independent creators, solving platform fragmentation and monetization challenges.",
            problemSolution:
              "Independent creators spend 15+ hours weekly manually managing content across multiple platforms. This platform automates cross-platform posting and enables streamlined monetization, saving 12 hours weekly.",
            problemStatement:
              "Independent content creators face platform fragmentation and lack unified monetization tools.",
            innovationLevel: 8,
            timeToMarket: 5,
            confidenceScore: 9,
            narrativeHook: "Turn regional platform chaos into creator success",
            targetKeywords: [
              "creator tools",
              "emerging markets",
              "mobile-first platform",
            ],
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
            executionPlan:
              "Build MVP with regional platform integrations, launch beta with 50 creators in target markets.",
            tractionSignals:
              "Achieve 200 creator sign-ups with 60% monthly active usage within 3 months.",
            frameworkFit:
              "Geographic Arbitrage framework solving global problems with regional solutions.",
          }
        );

      if (!parseResult.success) {
        console.error(
          "❌ Enhanced Idea Synthesis JSON parsing failed:",
          parseResult.error
        );
        console.log(
          "📝 Original response:",
          parseResult.originalText?.substring(0, 500)
        );
        if (parseResult.cleanedText) {
          console.log(
            "🧹 Cleaned response:",
            parseResult.cleanedText.substring(0, 500)
          );
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
        totalScore: synthesizedIdea.scoring.totalScore,
      });

      return synthesizedIdea;
    } catch (error) {
      console.error("Enhanced IdeaSynthesisAgent error:", error);

      console.log("🔄 Using enhanced fallback synthesis data");
      return {
        title: "Multi-Platform Content Management for Independent Creators",
        description:
          "Mobile-first content creation is experiencing explosive growth globally, driven by increased smartphone penetration and diverse social platform adoption. Independent creators worldwide face a critical challenge: managing content across multiple platforms while dealing with complex monetization workflows. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing tools lack unified platform integrations and streamlined payment processing. Active discussions in creator communities highlight this frustration, while market data shows 300% growth in mobile content creation. Current solutions either focus on enterprise clients or fail to provide the mobile-first, creator-focused workflows that independent creators need. A specialized platform that unifies multi-platform management, automates cross-posting, and enables seamless monetization integration would capture this underserved market during a critical growth phase, before enterprise platforms adapt their offerings.",
        executiveSummary:
          "A mobile-first creator management platform designed specifically for independent creators, solving platform fragmentation and monetization challenges that existing tools ignore, enabling 3x faster content distribution and 2x revenue growth.",
        problemSolution:
          "Independent creators spend 15+ hours weekly manually managing content across multiple platforms and lose $600+ monthly from poor monetization tools. This platform automates cross-platform posting, enables streamlined payment integration, and provides unified analytics, saving 12 hours weekly and increasing revenue by 50-100%.",
        problemStatement:
          "Independent content creators face platform fragmentation and lack unified monetization tools, limiting their growth and revenue potential.",
        innovationLevel: 8,
        timeToMarket: 5,
        confidenceScore: 9,
        narrativeHook: "Turn regional platform chaos into creator success",
        targetKeywords: [
          "creator tools",
          "emerging markets",
          "mobile-first platform",
          "regional social media",
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
  }
}
