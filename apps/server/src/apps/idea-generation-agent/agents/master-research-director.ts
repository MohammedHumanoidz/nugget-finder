import { generateText } from "ai";
import type { AgentContext } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

// Interface for Master Research Director
interface ResearchDirectorData {
	researchTheme: string;
	globalMarketFocus: string;
	industryRotation: string;
	diversityMandates: string[];
	researchApproach: string;
}

export class MasterResearchDirector {
	/**
	 * Master Research Director - Creates diverse research themes per day
	 * Influences trend research with rotating diversity across industry + geography
	 */
	static async execute(
		context: AgentContext,
	): Promise<ResearchDirectorData | null> {
		try {
			console.log("🎯 Step 1: Activating Master Research Director");

			// Check if this is user-driven or daily automatic generation
			const isUserDriven =
				context.userPrompt && context.userPrompt.trim().length > 0;

			const directorPrompt = isUserDriven
				? `You are the Master Research Director for a world-class startup opportunity discovery system. You are responding to a specific user inquiry to generate high-leverage, globally relevant, and software-first business ideas based on their request.
    
    **User's Request:** "${context.userPrompt}"
    
    **Core Mission:** Generate a forward-looking research theme that directly responds to the user's prompt and enables the discovery of scalable, globally applicable digital opportunities. Prioritize ideas that are not tied to any single region or geography and lean into revolutionary approaches, including the use of agentic systems, automation, and intelligent orchestration.
    
    **USER-FOCUSED RESEARCH STRATEGY:** Based on the user's prompt, you should:
    - Extract the core domain, industry, or problem space they are interested in
    - Identify their potential expertise level or background (if implied)
    - Focus research on practical, actionable software-first opportunities
    - Consider both B2B and B2C use cases that could emerge from their context
    - Explore novel and transformative technologies (agents, APIs, LLMs, orchestration tools, composability, etc.)
    - Emphasize ideas that scale globally without localization
    - Avoid region-locked business models or geo-specific regulatory barriers
    
    Return this exact JSON structure:
    {
      "researchTheme": "string (Tailored research direction based on user's prompt, e.g., 'Agentic Tools for Creative Professionals' or 'Autonomous Finance Optimization for Remote Workers')",
      "globalMarketFocus": "Global Digital Market",
      "industryRotation": "string (Industry or vertical that aligns with user's interest and background)",
      "diversityMandates": [
        "mandate 1: explore only globally relevant, non-region-specific problems",
        "mandate 2: align with the user's apparent expertise level and intent",
        "mandate 3: prioritize agentic, composable, or software-first solutions over traditional models"
      ],
      "researchApproach": "string (Where and how to conduct research—e.g., explore niche forums, open-source repositories, X/Twitter expert discussions, startup job boards, and bleeding-edge API tooling ecosystems)"
    }
    
    **User Context Analysis:** Analyze the user's request to understand:
    - Their domain interest or problem area
    - Their likely expertise level (technical, business, hybrid)
    - Their inclination toward innovation vs improvement
    - The global scalability and software nature of solutions that match
    `
				: `You are the Master Research Director for a world-class startup opportunity discovery system. Your role is to define today's research direction to discover truly novel, diverse, and globally scalable startup opportunities.
    
    **Core Mission:** Generate a research theme that maximizes diversity from previously generated ideas and aligns with agentic, software-first, high-potential innovation. Reject all region-specific constraints. Focus only on universal problems or technologies.
    
    **DIVERSITY & INNOVATION ENFORCEMENT:** You MUST choose a direction that contrasts prior research along multiple dimensions:
    - Industry/vertical (change sector entirely)
    - Target demographic (new users or contexts)
    - Business model (e.g., B2B vs B2C vs Infra vs Tools vs AI-native)
    - Technology paradigm (e.g., agents, real-time systems, embedded AI, composability)
    - Complexity or scale (e.g., micro vs massive platforms)
    
    **GLOBAL DIGITAL STRATEGY:** Focus on:
    - **Agentic Systems & Autonomy:** Agent orchestration, multi-agent collaboration, memory-augmented tools
    - **Composable Tech:** API-first, no-code extensibility, plug-and-play architectures
    - **Universal Problems:** Productivity, overload, education, health, finance
    - **Creator, Developer & Operator Tools:** Platforms for building, scaling, and automating
    - **Post-LLM Innovation:** Tools that leverage LLMs not just for output, but reasoning, delegation, and ecosystem logic
    
    Return this exact JSON structure:
    {
      "researchTheme": "string (e.g., 'Agentic Automation Platforms for Fractional Finance Teams' or 'Composable Learning Agents for Rapid Skill Acquisition')",
      "globalMarketFocus": "Global Digital Market",
      "industryRotation": "string (Choose a novel vertical diverging from previous patterns, preferably tech-forward)",
      "diversityMandates": [
        "mandate 1: avoid region-specific or compliance-bound domains",
        "mandate 2: focus on entirely new problem domains and user types",
        "mandate 3: prioritize revolutionary business models or agentic systems"
      ],
      "researchApproach": "string (Research should tap into future-of-work communities, open-source LLM projects, API marketplaces, developer ecosystem trends, and research papers on AI agents and orchestration)"
    }
    
    **Previous Research Context (MUST AVOID THESE):**
    ${
			context.previousIdeas && context.previousIdeas.length > 0
				? context.previousIdeas
						.map(
							(idea, idx) =>
								`${idx + 1}. "${idea.title}" - Industry: ${MasterResearchDirector.extractIndustry(
									idea.description,
								)}, Target: ${MasterResearchDirector.extractTarget(idea.description)}`,
						)
						.join("\n")
				: "No previous ideas - explore high-potential digital systems with maximum global relevance, especially in emerging tech ecosystems like agentic workflows, composable infra, AI-native collaboration tools."
		}
    
    Today's theme must open a fresh frontier. Focus on software-native innovation, composability, and universal access—not local or niche constraints.
    `;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: directorPrompt,
				temperature: 0.3,
				maxTokens: 600,
			});

			// Use enhanced JSON parser to handle markdown code blocks and formatting issues
			const parseResult =
				await EnhancedJsonParser.parseWithFallback<ResearchDirectorData>(
					text,
					["researchTheme", "globalMarketFocus", "industryRotation"],
					{
						researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
						globalMarketFocus: "Global Digital Market",
						industryRotation: "Developer Productivity and AI Infrastructure",
						diversityMandates: [
							"Avoid consumer social apps",
							"Target software developers and engineering teams",
							"Explore B2B SaaS models for deep tech",
						],
						researchApproach:
							"Focus on developer communities, open-source trends, and AI research papers",
					},
				);

			if (!parseResult.success) {
				console.error(
					"❌ Master Research Director JSON parsing failed:",
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

			const directorData = parseResult.data as ResearchDirectorData;

			console.log("✅ Step 1: Research Director Set Research Parameters:", {
				theme: directorData.researchTheme,
				geography: directorData.globalMarketFocus,
				industry: directorData.industryRotation,
			});

			return directorData;
		} catch (error) {
			console.error("Master Research Director error:", error);
			// Return fallback research direction
			return {
				researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
				globalMarketFocus: "Global Digital Market",
				industryRotation: "Developer Productivity and AI Infrastructure",
				diversityMandates: [
					"Avoid consumer social apps",
					"Target software developers and engineering teams",
					"Explore B2B SaaS models for deep tech",
				],
				researchApproach:
					"Focus on developer communities, open-source trends, and AI research papers",
			};
		}
	}

	// Helper functions for extracting patterns from previous ideas
	static extractIndustry(description: string): string {
		const industryKeywords = {
			enterprise: ["enterprise", "corporate", "large business"],
			smb: ["small business", "SMB", "local business"],
			consumer: ["consumer", "individual", "personal"],
			creator: ["creator", "artist", "content"],
			healthcare: ["health", "medical", "wellness"],
			fintech: ["finance", "payment", "banking"],
			edtech: ["education", "learning", "student"],
			ai: ["AI", "artificial intelligence", "machine learning"],
			developer_tools: ["developer", "coding", "API", "toolchain"],
			web3: ["blockchain", "decentralized", "crypto"],
			climate_tech: ["climate", "sustainability", "environmental"],
		};

		for (const [industry, keywords] of Object.entries(industryKeywords)) {
			if (
				keywords.some((keyword) => description.toLowerCase().includes(keyword))
			) {
				return industry;
			}
		}
		return "general";
	}

	static extractTarget(description: string): string {
		const targetKeywords = {
			enterprise: ["enterprise", "corporation", "large company"],
			smb: ["small business", "SMB", "local shop"],
			individual: ["individual", "personal", "consumer"],
			professional: ["professional", "freelancer", "consultant"],
			creator: ["creator", "artist", "influencer"],
			developer: ["developer", "engineer", "programmer"],
			scientist: ["scientist", "researcher", "analyst"],
		};

		for (const [target, keywords] of Object.entries(targetKeywords)) {
			if (
				keywords.some((keyword) => description.toLowerCase().includes(keyword))
			) {
				return target;
			}
		}
		return "general";
	}
}

export type { ResearchDirectorData };
