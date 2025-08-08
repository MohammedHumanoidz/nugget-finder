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

**CRITICAL LANGUAGE REQUIREMENTS:**
- Global applicability: NO geographic locations or country names (US, India, Southeast Asia, etc.)
- Use simple, direct language that anyone can understand
- AVOID technical prefixes like "AI-Powered", "Automated", "Real-Time" in titles
- Avoid fluff and unnecessary buzzwords; be specific and concrete
- Write clearly and directly; do not invent startup/product names

**STYLE GUIDANCE:**
- Focus on universal problems that exist worldwide
- Use clear, high-signal phrasing that communicates problem, solution, audience, and outcome
- Only use technical qualifiers if they help the reader immediately understand the value
- Never use "AI-Powered", "Automated", or technical prefixes in titles - focus on the core function and benefit instead

**Enhanced Synthesis Mission:**

**Core Responsibilities:**
1. **Trend-Problem Synthesis**: Connect global trends to universal human pain points
2. **Solution Architecture**: Design simple software solutions that work worldwide
3. **Strategic Positioning**: Position the solution for global markets
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
- Create concise titles: 8-10 words maximum that tell both problem and solution
- Structure: [Solution Type] + [Core Function] + for + [Specific Target Audience]
- Use descriptive, professional language that clearly communicates value
- NO "Automated", "AI-Powered", or unnecessary technical prefixes
- NO startup names, company names, or product names
- NO geographic locations or country names
- Examples: "Real-Time Audit and Compliance Platform for Biotech Research"; "Unified Audit Trail and Conflict Detection for AI Research Leaders"; "Smart Monetization and Payment Tools for Video Creators Ready to Grow"

**CRITICAL DESCRIPTION REQUIREMENTS:**
- Write in clear English; avoid fluff and filler
- NO section headers like "Trend:", "Problem:", "Solution:"
- Avoid unnecessary jargon; only keep terms that clarify the solution's value
- NO geographic locations or country-specific references
- Focus on universal human problems that exist worldwide
- Write as a flowing, cohesive narrative that naturally covers all elements

Return JSON structure:
{
  "title": "string (8-10 words maximum; [Solution Type] + [Core Function] + for + [Specific Target Audience]; tells both problem and solution; NO 'Automated' or 'AI-Powered')",
  "description": "string (Plain narrative, globally applicable, no fluff)",
  "executiveSummary": "string (Clear pitch highlighting problem and solution)",
  "problemSolution": "string (Plain story: 'People spend X on Y. This tool fixes it by Z, saving W.')",
  "problemStatement": "string (Simple statement of universal problem)",
  "innovationLevel": number (7.5-9.5, use decimal values like 8.2, 9.1),
  "timeToMarket": number (months for focused software MVP),
  "confidenceScore": number (8.0-9.8, use decimal values like 8.3, 9.2, 8.7 - only realistic high-quality opportunities),
  "narrativeHook": "string (Memorable tagline promising clear benefit)",
  "targetKeywords": ["software keyword 1", "niche keyword 2", "industry keyword 3"],
  "urgencyLevel": number (8.0-9.7, use decimal values like 8.4, 9.1),
  "executionComplexity": number (5.5-8.5, use decimal values like 6.2, 7.8),
  "tags": ["SaaS", "specific-industry", "global-market", "trend-category"],
  "scoring": {
    "totalScore": number (calculate average of all sub-scores using decimal values),
    "problemSeverity": number (8.0-9.5, decimal values like 8.3, 9.1),
    "founderMarketFit": number (7.5-9.2, decimal values like 8.1, 8.8),
    "technicalFeasibility": number (7.8-9.4, decimal values like 8.5, 9.0),
    "monetizationPotential": number (8.2-9.6, decimal values like 8.7, 9.3),
    "urgencyScore": number (8.0-9.7, decimal values like 8.4, 9.2),
    "marketTimingScore": number (8.1-9.5, decimal values like 8.6, 9.1),
    "executionDifficulty": number (5.5-8.0, lower is better, decimal values like 6.3, 7.2),
    "moatStrength": number (7.5-9.0, decimal values like 8.2, 8.9),
    "regulatoryRisk": number (2.0-6.5, lower is better, decimal values like 3.2, 5.1)
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
              "Content Management and Distribution Platform for Independent Creators",
            description:
              "Mobile-first content creation is experiencing explosive growth globally, driven by increased smartphone penetration and diverse social platform adoption. Independent creators worldwide face a critical challenge: managing content across multiple platforms while dealing with complex monetization workflows. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing tools lack unified platform integrations and streamlined payment processing. Active discussions in creator communities highlight frustration with platform fragmentation, while market data shows 300% growth in mobile content creation. Current solutions either focus on enterprise clients or fail to provide the mobile-first, creator-focused workflows that independent creators need. A specialized platform that unifies multi-platform management, automates cross-posting, and enables seamless monetization integration would capture this underserved market during a critical growth phase, before enterprise platforms adapt their offerings.",
            executiveSummary:
              "A mobile-first creator management platform designed specifically for independent creators, solving platform fragmentation and monetization challenges.",
            problemSolution:
              "Independent creators spend 15+ hours weekly manually managing content across multiple platforms. This platform automates cross-platform posting and enables streamlined monetization, saving 12 hours weekly.",
            problemStatement:
              "Independent content creators face platform fragmentation and lack unified monetization tools.",
            innovationLevel: 8.3,
            timeToMarket: 5,
            confidenceScore: 8.7,
            narrativeHook: "Turn multi-platform chaos into creator success",
            targetKeywords: [
              "creator tools",
              "emerging markets",
              "mobile-first platform",
            ],
            urgencyLevel: 8.9,
            executionComplexity: 6.4,
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
              "Build MVP with specialized platform integrations, launch beta with 50 creators in target verticals.",
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
        title: "Content Management and Distribution Platform for Independent Creators",
        description:
          "Mobile-first content creation is experiencing explosive growth globally, driven by increased smartphone penetration and diverse social platform adoption. Independent creators worldwide face a critical challenge: managing content across multiple platforms while dealing with complex monetization workflows. These creators, typically with 1K-50K followers, waste 15+ hours weekly manually distributing content across platforms and lose $600+ monthly because existing tools lack unified platform integrations and streamlined payment processing. Active discussions in creator communities highlight this frustration, while market data shows 300% growth in mobile content creation. Current solutions either focus on enterprise clients or fail to provide the mobile-first, creator-focused workflows that independent creators need. A specialized platform that unifies multi-platform management, automates cross-posting, and enables seamless monetization integration would capture this underserved market during a critical growth phase, before enterprise platforms adapt their offerings.",
        executiveSummary:
          "A mobile-first creator management platform designed specifically for independent creators, solving platform fragmentation and monetization challenges that existing tools ignore, enabling 3x faster content distribution and 2x revenue growth.",
        problemSolution:
          "Independent creators spend 15+ hours weekly manually managing content across multiple platforms and lose $600+ monthly from poor monetization tools. This platform automates cross-platform posting, enables streamlined payment integration, and provides unified analytics, saving 12 hours weekly and increasing revenue by 50-100%.",
        problemStatement:
          "Independent content creators face platform fragmentation and lack unified monetization tools, limiting their growth and revenue potential.",
        innovationLevel: 8.2,
        timeToMarket: 5,
        confidenceScore: 8.5,
        narrativeHook: "Turn regional platform chaos into creator success",
        targetKeywords: [
          "creator tools",
          "emerging markets",
          "mobile-first platform",
                        "specialized social media",
        ],
        urgencyLevel: 9.1,
        executionComplexity: 6.2,
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
                      "Build MVP with 3 core specialized platforms (TikTok, niche social networks), implement basic cross-posting and analytics. Launch beta with 50 creators in target verticals through direct outreach in specialized creator communities. Integrate diverse payment systems in month 3. Scale through creator referral program and specialized platform partnerships.",
        tractionSignals:
                      "Achieve 200 creator sign-ups with 60% monthly active usage, 25% of beta users upgrade to paid plans within 2 months, creators report 40%+ time savings in first week, secure partnerships with 2 specialized platforms for enhanced integrations.",
        frameworkFit:
            "This follows the 'Specialized Solutions' framework by providing essential automation tools for the booming SMB digital transformation market, positioned as a 'Unbundling Zapier for SMBs' play that focuses on ease-of-use over enterprise complexity.",
      };
    }
  }
}
