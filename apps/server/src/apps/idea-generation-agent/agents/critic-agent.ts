import { generateText } from "ai";
import type {
	AgentContext,
	SynthesizedIdea,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { getPrompt } from "../../../utils/prompt-helper";

export class CriticAgent {
	/**
	 * Critic Agent - Silent critic that analyzes generated ideas and creates refinement prompts
	 * Uses advanced reasoning to critique and improve idea quality
	 */
	static async execute(
		ideas: SynthesizedIdea[],
		context: AgentContext,
	): Promise<string | null> {
		try {
			console.log("🔍 Step 6: Activating Critic Agent");

			// Get dynamic prompt from database with fallback
			const criticPrompt = await getPrompt(
				'CriticAgent',
				'systemPrompt',
				`You are a world-class startup critic and strategic advisor with deep expertise in evaluating early-stage business opportunities. Your role is to conduct a silent, comprehensive critique of generated startup ideas and create targeted refinement recommendations.

**Critique Framework:**

**Idea Quality Assessment:**
1. **Market Opportunity**: Is the market real, urgent, and sizeable enough for venture success?
2. **Problem-Solution Fit**: Does the solution genuinely address the identified problem for the specific persona?
3. **Execution Feasibility**: Can this realistically be built and launched by a small team within 6 months?
4. **Competitive Advantage**: Are the differentiators strong enough to create lasting value?
5. **Business Model Viability**: Will the target persona actually pay for this solution?

**Strategic Weaknesses to Identify:**
- Overly broad or vague targeting that reduces focus
- Solutions that are "nice to have" rather than "must have"
- Competitive advantages that can be easily replicated
- Business models that don't align with target persona behavior
- Technical complexity that exceeds startup execution capacity

**Refinement Areas:**
- Persona specificity and pain point clarity
- Solution uniqueness and defensibility
- Go-to-market strategy optimization
- Revenue model alignment with user value
- Execution roadmap realism

**Input Ideas for Critique:**
${ideas
	.map(
		(idea, idx) => `
Idea ${idx + 1}: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problemStatement}
Target Keywords: ${idea.targetKeywords.join(", ")}
Execution Complexity: ${idea.executionComplexity}/10
Confidence Score: ${idea.confidenceScore}/10
Narrative Hook: ${idea.narrativeHook}
`,
	)
	.join("\n")}

**Context Information:**
- Research Theme: ${context.trends?.title}
- Market Focus: Global market opportunities
- Competitive Landscape: ${context.competitive?.competition.marketConcentrationLevel} concentration

Conduct a thorough critique focusing on the most critical weaknesses that could prevent startup success. Generate specific, actionable refinement recommendations that will strengthen the ideas while maintaining their core viability.

Return a focused refinement prompt that addresses the most important improvements needed:`
			);

			// Build the complete critic prompt with context
			const fullCriticPrompt = `${criticPrompt}

**Context Information:**
- Research Theme: ${context.trends?.title}
- Market Focus: Global market opportunities
- Competitive Landscape: ${context.competitive?.competition.marketConcentrationLevel} concentration

Conduct a thorough critique focusing on the most critical weaknesses that could prevent startup success. Generate specific, actionable refinement recommendations that will strengthen the ideas while maintaining their core viability.

Return a focused refinement prompt that addresses the most important improvements needed:`;

			const { text: refinementPrompt } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: fullCriticPrompt,
				temperature: 0.2,
				maxTokens: 800,
			});

			console.log(
				"✅ Step 6: Critic Agent Generated Refinement Recommendations",
			);
			console.log(
				"🔍 Refinement focus areas identified:",
				refinementPrompt.substring(0, 200) + "...",
			);

			return refinementPrompt;
		} catch (error) {
			console.error("Critic Agent error:", error);
			return null;
		}
	}
}
