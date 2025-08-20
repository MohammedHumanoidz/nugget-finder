/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { generateText } from "ai";
import type {
	AgentContext,
	SynthesizedIdea,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";
import { getPrompt } from "../../../utils/prompt-helper";
import { debugLogger } from "../../../utils/logger";

export class IdeaSynthesisAgent {
	/**
	 * Creates a dynamic fallback based on research context instead of hardcoded data
	 */
	private static createDynamicFallback(context: AgentContext): SynthesizedIdea {
		// Extract key information from research context
		const trendTitle = context.trends?.title || "Emerging Market Opportunity";
		const trendDescription = context.trends?.description || "A growing market trend presents new opportunities";
		const mainProblem = context.problemGaps?.problems?.[0] || "People face challenges in their daily activities";
		const valueProposition = context.competitive?.positioning?.valueProposition || "A simple tool that solves everyday problems";
		
		// Generate title based on trend context
		let title = "Simple Tool That Solves Daily Problems";
		if (context.trends?.title?.toLowerCase().includes("restaurant") || 
			context.trends?.title?.toLowerCase().includes("food")) {
			title = "Food Order Management Tool That Actually Works";
		} else if (context.trends?.title?.toLowerCase().includes("family")) {
			title = "Family Coordination App That Actually Works";
		} else if (context.trends?.title?.toLowerCase().includes("finance") || 
				   context.trends?.title?.toLowerCase().includes("money")) {
			title = "Personal Finance Tracker That Actually Helps";
		}
		
		// Generate description based on trend and problems
		const description = `${trendDescription.substring(0, 400)}... This creates an opportunity for a simple solution that addresses these challenges by ${valueProposition.toLowerCase()}. The tool would help people save time and reduce frustration by providing a focused solution to this specific problem.`;
		
		return {
			title,
			description,
			executiveSummary: `A focused solution addressing the challenges identified in ${trendTitle.toLowerCase()}.`,
			problemSolution: `${mainProblem.substring(0, 100)}... This tool provides a simple solution that addresses these issues.`,
			problemStatement: `${mainProblem.substring(0, 150)}...`,
			innovationLevel: 7.5,
			timeToMarket: 4,
			confidenceScore: 8.0,
			narrativeHook: "Finally, a tool that actually solves this problem",
			targetKeywords: ["solution", "tool", "simple"],
			urgencyLevel: 8.0,
			executionComplexity: 6.5,
			tags: ["Consumer", "Solution", "Tool"],
			scoring: {
				totalScore: 7.8,
				problemSeverity: 8.0,
				founderMarketFit: 7.5,
				technicalFeasibility: 8.0,
				monetizationPotential: 7.8,
				urgencyScore: 8.0,
				marketTimingScore: 7.9,
				executionDifficulty: 6.5,
				moatStrength: 7.5,
				regulatoryRisk: 3.5,
			},
			executionPlan: "Build MVP with core features, test with target users, iterate based on feedback.",
			tractionSignals: "Achieve initial user adoption with positive feedback and engagement metrics.",
			frameworkFit: "Consumer-focused approach addressing validated market need.",
		};
	}

	/**
	 * Enhanced IdeaSynthesisAgent - Uses Trend Architect logic with critic feedback
	 * Implements markdown-style output format and strategic refinement
	 */
	static async execute(
		context: AgentContext,
		refinementPrompt?: string,
	): Promise<SynthesizedIdea | null> {
		try {
			debugLogger.debug(
				"🧠 Step 7: Enhanced Idea Synthesis with Trend Architect Logic",
			);

			// Get dynamic prompt from database with fallback
			const baseTrendArchitectPrompt = await getPrompt(
				'IdeaSynthesisAgent',
				'trendArchitectPrompt',
				`You are the Trend Architect - a world-class startup idea synthesizer who transforms market research into compelling, immediately actionable business opportunities. Your expertise lies in combining trend analysis, problem identification, and competitive intelligence into cohesive startup concepts that feel inevitable and urgent.

**CRITICAL LANGUAGE REQUIREMENTS:**
- Global applicability: NO geographic locations or country names (US, India, Southeast Asia, etc.)
- Use simple, direct language that anyone can understand
- COMPLETELY AVOID these technical terms: "AI-Powered", "Automated", "Agent", "Agentic", "Real-Time", "Composable", "Orchestration"
- Avoid fluff and unnecessary buzzwords; be specific and concrete
- Write clearly and directly; do not invent startup/product names
- Focus on what the tool DOES, not the technology behind it

**CONSUMER-FIRST APPROACH:**
- Target individual consumers, families, students, and everyday people
- Focus on personal daily life problems, not business workflow issues
- Use language that regular people use in conversation
- Think about problems that affect personal time, money, relationships, health, learning
- Solutions should feel approachable and easy for anyone to understand and use

**STYLE GUIDANCE:**
- Focus on universal problems that exist worldwide for individual people
- Use clear, high-signal phrasing that communicates problem, solution, audience, and outcome
- Only use technical qualifiers if they help the reader immediately understand the personal value
- Titles should describe the core function and personal benefit clearly

**Enhanced Synthesis Mission:**

**Core Responsibilities:**
1. **Trend-Problem Synthesis**: Connect global trends to universal personal frustrations and daily life challenges
2. **Solution Architecture**: Design simple software solutions that work for individual consumers worldwide
3. **Consumer Positioning**: Position the solution for everyday people and personal use cases
4. **Execution Clarity**: Provide clear, actionable next steps for immediate implementation of consumer-focused products

**Enhanced Description Format:**
Create a flowing narrative that naturally integrates all elements without explicit section headers:

The description should weave together the trend context, specific personal problem, target individuals, evidence of consumer demand, solution overview, timing rationale, and urgency in a cohesive narrative that reads naturally. Avoid using "Trend:", "Problem:", "Solution:", or other explicit section markers within the description text.

Structure as a compelling story that:
- Opens with the lifestyle or personal context and why it's emerging now
- Identifies the specific individual frustrations with quantified personal impact  
- Describes the target consumer clearly (families, students, working parents, etc.)
- Provides evidence of consumer discussions and validation
- Explains the solution approach and unique personal value
- Concludes with why timing is critical for consumer adoption

The result should be a smooth, engaging narrative that covers all strategic elements without formatted sections.

**Enhanced Quality Criteria:**
- Consumer-focused solution buildable within 3-6 months
- Target individuals would pay within first trial week  
- Trend amplifies personal problem urgency significantly
- Solution creates network effects or community value for consumers
- Clear path to consumer adoption and $1M+ ARR within 18 months

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
		: "- No restrictions - create breakthrough consumer opportunity"
}

**Output Requirements:**
Generate a single, irresistible consumer-focused startup idea using the enhanced narrative format above, then structure it into the required JSON format. The idea should feel so compelling and obvious that someone would start building it immediately for their own personal use.

**CRITICAL TITLE REQUIREMENTS:**
- Create concise titles: 8-10 words maximum that tell both problem and solution
- Structure: [Solution Type] + [Core Function] + for + [Specific Target People]
- Use descriptive, friendly language that clearly communicates personal value
- NO "Automated", "AI-Powered", "Agent", "Smart", or unnecessary technical prefixes
- NO startup names, company names, or product names
- NO geographic locations or country names
- Examples: "Family Calendar That Actually Keeps Everyone Organized"; "Expense Tracker That Helps You Save Money Daily"; "Meal Planner for Busy Parents Who Want Healthy Kids"

**CRITICAL DESCRIPTION REQUIREMENTS:**
- Write in clear English that sounds like a friend explaining the idea
- NO section headers like "Trend:", "Problem:", "Solution:"
- Avoid unnecessary jargon; only keep terms that clarify the personal value
- NO geographic locations or country-specific references
- Focus on universal human problems that exist worldwide for individuals
- Write as a flowing, cohesive narrative that naturally covers all elements
- Make it feel personal and relatable to everyday people

Return JSON structure:
{
  "title": "string (8-10 words maximum; [Solution Type] + [Core Function] + for + [Specific Target People]; tells both problem and solution; NO technical prefixes)",
  "description": "string (Plain narrative, globally applicable, no fluff, sounds conversational)",
  "executiveSummary": "string (Clear pitch highlighting personal problem and solution)",
  "problemSolution": "string (Plain story: 'People spend X on Y. This tool fixes it by Z, saving W.')",
  "problemStatement": "string (Simple statement of universal personal problem)",
  "innovationLevel": number (7.5-9.5, use decimal values like 8.2, 9.1),
  "timeToMarket": number (months for focused consumer software MVP),
  "confidenceScore": number (8.0-9.8, use decimal values like 8.3, 9.2, 8.7 - only realistic high-quality opportunities),
  "narrativeHook": "string (Memorable tagline promising clear personal benefit)",
  "targetKeywords": ["consumer keyword 1", "lifestyle keyword 2", "personal keyword 3"],
  "urgencyLevel": number (8.0-9.7, use decimal values like 8.4, 9.1),
  "executionComplexity": number (5.5-8.5, use decimal values like 6.2, 7.8),
  "tags": ["Consumer", "specific-lifestyle", "global-market", "trend-category"],
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
  "executionPlan": "string (Concrete next steps for building and launching consumer MVP with user acquisition strategy)",
  "tractionSignals": "string (Specific, achievable metrics for 3-6 month consumer validation)",
  "frameworkFit": "string (Strategic framework explaining why this consumer approach leads to success)"
}

Create a consumer idea so compelling that it becomes impossible to ignore - the kind of personal tool that makes everything else feel like a hassle.`
			);

			// Build the complete prompt with context
			const trendArchitectPrompt = `${baseTrendArchitectPrompt}

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
					: "- No restrictions - create breakthrough consumer opportunity"
			}`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: trendArchitectPrompt,
				temperature: 0.1,
				maxOutputTokens: 2000,
			});

			// Create dynamic fallback based on research context
			const dynamicFallback = IdeaSynthesisAgent.createDynamicFallback(context);
			
			// Use enhanced JSON parser to handle markdown code blocks and complex responses
			const parseResult =
				await EnhancedJsonParser.parseWithFallback<SynthesizedIdea>(
					text,
					["title", "description", "problemStatement", "scoring"],
					dynamicFallback,
				);

			if (!parseResult.success) {
				console.error(
					"❌ Enhanced Idea Synthesis JSON parsing failed:",
					parseResult.error,
				);
				debugLogger.debug(
					"📝 Original response:",
					parseResult.originalText?.substring(0, 500),
				);
				if (parseResult.cleanedText) {
					debugLogger.debug(
						"🧹 Cleaned response:",
						parseResult.cleanedText.substring(0, 500),
					);
				}
			}

			const synthesizedIdea = parseResult.data as SynthesizedIdea;

			// Add WhatToBuild data if available in context
			if (context.whatToBuild) {
				synthesizedIdea.whatToBuild = context.whatToBuild;
			}

			debugLogger.debug("✅ Step 7: Enhanced Idea Synthesis Completed:", {
				title: synthesizedIdea.title,
				confidenceScore: synthesizedIdea.confidenceScore,
				urgencyLevel: synthesizedIdea.urgencyLevel,
				totalScore: synthesizedIdea.scoring.totalScore,
			});

			return synthesizedIdea;
		} catch (error) {
			console.error("Enhanced IdeaSynthesisAgent error:", error);

			debugLogger.debug("🔄 Using enhanced fallback synthesis data");
			return IdeaSynthesisAgent.createDynamicFallback(context);
		}
	}
}
