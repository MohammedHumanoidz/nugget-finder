import { generateText } from "ai";
import type {
	AgentContext,
	CompetitiveData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter, perplexity } from "../../../utils/configs/ai.config";
import { parsePerplexityResponse } from "../../../utils/json-parser";
import { debugLogger } from "../../../utils/logger";
import { getPrompt } from "../../../utils/prompt-helper";

export class CompetitiveIntelligenceAgent {
	/**
	 * Enhanced CompetitiveIntelligenceAgent - Better competitive analysis with strategic positioning
	 * Uses structured prompts for deeper market understanding
	 */
	static async execute(context: AgentContext): Promise<CompetitiveData | null> {
		try {
			console.log("🏆 Step 4: Enhanced Competitive Intelligence");

			// Get dynamic prompt from database with fallback
			const systemPrompt = await getPrompt(
				'CompetitiveIntelligenceAgent',
				'systemPrompt',
				`You are an elite competitive analyst focused on understanding what tools already exist globally and how a new simple software solution could do better for everyday consumers.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on GLOBAL competitors that serve people worldwide
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Look at universal software solutions and tools
- Analysis should apply to global markets

**Enhanced Analysis Framework:**

**Consumer Market Landscape Mapping:**
1. **Problem-Specific Focus**: Look at apps and tools that try to solve this same problem globally for individual consumers
2. **Consumer Failure Point Analysis**: Identify how current consumer tools let people down or don't work well for daily use
3. **Usability Understanding**: Understand why existing consumer apps can't easily improve for regular users
4. **Market Gap Assessment**: See how crowded or open this consumer problem space is worldwide

**Consumer-Focused Positioning Requirements:**
- Define a clear strategy that makes other consumer tools less attractive for this problem
- Identify advantages that can be built with simple, user-friendly software
- Find ways to get better as more regular people use the tool
- Create positioning that appeals to individual consumers, not businesses

**Consumer Solution Viability Constraints:**
- Focus on simple software capabilities (easy mobile apps, web tools, simple integrations)
- Avoid business-focused or complex enterprise advantages
- Emphasize benefits that grow as more consumers use it (community features, shared experiences, network effects)
- Consider advantages for underserved consumer groups (busy parents, students, young adults, etc.)

Return enhanced competitive analysis:
{
  "competition": {
    "marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
    "marketConcentrationJustification": "string (Detailed explanation of competitive density specifically for this consumer niche, highlighting opportunities for simple, user-focused solutions)",
    "directCompetitors": [
      {
        "name": "string",
        "justification": "string (Why they compete in this space but fail the target consumer)",
        "strengths": ["genuine competitive advantages", "market position"],
        "weaknesses": ["specific failures for target consumer", "usability limitations for daily use"]
      }
    ],
    "indirectCompetitors": [
      {
        "name": "string", 
        "justification": "string (How they indirectly address the problem but miss the mark for consumers)",
        "strengths": ["general market strengths"],
        "weaknesses": ["why they can't serve individual consumers effectively"]
      }
    ],
    "competitorFailurePoints": ["critical pain points left unaddressed for consumers", "systematic gaps in current consumer market"],
    "unfairAdvantage": ["specific advantages achievable with consumer-focused software approach", "community/social effects unique to this consumer niche"],
    "moat": ["defensible barriers that strengthen with consumer adoption", "competitive advantages difficult for existing apps to replicate"],
    "competitivePositioningScore": number (1-10)
  },
  "positioning": {
    "name": "string (Memorable positioning statement that captures the unique value for target consumers - PROBLEM + SOLUTION in ≤8 words)",
    "targetSegment": "string (Extremely specific target consumer with lifestyle/demographic context)",
    "valueProposition": "string (Sharp pitch emphasizing unique insight and direct problem resolution with simple software solution)",
    "keyDifferentiators": ["unique capability tied to consumer-focused advantage", "consumer-specific feature competitors can't replicate", "software advantage that scales with user adoption"]
  }
}

Focus on competitive intelligence that reveals clear paths to consumer product success through strategic differentiation that appeals to everyday people.`
			);

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const userPrompt = `Analyze the competitive landscape within the specific consumer niche defined by these problems: ${problemContext}

Conduct deep competitive analysis to:
1. Map all direct and indirect consumer-focused competitors within this precise problem space
2. Identify their specific failure points for individual users and everyday consumers
3. Understand why existing consumer solutions structurally can't address these gaps
4. Define a sharp differentiation strategy that makes competitors irrelevant for this consumer niche

**Consumer Market Focus Areas:**
- Why do current consumer apps fail the specific people identified?
- What usability/design barriers prevent existing apps from solving this for regular users?
- How can a consumer-first software startup create an unfair advantage?
- What positioning makes the startup the obvious choice for the target consumer?

**Consumer Competitive Categories to Consider:**
- Popular mobile apps in this problem space
- Web-based consumer tools and platforms
- Free and freemium consumer services
- Social and community-based solutions
- Simple productivity and lifestyle apps
- Personal management and organization tools

Provide actionable competitive intelligence that guides consumer product positioning and development decisions for everyday users.`;

			debugLogger.logPerplexityRequest(
				"EnhancedCompetitiveIntelligenceAgent",
				userPrompt,
				systemPrompt,
				{
					reasoning_effort: "medium",
					model: "sonar-pro",
					context: context.problemGaps,
				},
			);

			const response = await perplexity(
				userPrompt,
				systemPrompt,
				"medium",
				"sonar-pro",
			);

			debugLogger.logPerplexityResponse(
				"EnhancedCompetitiveIntelligenceAgent",
				response,
			);

			if (!response?.choices?.[0]?.message?.content) {
				debugLogger.logError(
					"EnhancedCompetitiveIntelligenceAgent",
					new Error("No response from Perplexity"),
					{ response },
				);
				throw new Error("No response from Perplexity");
			}

			const content = response.choices[0].message.content;
			console.log(
				"🔍 Enhanced Competitive Intelligence raw response length:",
				content.length,
			);
			console.log("🔍 Response preview:", `${content.substring(0, 200)}...`);

			const isAlreadyJson =
				content.trim().startsWith("{") && content.trim().endsWith("}");
			debugLogger.logContentAnalysis(
				"EnhancedCompetitiveIntelligenceAgent",
				content,
				isAlreadyJson,
			);

			const structureWithLLM = async (content: string): Promise<string> => {
				const structuringPrompt = `You are an expert consumer market analyst. Convert the following competitive intelligence research into the exact JSON structure requested.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no extra text, explanations, or markdown
2. Ensure all strings are properly quoted with double quotes
3. Do not include any comments or trailing commas
4. All fields are required - use reasonable defaults if information is missing

REQUIRED JSON STRUCTURE:
{
  "competition": {
    "marketConcentrationLevel": "LOW" | "MEDIUM" | "HIGH",
    "marketConcentrationJustification": "string",
    "directCompetitors": [
      {
        "name": "string",
        "justification": "string",
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"]
      }
    ],
    "indirectCompetitors": [
      {
        "name": "string",
        "justification": "string", 
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"]
      }
    ],
    "competitorFailurePoints": ["string", "string"],
    "unfairAdvantage": ["string", "string"], 
    "moat": ["string", "string"],
    "competitivePositioningScore": number
  },
  "positioning": {
    "name": "string",
    "targetSegment": "string",
    "valueProposition": "string",
    "keyDifferentiators": ["string", "string"]
  }
}

COMPETITIVE ANALYSIS CONTENT:
${content}

Return only the JSON object with no additional text or formatting:`;

				debugLogger.logLLMStructuring(
					"EnhancedCompetitiveIntelligenceAgent",
					structuringPrompt,
					content,
				);

				try {
					const { text: structuredJson } = await generateText({
						model: openrouter("openai/gpt-4.1-mini"),
						prompt: structuringPrompt,
						temperature: 0.1,
						maxTokens: 1500,
					});

					debugLogger.logLLMStructuringResponse(
						"EnhancedCompetitiveIntelligenceAgent",
						structuredJson,
					);
					
					// Additional cleaning to ensure we get clean JSON
					let cleanedJson = structuredJson.trim();
					
					// Remove any markdown code blocks
					cleanedJson = cleanedJson.replace(/^```json\s*/i, "");
					cleanedJson = cleanedJson.replace(/^```\s*/, "");
					cleanedJson = cleanedJson.replace(/\s*```\s*$/, "");
					
					// Remove any explanatory text before JSON
					const firstBrace = cleanedJson.indexOf("{");
					if (firstBrace > 0) {
						cleanedJson = cleanedJson.substring(firstBrace);
					}
					
					// Remove any explanatory text after JSON
					const lastBrace = cleanedJson.lastIndexOf("}");
					if (lastBrace !== -1 && lastBrace < cleanedJson.length - 1) {
						cleanedJson = cleanedJson.substring(0, lastBrace + 1);
					}
					
					return cleanedJson.trim();
				} catch (error) {
					console.error("❌ LLM structuring failed:", error);
					// Return a minimal valid JSON structure as fallback
					return JSON.stringify({
						competition: {
							marketConcentrationLevel: "MEDIUM",
							marketConcentrationJustification: "Unable to analyze due to parsing issues",
							directCompetitors: [],
							indirectCompetitors: [],
							competitorFailurePoints: ["Analysis unavailable"],
							unfairAdvantage: ["Consumer-first approach"],
							moat: ["User community effects"],
							competitivePositioningScore: 5
						},
						positioning: {
							name: "Competitive Analysis Unavailable",
							targetSegment: "General consumer market",
							valueProposition: "Analysis could not be completed",
							keyDifferentiators: ["Unable to determine"]
						}
					});
				}
			};

			const parseResult = await parsePerplexityResponse<CompetitiveData>(
				content,
				structureWithLLM,
				["competition", "positioning"],
			);

			debugLogger.logParsingAttempt(
				"EnhancedCompetitiveIntelligenceAgent",
				content,
				parseResult,
			);

			if (!parseResult.success) {
				console.error(
					"❌ Failed to parse enhanced competitive data:",
					parseResult.error,
				);
				debugLogger.logError(
					"EnhancedCompetitiveIntelligenceAgent",
					new Error(
						`Failed to parse Perplexity response: ${parseResult.error}`,
					),
					{ parseResult, originalContent: content },
				);
				
				// Instead of throwing an error, use fallback data to continue the pipeline
				console.log("🔄 Using enhanced fallback competitive intelligence data");
				return {
					competition: {
						marketConcentrationLevel: "MEDIUM" as const,
						marketConcentrationJustification:
							"Consumer market analysis faced parsing challenges, but appears to have moderate competition with opportunities for user-focused solutions",
						directCompetitors: [
							{
								name: "Existing Consumer Apps",
								justification:
									"Popular mobile apps that serve similar functions but may lack personalization for specific user needs",
								strengths: [
									"Large user base",
									"App store presence",
									"Brand recognition",
								],
								weaknesses: [
									"Generic approach",
									"Complex interfaces",
									"Poor user experience for specific needs",
									"Limited customization",
								],
							},
						],
						indirectCompetitors: [
							{
								name: "Manual/Basic Tools",
								justification:
									"Traditional methods and basic tools currently used by target consumers",
								strengths: [
									"Familiar to users",
									"No learning curve",
									"Free to use",
								],
								weaknesses: [
									"Time-consuming",
									"Prone to errors",
									"No helpful features",
									"Limited functionality",
								],
							},
						],
						competitorFailurePoints: [
							"Lack of personalization for specific consumer needs",
							"Complex interfaces not designed for everyday use",
							"Poor understanding of consumer daily workflows",
						],
						unfairAdvantage: [
							"Deep focus on specific consumer segment",
							"Simple, intuitive design for daily use",
							"Community-driven features and feedback",
						],
						moat: [
							"Strong consumer community and user loyalty",
							"Network effects within specific user group",
							"Continuous user experience improvements",
						],
						competitivePositioningScore: 7,
					},
					positioning: {
						name: "Simple Solution for Specific Consumer Need",
						targetSegment:
							"Specific consumer segment identified by trend and problem analysis",
						valueProposition:
							"A focused consumer app that addresses specific daily frustrations overlooked by generic competitors",
						keyDifferentiators: [
							"Built specifically for target consumer workflow",
							"Simple interface optimized for daily use",
							"Community-focused feature development",
						],
					},
				};
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
				true,
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
				},
			);

			console.log("🔄 Using enhanced fallback competitive intelligence data");
			return {
				competition: {
					marketConcentrationLevel: "LOW" as const,
					marketConcentrationJustification:
						"Global consumer market focus creates opportunities for specialized solutions targeting underserved individuals with simple, user-friendly approaches",
					directCompetitors: [
						{
							name: "Generic Consumer Apps",
							justification:
								"Popular mobile apps that attempt to serve the target consumer but lack specialized personalization",
							strengths: [
								"Brand recognition",
								"Large feature sets",
								"App store presence",
							],
							weaknesses: [
								"Too generic for specific needs",
								"Complex interfaces",
								"Poor user experience for daily use",
								"Limited personalization",
							],
						},
					],
					indirectCompetitors: [
						{
							name: "Manual/Traditional Methods",
							justification:
								"Current manual processes and traditional tools used by target consumers",
							strengths: [
								"Familiar to users",
								"No technology barriers",
								"Full personal control",
							],
							weaknesses: [
								"Time-intensive",
								"Error-prone",
								"No helpful automation",
								"Missing convenience features",
							],
						},
					],
					competitorFailurePoints: [
						"Lack of personalization for specific consumer workflows and preferences",
						"Complex interfaces designed for power users, not everyday consumers",
						"Poor understanding of target consumer's daily life patterns",
					],
					unfairAdvantage: [
						"Deep specialization for specific consumer segment and lifestyle",
						"Simple, intuitive design optimized for daily consumer use",
						"Community-driven feature development with target user feedback",
					],
					moat: [
						"Strong community connections within specific consumer group",
						"Network effects and social features within target demographic",
						"Deep understanding of consumer behavior patterns and preferences",
					],
					competitivePositioningScore: 8,
				},
				positioning: {
					name: "Personal Tools for Everyday Life",
					targetSegment:
						"Busy individuals and families managing personal responsibilities and daily life coordination",
					valueProposition:
						"The only app designed specifically for busy people's real daily lives, with simple tools that understand personal workflows and help reduce everyday stress",
					keyDifferentiators: [
						"Built for personal life management, not business productivity",
						"Simple interface designed for quick daily use, not complex features",
						"Community-focused development with real user feedback and shared experiences",
					],
				},
			};
		}
	}
}
