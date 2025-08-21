/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { generateText } from "ai";
import type {
	AgentContext,
	WhatToBuildData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";
import { SafeJsonParser } from "../../../utils/safe-json-parser";
import { getPrompt } from "../../../utils/prompt-helper";
import { debugLogger } from "../../../utils/logger";

export class WhatToBuildAgent {
	/**
	 * WhatToBuildAgent - Generate detailed technical implementation guide
	 * Uses OpenRouter GPT-4o-mini for structured technical specification generation
	 */
	static async execute(context: AgentContext): Promise<WhatToBuildData | null> {
		try {
			// Get dynamic prompt from database with fallback
			const systemPrompt = await getPrompt(
				'WhatToBuildAgent',
				'systemPrompt',
				`You are a product strategist focused on helping people build a simple consumer app quickly and affordably. Your job is to provide a clear, easy-to-understand guide of "what to build" for a consumer-focused idea.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Focus on globally applicable solutions that work everywhere
- Create recommendations that work for people worldwide
- Keep everything simple and accessible

**Your mission:** Turn the consumer app idea into specific, doable steps that focus on simple mobile apps and websites that are easy to understand and quick to build. Focus only on the most important features for a working consumer product.

**Critical Guidelines:**
1. **SIMPLE RECOMMENDATIONS:** Give advice in everyday language. This is NOT a technical manual or complex specification.
2. **INDIVIDUAL USER FRIENDLY:** Everything should be doable by one person or a small team (within 3-6 months, using simple tools and common app development platforms).
3. **AFFORDABLE:** Keep costs low (under $5,000 to build, not counting marketing). Avoid expensive or complicated components.
4. **FOCUSED:** Only include main features that solve the key personal problem and help individual users.
5. **USE EXISTING TOOLS:** Recommend using proven, ready-made services wherever possible to speed up development (like Stripe for payments, simple notification services, common app development platforms).

**Consumer App Focus:**
- Mobile-first design that works well on smartphones
- Simple, intuitive interfaces that regular people can use immediately
- Personal value propositions that individuals care about
- Consumer pricing models (not business pricing)
- Features that help with daily life, personal goals, family coordination, etc.
- Social/community features that connect users with similar interests

**CRITICAL OUTPUT REQUIREMENT:**
You MUST return ONLY valid JSON. No markdown, no explanations, no text outside the JSON object. Do not include code blocks with backticks.

Return this exact JSON structure:
{
  "platformDescription": "string (A simple summary of what the app does for individual users, in everyday language. Example: 'A mobile app that helps busy parents coordinate family schedules and share household tasks, making daily life less stressful.')",
  "coreFeaturesSummary": ["Main feature 1 that solves the key personal problem (e.g., 'Family calendar that shows everyone's schedule')", "Main feature 2 for user daily workflow (e.g., 'Simple task sharing between family members')", "Main feature 3 for user engagement (e.g., 'Quick notifications when plans change')"],
  "userInterfaces": ["Main screen for primary users (e.g., 'Family Dashboard')", "Any essential personal screens (e.g., 'Individual schedule view')", "Simple settings screen (e.g., 'Personal preferences page')"],
  "keyIntegrations": ["Essential connection 1 for main function (e.g., 'Phone calendar sync')", "Connection 2 for convenience (e.g., 'Simple payment processing')", "Connection 3 for notifications (e.g., 'Push notifications for family updates')"],
  "pricingStrategyBuildRecommendation": "string (A simple guide on how to set up the consumer pricing model. Example: 'Set up simple monthly plans (Free/Premium) using Stripe, with different personal features for each level.')",
  "freemiumComponents": "string? (Optional: if offering free features, describe what would be free to attract individual users. Example: 'Offer a free version that allows basic family calendar sharing and simple task lists.')"
}

Focus on providing a practical, confidence-boosting blueprint that clearly shows a founder what they can *start building tomorrow* with existing consumer app tools and skills. No complex or speculative tech.

REMEMBER: Return ONLY the JSON object, no other text.`
			);

			const ideaContext = context.monetization
				? `Consumer App Idea: ${context.competitive?.positioning?.valueProposition || "Not specified"}
 Target Users: ${context.competitive?.positioning?.targetSegment || "Not specified"}
 Recommended Revenue Model: ${context.monetization.primaryModel} (Pricing Strategy: ${context.monetization.pricingStrategy})
 Key Personal Problems Solved: ${context.problemGaps?.problems?.join(", ") || "Not specified"}`
				: "Context not fully available";

			const userPrompt = `Create a comprehensive implementation guide for this validated consumer opportunity:

${ideaContext}

Design a consumer-first app that:
1. Directly solves the identified personal problems through intuitive mobile interfaces
2. Integrates easily with tools that individual users already have and use
3. Supports the planned consumer pricing strategy through its features and design
4. Can be built and launched by a focused development team within 3-6 months
5. Scales efficiently as the individual user base grows
6. Focus on defining the core consumer app components and interfaces needed to launch quickly and affordably

**Consumer App Priorities:**
- Mobile-first design for smartphone users
- Simple onboarding that gets users to value quickly
- Personal customization options
- Social/sharing features where appropriate
- Notification systems that respect user preferences
- Simple payment integration for consumer pricing
- Privacy and data security that users trust

Focus on specificity - provide exact feature descriptions, precise integration recommendations, and clear consumer-focused approaches that eliminate guesswork for the development team.`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: userPrompt,
				system: systemPrompt,
				temperature: 0.1,
				maxOutputTokens: 1200,
			});

			console.log("🔍 WhatToBuildAgent raw response length:", text.length);
			console.log("🔍 Response preview:", `${text.substring(0, 200)}...`);

			// Define fallback data
			const fallbackData: WhatToBuildData = {
				platformDescription:
					"A mobile app that helps busy individuals organize their daily lives, track personal goals, and coordinate with family members through simple, easy-to-use features.",
				coreFeaturesSummary: [
					"Personal dashboard showing daily tasks and goals",
					"Simple family coordination and shared calendar",
					"Progress tracking for personal habits and goals",
				],
				userInterfaces: [
					"Personal Dashboard - Main daily overview screen",
					"Family Coordination - Shared schedule and task view",
					"Settings - Simple personal preferences and account management",
				],
				keyIntegrations: [
					"Phone calendar sync for seamless schedule integration",
					"Stripe for simple subscription payments",
					"Push notifications for reminders and family updates",
				],
				pricingStrategyBuildRecommendation:
					"Implement a simple freemium model using Stripe Subscriptions, with basic features free and premium personal productivity features behind a monthly subscription.",
			};

			// First try SafeJsonParser with LLM repair fallback
			let whatToBuildData: WhatToBuildData | null = null;

			const schemaHint = {
				expectedKeys: [
					'platformDescription',
					'coreFeaturesSummary', 
					'userInterfaces',
					'keyIntegrations',
					'pricingStrategyBuildRecommendation'
				],
				description: 'Technical implementation guide for a consumer-focused app',
				example: {
					platformDescription: "A mobile app that helps busy parents coordinate family schedules and share household tasks",
					coreFeaturesSummary: ["Family calendar integration", "Task sharing system", "Quick notifications"],
					userInterfaces: ["Family Dashboard", "Individual schedule view", "Settings screen"],
					keyIntegrations: ["Phone calendar sync", "Payment processing", "Push notifications"],
					pricingStrategyBuildRecommendation: "Freemium model with basic features free and premium subscription"
				}
			};

			const parseResult = await SafeJsonParser.parseWithLLMFallback<WhatToBuildData>(
				text,
				"WhatToBuildData from what-to-build agent",
				1,
				schemaHint
			);

			if (parseResult.success && parseResult.data) {
				whatToBuildData = parseResult.data;
				debugLogger.debug("✅ Safe JSON parsing successful", {
					usedLLMRepair: parseResult.usedLLMRepair
				});
			} else {
				// Fallback to enhanced parser
				debugLogger.debug("⚠️ Safe JSON parser failed, trying enhanced parser...", {
					parseError: parseResult.error
				});
				const enhancedResult = await EnhancedJsonParser.parseWithFallback<WhatToBuildData>(
					text,
					[
						"platformDescription",
						"coreFeaturesSummary",
						"userInterfaces",
						"keyIntegrations",
					],
					fallbackData,
				);

				if (enhancedResult.success) {
					whatToBuildData = enhancedResult.data as WhatToBuildData;
				} else {
					console.error(
						"❌ Both JSON parsing methods failed:",
						enhancedResult.error,
					);
					whatToBuildData = fallbackData;
				}
			}
			debugLogger.debug("🔄 WhatToBuildAgent response:", {
				whatToBuildData,
				parseResult,
			});
			return whatToBuildData;
		} catch (error) {
			console.error("WhatToBuildAgent error:", error);

			// Return mock data as fallback for development/testing
			debugLogger.debug("🔄 Using fallback mock WhatToBuild data for development");
			return {
				platformDescription:
					"A mobile app that helps busy individuals organize their daily lives, track personal goals, and coordinate with family members through simple, intuitive features designed for everyday use.",
				coreFeaturesSummary: [
					"Personal dashboard showing daily tasks, goals, and priorities",
					"Simple family coordination with shared calendar and task lists",
					"Progress tracking for personal habits and goal achievement",
					"Quick capture for tasks, ideas, and reminders",
					"Gentle notifications and reminders that respect user preferences",
					"Personal insights and simple analytics for life improvement",
				],
				userInterfaces: [
					"Personal Dashboard - Main daily overview and quick actions",
					"Family Hub - Shared schedules and household coordination",
					"Goals & Habits - Personal progress tracking and motivation",
				],
				keyIntegrations: [
					"Phone calendar sync for seamless schedule integration",
					"Stripe for simple subscription payments and premium features",
					"Push notifications for reminders and family coordination",
					"iCloud/Google sync for data backup and device synchronization",
					"Simple photo sharing for family coordination and memories",
				],
				pricingStrategyBuildRecommendation:
					"Implement freemium consumer model with Stripe: Free tier (basic personal organization, simple family sharing), Premium tier $4.99/month (advanced goal tracking, unlimited family members, personal insights), Family tier $9.99/month (multiple individual accounts, shared premium features, enhanced coordination tools)",
			};
		}
	}
}
