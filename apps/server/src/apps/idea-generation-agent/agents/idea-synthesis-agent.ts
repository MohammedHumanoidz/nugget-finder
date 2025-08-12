import { generateText } from "ai";
import type {
	AgentContext,
	SynthesizedIdea,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

export class IdeaSynthesisAgent {
	/**
	 * Enhanced IdeaSynthesisAgent - Uses Trend Architect logic with critic feedback
	 * Implements markdown-style output format and strategic refinement
	 */
	static async execute(
		context: AgentContext,
		refinementPrompt?: string,
	): Promise<SynthesizedIdea | null> {
		try {
			console.log(
				"🧠 Step 7: Enhanced Idea Synthesis with Trend Architect Logic",
			);

			const trendArchitectPrompt = `You are the Trend Architect - a world-class startup idea synthesizer who transforms market research into compelling, immediately actionable business opportunities. Your expertise lies in combining trend analysis, problem identification, and competitive intelligence into cohesive startup concepts that feel inevitable and urgent.

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

Create a consumer idea so compelling that it becomes impossible to ignore - the kind of personal tool that makes everything else feel like a hassle.`;

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
							"Family Task Manager That Actually Works for Busy Households",
						description:
							"Modern families are busier than ever, with parents juggling work, kids' activities, household responsibilities, and personal goals all at once. The rise of dual-career families and packed schedules has created a daily coordination nightmare that existing tools simply don't solve. Busy parents waste 8-12 hours weekly trying to keep track of who's picking up which kid, when appointments are scheduled, and what household tasks need to be done. Current calendar apps are built for individual work schedules, not family life where one person's sick day affects everyone's week, or where soccer practice timing impacts dinner plans. Online parent communities are filled with frustration about missed appointments, double-booked activities, and the mental load of managing family logistics. A family coordination tool designed specifically for household workflows, with features that understand how family responsibilities interconnect and help parents stay organized without the complexity of business productivity tools, would capture this underserved market of stressed families looking for simple solutions to daily chaos.",
						executiveSummary:
							"A family-focused coordination app designed specifically for busy households, solving the daily logistics nightmare that affects millions of parents worldwide.",
						problemSolution:
							"Busy families waste 8-12 hours weekly coordinating schedules and household tasks across multiple disconnected apps. This tool centralizes family coordination with features built for household workflows, saving 6+ hours weekly.",
						problemStatement:
							"Busy families struggle to coordinate schedules, tasks, and responsibilities, leading to missed appointments and daily stress.",
						innovationLevel: 7.8,
						timeToMarket: 5,
						confidenceScore: 8.6,
						narrativeHook: "Finally, a family organizer that gets how families actually work",
						targetKeywords: [
							"family organization",
							"household management",
							"parent coordination",
						],
						urgencyLevel: 8.7,
						executionComplexity: 6.5,
						tags: ["Consumer", "Family-Life", "Organization", "Lifestyle"],
						scoring: {
							totalScore: 8.2,
							problemSeverity: 8.8,
							founderMarketFit: 8.0,
							technicalFeasibility: 8.5,
							monetizationPotential: 8.3,
							urgencyScore: 8.7,
							marketTimingScore: 8.4,
							executionDifficulty: 6.5,
							moatStrength: 7.9,
							regulatoryRisk: 3.0,
						},
						executionPlan:
							"Build MVP with core family calendar and task coordination features, launch beta with 100 busy families recruited through parenting communities.",
						tractionSignals:
							"Achieve 500 family sign-ups with 70% weekly active usage within 3 months, families report saving 4+ hours weekly.",
						frameworkFit:
							"Consumer-first approach targeting underserved family market with specialized workflow solutions.",
					},
				);

			if (!parseResult.success) {
				console.error(
					"❌ Enhanced Idea Synthesis JSON parsing failed:",
					parseResult.error,
				);
				console.log(
					"📝 Original response:",
					parseResult.originalText?.substring(0, 500),
				);
				if (parseResult.cleanedText) {
					console.log(
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
				title:
					"Personal Budget Tracker That Actually Helps You Save Money",
				description:
					"Young adults and busy individuals worldwide are struggling more than ever to understand where their money goes each month. With the rise of subscription services, digital payments, and complex spending patterns, people lose track of $200-500 monthly in unnecessary expenses and forgotten subscriptions. Current budgeting apps are either too complex for daily use or focus on investment tracking rather than helping people understand and improve their everyday spending habits. Social media discussions among young adults consistently highlight frustration with overspending, surprise subscription charges, and feeling out of control with personal finances. A simple expense tracking tool that automatically categorizes spending, identifies unnecessary subscriptions, and provides gentle nudges for better money decisions would serve the millions of people who want to improve their financial habits without complex financial planning. The solution focuses on immediate spending awareness and small daily improvements rather than overwhelming users with complex budgeting frameworks they won't stick to.",
				executiveSummary:
					"A simple expense tracking app designed specifically for young adults and busy individuals who want to understand and improve their daily spending habits without complex financial planning.",
				problemSolution:
					"People lose track of $200-500 monthly in unnecessary expenses and forgotten subscriptions because current budgeting tools are too complex for daily use. This tool provides effortless expense tracking with simple insights and gentle nudges for better money decisions.",
				problemStatement:
					"Young adults and busy individuals struggle to track daily expenses and end up overspending on unnecessary items and forgotten subscriptions.",
				innovationLevel: 7.9,
				timeToMarket: 4,
				confidenceScore: 8.4,
				narrativeHook: "See where your money really goes and save without effort",
				targetKeywords: [
					"personal finance",
					"expense tracking",
					"money saving",
					"young adults",
				],
				urgencyLevel: 8.5,
				executionComplexity: 6.8,
				tags: ["Consumer", "Personal-Finance", "Money-Management", "Lifestyle"],
				scoring: {
					totalScore: 8.1,
					problemSeverity: 8.6,
					founderMarketFit: 7.8,
					technicalFeasibility: 8.3,
					monetizationPotential: 8.5,
					urgencyScore: 8.5,
					marketTimingScore: 8.2,
					executionDifficulty: 6.8,
					moatStrength: 7.7,
					regulatoryRisk: 4.2,
				},
				executionPlan:
					"Build MVP with bank connection, automatic categorization, and simple spending insights. Launch beta with 200 users recruited through personal finance social media communities. Add subscription tracking and savings recommendations in month 3.",
				tractionSignals:
					"Achieve 1000 user sign-ups with 60% monthly active usage, users report saving $100+ monthly within 6 weeks, 40% of beta users upgrade to paid features.",
				frameworkFit:
					"This follows the 'Consumer-First Simplification' framework by providing essential money management tools that prioritize ease-of-use and immediate value over complex features that users abandon.",
			};
		}
	}
}
