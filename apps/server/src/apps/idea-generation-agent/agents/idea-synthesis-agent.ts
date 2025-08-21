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
import { SafeJsonParser } from "../../../utils/safe-json-parser";
import { SynthesisValidator } from "../../../utils/synthesis-validator";

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

**CRITICAL: CONSUMER TOOL FOCUS**
This MUST be about a simple tool/app that individual people would use daily. NOT about:
- Business operations or restaurant management
- Industry analysis or market research  
- Complex platforms or enterprise solutions
- Academic research or comprehensive studies

**Enhanced Description Format:**
Write like you're explaining a helpful app to a friend. The description should:
- Start with the daily frustration people face
- Explain what the simple tool does to fix it
- Show how it saves time/money/stress for individuals
- Use conversational language anyone understands
- Focus on personal benefits, not business metrics
- Make it sound like something on the App Store

Avoid research language like "analysis explores", "study reveals", "comprehensive examination". Instead use personal language like "people struggle with", "this tool helps you", "saves you time by".

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
- Create concise titles: 6-8 words maximum that tell both problem and solution
- Structure: [What It Does] + [For Whom] + [Key Benefit]
- Use descriptive, friendly language that clearly communicates personal value
- NO business terms: "Operational", "Management", "Analysis", "Platform", "System"
- NO "Automated", "AI-Powered", "Agent", "Smart", or technical prefixes
- NO startup names, company names, or product names
- NO geographic locations or country names
- Examples: "Group Meal Planner That Splits Bills"; "Family Calendar That Actually Works"; "Food Allergy Tracker for Safe Dining"

**CRITICAL DESCRIPTION REQUIREMENTS:**
- Write like you're describing an app to a friend, NOT a business analysis
- Start with the daily frustration: "People waste 30 minutes every day trying to..."
- Explain the simple solution: "This tool fixes that by..."
- Show the personal benefit: "You save time, avoid stress, and never have to..."
- NO section headers like "Trend:", "Problem:", "Solution:"
- NO business jargon: "operational efficiency", "market analysis", "comprehensive"
- NO research language: "study shows", "analysis reveals", "findings indicate"
- Use everyday language: "helps you", "saves time", "makes it easier", "never worry about"
- Maximum 3 sentences that flow naturally together

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
			
			// First try enhanced JSON parser with safe fallback
			let synthesizedIdea: SynthesizedIdea | null = null;

			const parseResult = await SafeJsonParser.parseWithLLMFallback<SynthesizedIdea>(
				text,
				"SynthesizedIdea from idea synthesis agent"
			);

			if (parseResult.success && parseResult.data) {
				synthesizedIdea = parseResult.data;
				debugLogger.debug("✅ Safe JSON parsing successful", {
					usedLLMRepair: parseResult.usedLLMRepair
				});
			} else {
				// Fallback to enhanced parser
				debugLogger.debug("⚠️ Safe JSON parser failed, trying enhanced parser...", {
					parseError: parseResult.error
				});
				const enhancedResult = await EnhancedJsonParser.parseWithFallback<SynthesizedIdea>(
					text,
					["title", "description", "problemStatement", "scoring"],
					dynamicFallback,
				);

				if (enhancedResult.success) {
					synthesizedIdea = enhancedResult.data as SynthesizedIdea;
				} else {
					console.error(
						"❌ Both JSON parsing methods failed:",
						enhancedResult.error,
					);
					synthesizedIdea = dynamicFallback;
				}
			}

			// Validate and correct the synthesized idea
			if (synthesizedIdea && context.problemGaps?.problems) {
				const validation = await SynthesisValidator.validateAndCorrectIdea(
					synthesizedIdea,
					context.problemGaps.problems,
					context.trends
				);

				if (!validation.isValid && validation.correctedIdea) {
					debugLogger.debug("🔧 Applied synthesis corrections:", {
						issues: validation.issues,
						originalTitle: synthesizedIdea.title,
						correctedTitle: validation.correctedIdea.title
					});
					synthesizedIdea = validation.correctedIdea;
				} else if (!validation.isValid) {
					debugLogger.debug("⚠️ Synthesis validation issues (uncorrected):", {
						issues: validation.issues
					});
				}
			}

			// Add WhatToBuild data if available in context
			if (context.whatToBuild) {
				synthesizedIdea.whatToBuild = context.whatToBuild;
			}

			debugLogger.debug("✅ Step 7: Enhanced Idea Synthesis Completed:", {
				title: synthesizedIdea.title,
				confidenceScore: synthesizedIdea.confidenceScore,
				urgencyLevel: synthesizedIdea.urgencyLevel,
				totalScore: synthesizedIdea.scoring?.totalScore || 0,
			});

			return synthesizedIdea;
		} catch (error) {
			console.error("Enhanced IdeaSynthesisAgent error:", error);
			debugLogger.logError("Enhanced IdeaSynthesisAgent", error as Error, {
				context: {
					hasTrends: !!context.trends,
					hasProblems: !!context.problemGaps?.problems,
					hasCompetitive: !!context.competitive
				}
			});

			debugLogger.debug("🔄 Using enhanced fallback synthesis data");
			return IdeaSynthesisAgent.createDynamicFallback(context);
		}
	}
}
