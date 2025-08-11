import { generateText } from "ai";
import type {
	AgentContext,
	MonetizationData,
} from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

export class MonetizationAgent {
	/**
	 * MonetizationAgent - Generate revenue models and financial projections
	 * Uses OpenRouter GPT-4.1-nano for structured business model generation
	 */
	static async execute(
		context: AgentContext,
	): Promise<MonetizationData | null> {
		try {
			const systemPrompt = `Let's design a simple money-making plan that customers worldwide actually love paying for. Given a real problem and a focused software solution, create a pricing model that feels fair and makes sense globally. This should realistically grow to meaningful revenue for a simple startup.

		**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
		- Focus on GLOBAL customers and universal pricing that works worldwide
		- Use simple, everyday language that anyone can understand
		- NO geographic locations, country names, or regional specificity
		- Avoid technical jargon, buzzwords, and complex terms
		- Create universal pricing that works for people everywhere
		- Solutions should be globally accessible and fairly priced

		**The pricing has to directly connect to the clear value we provide with our simple software. The financial projections should be realistic for one focused, easy-to-build software product.**
		
		Explain the revenue model like you're advising a friend on their real startup: clear, simple, and focused on what customers actually get from the software. No complicated terms or confusing strategies.
		
		Return this exact structure:
		{
		  "primaryModel": "string (e.g., 'Simple Monthly Subscription' or 'Pay Per Use' - describe in plain English)",
		  "pricingStrategy": "string (A simple, clear explanation of how pricing works and why it's fair value for customers globally, specifically for the software's benefits. No confusing tiers unless absolutely necessary.)",
		  "businessScore": number,
		  "confidence": number,
		  "revenueModelValidation": "string (Give honest, real-world examples of *similar niche tools* that successfully use this model, or explain simply why it's the right fit for our target's budget and willingness to pay for our *software solution*.)",
		  "pricingSensitivity": "string (Be honest: how sensitive is *our specific target* to price, and *why* will they still pay for our unique value, particularly for *software*? What's the pain point they're escaping that our *MVP* fixes?)",
		  "revenueStreams": [
			{ "name": "string (simple name for the revenue source)", "description": "string (a straightforward explanation of how this *software feature* makes money and delivers value)", "percentage": number }
		  ],
		  "keyMetrics": {
			"ltv": number, "ltvDescription": "string (A brief, honest story of how customer value builds over time for THIS specific *software product*. Keep it simple.)",
			"cac": number, "cacDescription": "string (A direct explanation of how we'll acquire THIS specific customer type – be very realistic, e.g., 'targeted Facebook ads in niche groups', 'cold email to local businesses for software demo')",
			"ltvCacRatio": number, "ltvCacRatioDescription": "string (Why this ratio indicates healthy growth for our niche *software product*. Keep it clear.)",
			"paybackPeriod": number, "paybackPeriodDescription": "string (The straightforward timeline to get our money back from a customer for the *software service*.)",
			"runway": number, "runwayDescription": "string (An honest account of how long we can operate with current funds, considering lean software development.)",
			"breakEvenPoint": "string", "breakEvenPointDescription": "string (When we expect to stop bleeding money and start making it for our *software product*.)"
		  },
		  "financialProjections": [
			{ "year": number, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number }
		  ]
		}
		
		Focus on absolute clarity and brutal achievability. Every number should tell an honest story about *our specific niche's* money. No LinkedIn post tones.`;

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const positioningContext =
				context.competitive?.positioning.valueProposition || "";

			const userPrompt = `Design a lean, hyper-focused monetization strategy for a solution addressing these problems: ${problemContext}
      
			Value proposition for our niche: ${positioningContext}
				  
			Clearly define the primary revenue model, pricing strategy, and how it delivers clear, quantifiable ROI for our specific target persona. Include realistic revenue streams, key metrics (LTV, CAC, payback period), and simplified 3-year financial projections that reflect a laser-focused MVP with potential for scale within its niche.`;

			const { text } = await generateText({
				model: openrouter("openai/gpt-4.1-mini"),
				prompt: userPrompt,
				system: systemPrompt,
				temperature: 0.1,
				maxTokens: 1000,
			});

			// Use enhanced JSON parser to handle markdown code blocks and formatting issues
			const parseResult =
				await EnhancedJsonParser.parseWithFallback<MonetizationData>(
					text,
					["primaryModel", "pricingStrategy", "revenueStreams", "keyMetrics"],
					{
						primaryModel: "SaaS Subscription",
						pricingStrategy:
							"Tiered SaaS pricing based on number of integrations and automations",
						businessScore: 8,
						confidence: 7,
						revenueModelValidation:
							"Validated by similar tools in market with proven demand",
						pricingSensitivity:
							"Target market is price-sensitive but will pay for proven ROI",
						revenueStreams: [
							{
								name: "Monthly Subscriptions",
								description: "Core SaaS platform access",
								percentage: 70,
							},
							{
								name: "Setup & Consulting",
								description: "Implementation services",
								percentage: 20,
							},
							{
								name: "Premium Integrations",
								description: "Enterprise-grade connectors",
								percentage: 10,
							},
						],
						keyMetrics: {
							ltv: 1800,
							ltvDescription:
								"Average customer lifetime value based on 18-month retention",
							cac: 180,
							cacDescription:
								"Customer acquisition cost through digital marketing",
							ltvCacRatio: 10,
							ltvCacRatioDescription:
								"Healthy 10:1 LTV:CAC ratio indicating profitable growth",
							paybackPeriod: 6,
							paybackPeriodDescription:
								"6 months to recover customer acquisition cost",
							runway: 18,
							runwayDescription: "18 months of operating expenses covered",
							breakEvenPoint: "Month 14 at 500 customers",
							breakEvenPointDescription: "Break-even when MRR reaches $25K",
						},
						financialProjections: [
							{
								year: 1,
								revenue: 120000,
								costs: 200000,
								netMargin: -40,
								revenueGrowth: 0,
							},
							{
								year: 2,
								revenue: 480000,
								costs: 350000,
								netMargin: 27,
								revenueGrowth: 300,
							},
							{
								year: 3,
								revenue: 1200000,
								costs: 720000,
								netMargin: 40,
								revenueGrowth: 150,
							},
						],
					},
				);

			if (!parseResult.success) {
				console.error(
					"❌ Monetization Agent JSON parsing failed:",
					parseResult.error,
				);
				console.log(
					"📝 Original response:",
					parseResult.originalText?.substring(0, 500),
				);
			}

			const monetizationData = parseResult.data as MonetizationData;
			return monetizationData;
		} catch (error) {
			console.error("MonetizationAgent error:", error);

			// Return mock data as fallback for development/testing
			console.log("🔄 Using fallback mock monetization data for development");
			return {
				primaryModel: "SaaS Subscription",
				pricingStrategy:
					"Tiered SaaS pricing based on number of integrations and automations",
				businessScore: 8,
				confidence: 7,
				revenueModelValidation:
					"Validated by similar tools in market (Zapier, Make.com) with proven demand",
				pricingSensitivity:
					"SMBs are price-sensitive but will pay for proven ROI and time savings",
				revenueStreams: [
					{
						name: "Monthly Subscriptions",
						description: "Core SaaS platform access",
						percentage: 70,
					},
					{
						name: "Setup & Consulting",
						description: "Implementation services",
						percentage: 20,
					},
					{
						name: "Premium Integrations",
						description: "Enterprise-grade connectors",
						percentage: 10,
					},
				],
				keyMetrics: {
					ltv: 1800,
					ltvDescription:
						"Average customer lifetime value based on 18-month retention",
					cac: 180,
					cacDescription: "Customer acquisition cost through digital marketing",
					ltvCacRatio: 10,
					ltvCacRatioDescription:
						"Healthy 10:1 LTV:CAC ratio indicating profitable growth",
					paybackPeriod: 6,
					paybackPeriodDescription:
						"6 months to recover customer acquisition cost",
					runway: 18,
					runwayDescription: "18 months of operating expenses covered",
					breakEvenPoint: "Month 14 at 500 customers",
					breakEvenPointDescription: "Break-even when MRR reaches $25K",
				},
				financialProjections: [
					{
						year: 1,
						revenue: 120000,
						costs: 200000,
						netMargin: -40,
						revenueGrowth: 0,
					},
					{
						year: 2,
						revenue: 480000,
						costs: 350000,
						netMargin: 27,
						revenueGrowth: 300,
					},
					{
						year: 3,
						revenue: 1200000,
						costs: 720000,
						netMargin: 40,
						revenueGrowth: 150,
					},
				],
			};
		}
	}
}
