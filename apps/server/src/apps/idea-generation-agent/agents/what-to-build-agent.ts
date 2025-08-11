import { generateText } from "ai";
import type {
	AgentContext,
	WhatToBuildData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

export class WhatToBuildAgent {
	/**
	 * WhatToBuildAgent - Generate detailed technical implementation guide
	 * Uses OpenRouter GPT-4o-mini for structured technical specification generation
	 */
	static async execute(context: AgentContext): Promise<WhatToBuildData | null> {
		try {
			const systemPrompt = `You are a product strategist focused on helping people build a simple software product quickly and affordably. Your job is to provide a clear, easy-to-understand guide of "what to build" for a business idea.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Focus on globally applicable solutions that work everywhere
- Create recommendations that work for people worldwide
- Keep everything simple and accessible

**Your mission:** Turn the business idea into specific, doable steps that focus on simple software solutions (websites, apps) that are easy to understand and quick to build. Focus only on the most important features for a working product.

**Critical Guidelines:**
1. **SIMPLE RECOMMENDATIONS:** Give advice in everyday language. This is NOT a technical manual or complex specification.
2. **SMALL TEAM FRIENDLY:** Everything should be doable by one person or a small team (within 3-6 months, using simple tools and common website/app builders).
3. **AFFORDABLE:** Keep costs low (under $10,000 to build, not counting marketing). Avoid expensive or complicated components.
4. **FOCUSED:** Only include main features that solve the key problem and help make money.
5. **USE EXISTING TOOLS:** Recommend using proven, ready-made services wherever possible to speed up development (like Stripe for payments, simple email services for communication).

Return this exact JSON structure:
{
  "platformDescription": "string (A simple summary of what the platform does for users, in everyday language. Example: 'A website that helps small businesses instantly share their daily updates across social media, saving time and keeping info current.')",
  "coreFeaturesSummary": ["Main feature 1 that solves the key problem (e.g., 'One-click sharing to social media')", "Main feature 2 for user workflow (e.g., 'Simple dashboard for all updates')", "Main feature 3 for making money (e.g., 'Easy subscription payments')"],
  "userInterfaces": ["Main screen for primary users (e.g., 'Business Owner Dashboard')", "Any essential public screens (e.g., 'Public daily specials page')", "Simple admin screen (e.g., 'Basic settings page')"],
  "keyIntegrations": ["Essential connection 1 for main function (e.g., 'Facebook/Instagram posting')", "Connection 2 for payments (e.g., 'Stripe for subscriptions')", "Connection 3 for communication (e.g., 'Email service for notifications')"],
  "pricingStrategyBuildRecommendation": "string (A simple guide on how to set up the pricing model. Example: 'Set up simple monthly plans (Basic/Pro) using Stripe, with different features for each level.')",
  "freemiumComponents": "string? (Optional: if offering free features, describe what would be free to attract users. Example: 'Offer a free version that allows 1 social media post per day and basic analytics.')"
}

Focus on providing a practical, confidence-boosting blueprint that clearly shows a founder what they can *start building tomorrow* with existing tools and skills. No complex or speculative tech.`;

			const ideaContext = context.monetization
				? `Business Idea: ${context.competitive?.positioning?.valueProposition || "Not specified"}
 Target Market: ${context.competitive?.positioning?.targetSegment || "Not specified"}
 Recommended Revenue Model: ${context.monetization.primaryModel} (Pricing Strategy: ${context.monetization.pricingStrategy})
 Key Problems Solved: ${context.problemGaps?.problems?.join(", ") || "Not specified"}`
				: "Context not fully available";

			const userPrompt = `Create a comprehensive technical implementation guide for this validated business opportunity:

${ideaContext}

Design a software-first platform that:
1. Directly solves the identified user problems through intuitive interfaces
2. Integrates seamlessly with existing tools in the target market
3. Supports the planned monetization strategy through its technical architecture
4. Can be built and launched by a focused development team within 3-6 months
5. Scales efficiently as the user base grows
6. Focus on defining the core software components and interfaces needed to launch quickly and affordably

Focus on specificity - provide exact feature descriptions, precise integration recommendations, and clear technical approaches that eliminate guesswork for the development team.`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: userPrompt,
				system: systemPrompt,
				temperature: 0.1,
				maxTokens: 1200,
			});

			// Use enhanced JSON parser to handle markdown code blocks and formatting issues
			const parseResult =
				await EnhancedJsonParser.parseWithFallback<WhatToBuildData>(
					text,
					[
						"platformDescription",
						"coreFeaturesSummary",
						"userInterfaces",
						"keyIntegrations",
					],
					{
						platformDescription:
							"A cloud-based SaaS platform with web dashboard and mobile companion app, featuring workflow builder and real-time monitoring for small business operations.",
						coreFeaturesSummary: [
							"Visual workflow builder with pre-built business templates",
							"Real-time business data integration dashboard",
							"AI-powered automation recommendations engine",
						],
						userInterfaces: [
							"Business Owner Dashboard - Main workflow management interface",
							"Team Member Mobile App - Task execution and approvals",
							"Admin Panel - User management and billing controls",
						],
						keyIntegrations: [
							"Stripe for subscription billing and payment processing",
							"QuickBooks/Xero for financial data integration",
							"Slack/Microsoft Teams for team notifications",
						],
						pricingStrategyBuildRecommendation:
							"Implement a tiered subscription model (Basic/Pro) using Stripe Subscriptions, with feature flags to gate Pro features.",
					},
				);

			if (!parseResult.success) {
				console.error(
					"❌ WhatToBuild Agent JSON parsing failed:",
					parseResult.error,
				);
				console.log(
					"📝 Original response:",
					parseResult.originalText?.substring(0, 500),
				);
			}

			const whatToBuildData = parseResult.data as WhatToBuildData;
			return whatToBuildData;
		} catch (error) {
			console.error("WhatToBuildAgent error:", error);

			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock WhatToBuild data for development");
			return {
				platformDescription:
					"A cloud-based SaaS automation platform with web dashboard and mobile companion app, featuring drag-and-drop workflow builder, real-time monitoring, and AI-powered optimization suggestions for small business operations.",
				coreFeaturesSummary: [
					"Visual workflow builder with pre-built business templates",
					"Real-time business data integration dashboard",
					"AI-powered automation recommendations engine",
					"Mobile app for workflow monitoring and approvals",
					"Team collaboration and notification system",
					"Analytics and ROI tracking for automated processes",
				],
				userInterfaces: [
					"Business Owner Dashboard - Main workflow management interface",
					"Team Member Mobile App - Task execution and approvals",
					"Admin Panel - User management and billing controls",
				],
				keyIntegrations: [
					"Stripe for subscription billing and payment processing",
					"Zapier/Make API for extended workflow capabilities",
					"QuickBooks/Xero for financial data integration",
					"Slack/Microsoft Teams for team notifications",
					"Google Workspace/Office 365 for document automation",
				],
				pricingStrategyBuildRecommendation:
					"Implement freemium SaaS model with Stripe: Free tier (3 workflows, basic templates), Starter tier $29/month (unlimited workflows, advanced templates), Pro tier $99/month (AI suggestions, team collaboration, analytics), Enterprise tier $299/month (custom integrations, white-label, priority support)",
			};
		}
	}
}
