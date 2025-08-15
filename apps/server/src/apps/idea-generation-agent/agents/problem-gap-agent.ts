import { generateText } from "ai";
import type {
	AgentContext,
	ProblemGapData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { debugLogger } from "../../../utils/logger";
import { getPrompt } from "../../../utils/prompt-helper";

export class ProblemGapAgent {
	/**
	 * Enhanced ProblemGapAgent - Uses reasoning-rich prompts from sonar-reasoning model
	 * Identifies 2-3 sharply defined, systemic problems for specific personas
	 */
	static async execute(context: AgentContext): Promise<ProblemGapData | null> {
		try {
			console.log("🎯 Step 3: Enhanced Problem Gap Analysis");

			// Get dynamic prompt from database with fallback
			const systemPromptBase = await getPrompt(
				'ProblemGapAgent',
				'systemPrompt', 
				`You are an elite problem identifier with deep expertise in discovering everyday frustrations that people worldwide face and can be solved with simple software.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on UNIVERSAL problems that people face everywhere
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Target global human behaviors and frustrations
- Solutions should work for people worldwide

**Enhanced Analysis Framework:**

**Problem Identification Criteria:**
1. **Real & Daily**: Problems happening every day, wasting people's time and money
2. **Relatable**: Focus on problems that many people can relate to worldwide
3. **Software-Solvable**: Problems that can be fixed with simple apps, websites, or online tools
4. **Trend-Connected**: Problems that are made worse or newly created by current trends
5. **Clear Impact**: Problems with obvious costs (lost time, wasted money, missed opportunities)

**Consumer-First Problem Focus:**
- Personal time management and daily organization challenges
- Individual money management and spending tracking difficulties
- Family coordination and household management issues
- Personal productivity and goal-setting struggles
- Learning new skills and maintaining hobbies
- Health, wellness, and self-care routine problems
- Social connections and relationship maintenance challenges
- Entertainment choices and leisure activity planning

**Analysis Requirements:**
- Why do current solutions not work well for these people?
- What makes this problem hard to solve right now?
- How does the current trend make this problem worse or more urgent?
- Why are people not getting good help with this problem today?

**Solution Viability Filter:**
- NO physical products, hardware, or complex systems
- NO heavily regulated solutions or complicated legal requirements
- NO complex development or research-heavy projects
- YES to simple apps, websites, online tools, and easy integrations
- YES to web-based, mobile-friendly, or lightweight online services

Return enhanced JSON structure:
{
  "problems": [
    "People spend X hours/week doing manual task Y, wasting $Z because current tools don't work well for this common workflow",
    "Second everyday problem with clear time/money waste and gap in current solutions",
    "Third problem if applicable, same focus on universal human frustrations"
  ],
  "gaps": [
    {
      "title": "string (Clear gap title describing the missing simple software feature)",
      "description": "string (Plain English explanation of why current tools don't solve this common problem well)",
      "impact": "string (Clear time/money waste with simple numbers)",
      "target": "string (Simple description of who faces this problem - no jargon or locations)",
      "opportunity": "string (Simple software solution idea that could fix this gap easily)"
    }
  ]
}

Focus on problems so painful and immediate that the target persona would pay for a solution within their first trial week.`
			);

			// Build the complete system prompt
			const systemPrompt = systemPromptBase;

			const userPrompt = `Based on this validated trend: "${context.trends?.title} - ${context.trends?.description}"

Conduct deep analysis to identify 2-3 specific daily problems that are:
1. Currently happening in people's everyday lives (not future theoretical problems)
2. Costing specific people real time/money/opportunities TODAY
3. Made worse or newly created by this trend
4. Solvable with focused software solutions (simple apps/websites/online tools)
5. Not well-served by existing consumer solutions

**Problem Discovery Focus:**
- Target specific types of people affected by the trend (individuals, families, students, etc.)
- Quantify the daily frustration (hours wasted, money lost, opportunities missed)
- Explain why current apps/tools fail for this specific everyday use case
- Ensure problems lead to simple solutions that people could build and use quickly

**Consumer Problem Categories to Consider:**
- Personal organization and time management
- Individual finance and money tracking
- Family coordination and household tasks
- Personal learning and skill development
- Health, wellness, and self-care routines
- Social connections and relationship building
- Hobby management and creative projects
- Daily decision-making and planning

**Diversity Requirements (avoid these problem spaces):**
${
	context.previousIdeas && context.previousIdeas.length > 0
		? context.previousIdeas
				.map(
					(idea) =>
						`- Avoid: Problems similar to "${
							idea.title
						}" - ${idea.description?.substring(0, 100)}...`,
				)
				.join("\n")
		: "- No restrictions - explore new problem territory"
}

Focus on immediate, specific, personally frustrating problems that create urgent demand for simple software solutions that regular people would actually use and pay for.`;

			// Use sonar-pro for enhanced analysis
			debugLogger.logPerplexityRequest(
				"EnhancedProblemGapAgent",
				userPrompt,
				systemPrompt,
				{
					reasoning_effort: "high", // Enhanced reasoning
					model: "sonar-pro", // Better model for analysis
					context: context.trends,
				},
			);

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"high", // High reasoning effort
				"sonar-pro", // Use pro model
			);

			debugLogger.logPerplexityResponse("EnhancedProblemGapAgent", response);

			if (!response?.choices?.[0]?.message?.content) {
				debugLogger.logError(
					"EnhancedProblemGapAgent",
					new Error("No response from Perplexity"),
					{ response },
				);
				throw new Error("No response from Perplexity");
			}

			const content = response.choices[0].message.content;
			console.log(
				"🔍 Enhanced ProblemGap raw response length:",
				content.length,
			);
			console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

			const isAlreadyJson =
				content.trim().startsWith("{") && content.trim().endsWith("}");
			debugLogger.logContentAnalysis(
				"EnhancedProblemGapAgent",
				content,
				isAlreadyJson,
			);

			const structureWithLLM = async (content: string): Promise<string> => {
				const structuringPrompt = `You are an expert consumer behavior analyst. Convert the following problem and gap analysis into the exact JSON structure.

REQUIRED JSON STRUCTURE:
{
  "problems": ["specific problem 1 with quantified impact", "specific problem 2", "specific problem 3"],
  "gaps": [
    {
      "title": "string",
      "description": "string (why existing solutions fail)",
      "impact": "string (quantified personal impact)",
      "target": "string (specific consumer persona)",
      "opportunity": "string (specific software solution)"
    }
  ]
}

ANALYSIS CONTENT:
${content}

Extract problems and gaps with maximum specificity and personal impact quantification. Return ONLY the JSON object.`;

				debugLogger.logLLMStructuring(
					"EnhancedProblemGapAgent",
					structuringPrompt,
					content,
				);

				const { text: structuredJson } = await generateText({
					model: openrouter("openai/gpt-4.1-mini"),
					prompt: structuringPrompt,
					temperature: 0.1,
					maxTokens: 1000,
				});

				debugLogger.logLLMStructuringResponse(
					"EnhancedProblemGapAgent",
					structuredJson,
				);
				return structuredJson;
			};

			const parseResult = await parsePerplexityResponse<ProblemGapData>(
				content,
				structureWithLLM,
				["problems", "gaps"],
			);

			debugLogger.logParsingAttempt(
				"EnhancedProblemGapAgent",
				content,
				parseResult,
			);

			if (!parseResult.success) {
				console.error(
					"❌ Failed to parse enhanced problem gap data:",
					parseResult.error,
				);
				debugLogger.logError(
					"EnhancedProblemGapAgent",
					new Error(
						`Failed to parse Perplexity response: ${parseResult.error}`,
					),
					{ parseResult, originalContent: content },
				);
				
				// Instead of throwing an error, use fallback data to continue the pipeline
				console.log("🔄 Using enhanced fallback problem gap data");
				return {
					problems: [
						"Busy individuals waste significant time each day trying to keep track of personal tasks, appointments, and goals across different apps and tools",
						"People struggle to maintain healthy habits and routines because they lack simple tools that understand their daily schedules and preferences",
						"Families have difficulty coordinating household activities and sharing responsibilities, leading to missed appointments and duplicated efforts",
					],
					gaps: [
						{
							title: "Personal Life Organization for Busy Individuals",
							description:
								"Current productivity apps are built for work teams, not personal life management, and don't understand how personal tasks connect to daily routines",
							impact:
								"Individuals waste 8-12 hours per week managing scattered personal information and miss important personal commitments",
							target: "Busy working individuals and parents managing personal and family responsibilities",
							opportunity:
								"Simple personal life coordinator that understands daily routines and helps prioritize personal tasks and goals",
						},
						{
							title: "Daily Habit Tracking That Actually Works",
							description:
								"Existing habit trackers focus on streaks and data rather than helping people build sustainable routines that fit their real schedules",
							impact:
								"People abandon 80% of new habits within 6 weeks because tracking tools don't adapt to their changing daily reality",
							target: "Individuals trying to build better daily routines and healthy habits",
							opportunity:
								"Smart habit helper that adapts to real schedules and provides gentle guidance rather than rigid tracking",
						},
					],
				};
			}

			const problemGapData = parseResult.data as ProblemGapData;

			console.log("✅ Step 3: Enhanced Problem Gap Analysis Completed:", {
				problemCount: problemGapData.problems?.length || 0,
				gapCount: problemGapData.gaps?.length || 0,
			});

			debugLogger.logAgentResult(
				"EnhancedProblemGapAgent",
				problemGapData,
				true,
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
					"Busy parents spend 10+ hours weekly coordinating family activities and household tasks, often missing important events or double-booking because current calendar apps don't understand family workflows",
					"Young adults waste 6+ hours weekly manually tracking personal expenses across multiple apps and accounts, losing money on forgotten subscriptions and overspending because budgeting tools are too complex for daily use",
					"Students and professionals struggle to maintain learning goals and skill development, abandoning 70% of courses or projects within 4 weeks because progress tracking tools don't fit into busy daily schedules",
				],
				gaps: [
					{
						title: "Family Activity Coordination That Actually Works",
						description:
							"Current calendar and organization apps are designed for individual use or business teams, not family coordination with multiple schedules, responsibilities, and changing priorities",
						impact:
							"Families miss 15-20% of important activities and waste 8+ hours weekly on coordination, creating stress and missed opportunities",
						target:
							"Busy parents and families managing multiple schedules and household responsibilities",
						opportunity:
							"Family-first coordination app that understands household workflows, shared responsibilities, and helps families stay connected and organized",
					},
					{
						title: "Simple Money Tracking for Everyday Spending",
						description:
							"Personal finance apps either require complex setup or focus on investment tracking rather than helping people understand and improve their daily spending habits",
						impact:
							"Individuals overspend by $200-500 monthly and lose track of $50-100 in forgotten subscriptions because tracking is too complicated",
						target:
							"Young adults and busy individuals who want to improve spending habits without complex financial planning",
						opportunity:
							"Effortless expense tracking that learns spending patterns and provides simple insights and gentle nudges for better money decisions",
					},
				],
			};
		}
	}
}
