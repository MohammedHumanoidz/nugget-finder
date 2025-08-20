/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { generateText } from "ai";
import type { AgentContext } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";
import { getPrompt } from "../../../utils/prompt-helper";

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

			// Get dynamic prompt from database with fallback
			const basePrompt = await getPrompt(
				'MasterResearchDirector', 
				'systemPrompt',
				`You are the Master Research Director for a world-class startup opportunity discovery system. You help guide research direction to ensure diverse, high-quality startup opportunities.`
			);

			const directorPrompt = isUserDriven
				? `${basePrompt} You are responding to a specific user inquiry to generate practical, globally relevant, and software-first business ideas based on their request.
    
    **User's Request:** "${context.userPrompt}"
    
    **Core Mission:** Generate a forward-looking research theme that directly responds to the user's prompt and enables the discovery of scalable, globally applicable digital opportunities. Prioritize ideas that are not tied to any single region or geography and focus on simple, easy-to-understand solutions.
    
    **USER-FOCUSED RESEARCH STRATEGY:** Based on the user's prompt, you should:
    - Extract the core domain, industry, or problem space they are interested in
    - Identify their potential expertise level or background (if implied)
    - Focus research on practical, actionable software-first opportunities
    - Consider both individual consumer and business use cases that could emerge from their context
    - Explore helpful and accessible technologies (mobile apps, web platforms, simple tools)
    - Emphasize ideas that scale globally without localization
    - Avoid region-locked business models or geo-specific regulatory barriers
    
    Return this exact JSON structure:
    {
      "researchTheme": "string (Tailored research direction based on user's prompt, e.g., 'Personal Productivity Tools for Busy Families' or 'Simple Finance Management for Young Adults')",
      "globalMarketFocus": "Global Digital Market",
      "industryRotation": "string (Industry or vertical that aligns with user's interest and background)",
      "diversityMandates": [
        "mandate 1: explore only globally relevant, non-region-specific problems",
        "mandate 2: align with the user's apparent expertise level and intent",
        "mandate 3: prioritize simple, easy-to-use software solutions over complex systems"
      ],
      "researchApproach": "string (Where and how to conduct research—e.g., explore social media discussions, online communities, app store reviews, consumer forums, and popular software trends)"
    }
    
    **User Context Analysis:** Analyze the user's request to understand:
    - Their domain interest or problem area
    - Their likely expertise level (technical, business, hybrid)
    - Their inclination toward innovation vs improvement
    - The global scalability and software nature of solutions that match
    `
				: `You are the Master Research Director for a world-class startup opportunity discovery system. Your role is to define today's research direction to discover truly novel, diverse, and globally scalable startup opportunities.
    
    **Core Mission:** Generate a research theme that maximizes diversity from previously generated ideas and focuses on simple, software-first, high-potential innovation. Reject all region-specific constraints. Focus only on universal problems or technologies that people everywhere can relate to.
    
    **DIVERSITY & INNOVATION ENFORCEMENT:** You MUST choose a direction that contrasts prior research along multiple dimensions:
    - Industry/vertical (change sector entirely)
    - Target demographic (new users or contexts - individuals, families, students, professionals, hobbyists)
    - Business model (e.g., individual consumers vs small businesses vs creative professionals vs students)
    - Technology approach (e.g., mobile apps, web platforms, simple tools, community platforms)
    - Complexity or scale (e.g., personal tools vs collaborative platforms)
    
    **GLOBAL DIGITAL STRATEGY:** Focus on:
    - **Personal Productivity & Lifestyle:** Daily life management, personal organization, hobby tracking
    - **Simple Helper Tools:** Easy-to-use platforms that solve common frustrations
    - **Universal Problems:** Time management, personal finance, learning, health, creativity, relationships
    - **Consumer & Creator Tools:** Platforms for personal use, family coordination, hobby management
    - **Accessible Innovation:** Tools that use technology to make daily life easier, not more complex
    
    Return this exact JSON structure:
    {
      "researchTheme": "string (e.g., 'Personal Finance Tools for Young Adults' or 'Family Coordination Platforms for Busy Parents')",
      "globalMarketFocus": "Global Digital Market",
      "industryRotation": "string (Choose a consumer-friendly vertical, preferably focused on individual users)",
      "diversityMandates": [
        "mandate 1: avoid region-specific or compliance-bound domains",
        "mandate 2: focus on entirely new problem domains and user types",
        "mandate 3: prioritize simple, user-friendly solutions over complex business systems"
      ],
      "researchApproach": "string (Research should tap into consumer communities, social media discussions, app store feedback, lifestyle forums, and popular consumer software trends)"
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
				: "No previous ideas - explore high-potential digital systems with maximum global relevance, especially in consumer-friendly technology like personal productivity tools, family management apps, hobby platforms."
		}
    
    **CRITICAL B2C vs B2B BALANCING:**
    ${
			context.previousIdeas && context.previousIdeas.length > 0
				? MasterResearchDirector.determineFocusBalance(context.previousIdeas)
				: "Start with consumer-focused research themes targeting individual users and their daily life problems."
		}
    
    Today's theme must open a fresh frontier. Focus on software-native innovation that makes life easier and more enjoyable for real people. No complex or niche business constraints.
    `;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: directorPrompt,
				temperature: 0.3,
				maxOutputTokens: 600,
			});

			// Use enhanced JSON parser to handle markdown code blocks and formatting issues
			const parseResult =
				await EnhancedJsonParser.parseWithFallback<ResearchDirectorData>(
					text,
					["researchTheme", "globalMarketFocus", "industryRotation"],
					{
						researchTheme: "Personal Productivity Tools for Busy Individuals",
						globalMarketFocus: "Global Digital Market",
						industryRotation: "Consumer Productivity and Lifestyle Management",
						diversityMandates: [
							"Avoid complex business apps",
							"Target individual consumers and families",
							"Explore simple software solutions for daily life",
						],
						researchApproach:
							"Focus on consumer communities, lifestyle forums, and personal productivity trends",
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
				researchTheme: "Personal Productivity Tools for Busy Individuals",
				globalMarketFocus: "Global Digital Market",
				industryRotation: "Consumer Productivity and Lifestyle Management",
				diversityMandates: [
					"Avoid complex business apps",
					"Target individual consumers and families",
					"Explore simple software solutions for daily life",
				],
				researchApproach:
					"Focus on consumer communities, lifestyle forums, and personal productivity trends",
			};
		}
	}

	// Helper function to determine B2C vs B2B focus balance
	static determineFocusBalance(previousIdeas: any[]): string {
		const businessFocusKeywords = ["enterprise", "business", "team", "company", "organization", "SMB", "startup", "professional"];
		const consumerFocusKeywords = ["personal", "individual", "family", "student", "hobby", "lifestyle", "daily"];
		
		let businessCount = 0;
		let consumerCount = 0;
		
		for (const idea of previousIdeas) {
			const ideaText = `${idea.title} ${idea.description}`.toLowerCase();
			
			if (businessFocusKeywords.some(keyword => ideaText.includes(keyword))) {
				businessCount++;
			}
			if (consumerFocusKeywords.some(keyword => ideaText.includes(keyword))) {
				consumerCount++;
			}
		}
		
		if (businessCount > consumerCount) {
			return "Previous ideas were business-focused. TODAY'S THEME MUST BE CONSUMER-FOCUSED (B2C): Target individual people, families, students, hobbyists, or personal use cases.";
		}
		if (consumerCount > businessCount) {
			return "Previous ideas were consumer-focused. TODAY'S THEME SHOULD CONSIDER BUSINESS APPLICATIONS: Target small businesses, teams, or professional use cases, but keep it simple and accessible.";
		}
		return "Previous ideas were balanced. Focus on whichever approach (consumer or business) creates the most compelling opportunities for today's research theme.";
	}

	// Helper functions for extracting patterns from previous ideas
	static extractIndustry(description: string): string {
		const industryKeywords = {
			consumer: ["personal", "individual", "family", "lifestyle", "daily", "hobby"],
			enterprise: ["enterprise", "corporate", "large business"],
			smb: ["small business", "SMB", "local business"],
			creator: ["creator", "artist", "content"],
			healthcare: ["health", "medical", "wellness"],
			fintech: ["finance", "payment", "banking", "money"],
			edtech: ["education", "learning", "student"],
			productivity: ["productivity", "organization", "task", "time"],
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
			individual: ["individual", "personal", "consumer", "people", "person"],
			family: ["family", "parent", "household", "kids"],
			student: ["student", "learner", "education"],
			enterprise: ["enterprise", "corporation", "large company"],
			smb: ["small business", "SMB", "local shop"],
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
