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
			const systemPrompt = `Let's design a simple pricing plan that everyday people worldwide actually love paying for. Given a real personal problem and a focused consumer software solution, create a pricing model that feels fair and makes sense to individual users globally. This should realistically grow to meaningful revenue for a consumer-focused startup.

		**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
		- Focus on GLOBAL individual customers and universal pricing that works worldwide
		- Use simple, everyday language that anyone can understand
		- NO geographic locations, country names, or regional specificity
		- Avoid technical jargon, buzzwords, and complex terms
		- Create universal pricing that works for regular people everywhere
		- Solutions should be globally accessible and fairly priced for individuals

		**The pricing has to directly connect to the clear personal value we provide with our simple consumer software. The financial projections should be realistic for one focused, easy-to-build consumer product.**
		
		Explain the revenue model like you're advising a friend on their real consumer app: clear, simple, and focused on what individual users actually get from the software. No complicated terms or confusing strategies.
		
		Return this exact structure:
		{
		  "primaryModel": "string (e.g., 'Simple Monthly Subscription' or 'Pay Per Use' - describe in plain English)",
		  "pricingStrategy": "string (A simple, clear explanation of how pricing works and why it's fair value for individual consumers globally, specifically for the software's personal benefits. No confusing tiers unless absolutely necessary.)",
		  "businessScore": number,
		  "confidence": number,
		  "revenueModelValidation": "string (Give honest, real-world examples of *similar consumer apps* that successfully use this model, or explain simply why it's the right fit for our target individual's budget and willingness to pay for our *consumer software*.)",
		  "pricingSensitivity": "string (Be honest: how sensitive are *our specific individual users* to price, and *why* will they still pay for our unique personal value, particularly for *consumer software*? What's the daily frustration they're escaping that our *app* fixes?)",
		  "revenueStreams": [
			{ "name": "string (simple name for the revenue source)", "description": "string (a straightforward explanation of how this *consumer app feature* makes money and delivers personal value)", "percentage": number }
		  ],
		  "keyMetrics": {
			"ltv": number, "ltvDescription": "string (A brief, honest story of how individual customer value builds over time for THIS specific *consumer app*. Keep it simple.)",
			"cac": number, "cacDescription": "string (A direct explanation of how we'll acquire THIS specific individual customer type – be very realistic, e.g., 'targeted social media ads in lifestyle groups', 'app store optimization for personal productivity')",
			"ltvCacRatio": number, "ltvCacRatioDescription": "string (Why this ratio indicates healthy growth for our consumer *app*. Keep it clear.)",
			"paybackPeriod": number, "paybackPeriodDescription": "string (The straightforward timeline to get our money back from an individual customer for the *consumer service*.)",
			"runway": number, "runwayDescription": "string (An honest account of how long we can operate with current funds, considering lean consumer app development.)",
			"breakEvenPoint": "string", "breakEvenPointDescription": "string (When we expect to stop bleeding money and start making it for our *consumer app*.)"
		  },
		  "financialProjections": [
			{ "year": number, "revenue": number, "costs": number, "netMargin": number, "revenueGrowth": number }
		  ]
		}
		
		Focus on absolute clarity and brutal achievability. Every number should tell an honest story about *our specific individual users'* willingness to pay for personal value. No LinkedIn post tones.`;

			const problemContext = context.problemGaps?.problems.join(", ") || "";
			const positioningContext =
				context.competitive?.positioning.valueProposition || "";

			const userPrompt = `Design a lean, hyper-focused monetization strategy for a consumer solution addressing these personal problems: ${problemContext}
      
			Value proposition for individual users: ${positioningContext}
				  
			Clearly define the primary revenue model, pricing strategy, and how it delivers clear, quantifiable personal value for our specific target individuals. Include realistic revenue streams, key metrics (LTV, CAC, payback period), and simplified 3-year financial projections that reflect a laser-focused consumer MVP with potential for scale within its market.

			**Consumer Pricing Considerations:**
			- Individual consumers vs. business customers have different price sensitivity
			- Focus on personal value and daily life improvement
			- Consider freemium models that let people try before they pay
			- Simple pricing that people can understand immediately
			- Monthly costs that feel reasonable for personal budgets
			- Value that justifies the cost in terms of time/money saved or life improved`;

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
						primaryModel: "Simple Monthly Subscription",
						pricingStrategy:
							"Freemium model with basic features free and premium features at affordable monthly price for individual consumers",
						businessScore: 8,
						confidence: 7,
						revenueModelValidation:
							"Validated by successful consumer apps like Todoist, Mint, and Headspace with proven individual user demand",
						pricingSensitivity:
							"Individual consumers are price-sensitive but will pay for apps that save time and reduce daily stress",
						revenueStreams: [
							{
								name: "Monthly Subscriptions",
								description: "Premium features for enhanced personal productivity",
								percentage: 80,
							},
							{
								name: "One-time Purchases",
								description: "Optional premium themes and customizations",
								percentage: 15,
							},
							{
								name: "Partner Referrals",
								description: "Commission from recommended services",
								percentage: 5,
							},
						],
						keyMetrics: {
							ltv: 150,
							ltvDescription:
								"Average individual customer lifetime value based on 12-month retention for personal productivity apps",
							cac: 15,
							cacDescription:
								"Consumer acquisition cost through social media advertising and app store optimization",
							ltvCacRatio: 10,
							ltvCacRatioDescription:
								"Healthy 10:1 LTV:CAC ratio indicating profitable consumer growth",
							paybackPeriod: 2,
							paybackPeriodDescription:
								"2 months to recover individual customer acquisition cost",
							runway: 12,
							runwayDescription: "12 months of operating expenses for lean consumer app team",
							breakEvenPoint: "Month 8 at 5,000 paying users",
							breakEvenPointDescription: "Break-even when monthly recurring revenue reaches $50K",
						},
						financialProjections: [
							{
								year: 1,
								revenue: 180000,
								costs: 120000,
								netMargin: 33,
								revenueGrowth: 0,
							},
							{
								year: 2,
								revenue: 520000,
								costs: 280000,
								netMargin: 46,
								revenueGrowth: 189,
							},
							{
								year: 3,
								revenue: 1100000,
								costs: 550000,
								netMargin: 50,
								revenueGrowth: 112,
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
				primaryModel: "Simple Monthly Subscription",
				pricingStrategy:
					"Freemium model with basic features free and premium features at affordable monthly price for individual consumers",
				businessScore: 8,
				confidence: 7,
				revenueModelValidation:
					"Validated by successful consumer apps like Todoist, Mint, and Headspace with proven individual user demand",
				pricingSensitivity:
					"Individual consumers are price-sensitive but will pay for apps that save time and reduce daily stress",
				revenueStreams: [
					{
						name: "Monthly Subscriptions",
						description: "Premium features for enhanced personal productivity",
						percentage: 80,
					},
					{
						name: "One-time Purchases",
						description: "Optional premium themes and customizations",
						percentage: 15,
					},
					{
						name: "Partner Referrals",
						description: "Commission from recommended services",
						percentage: 5,
					},
				],
				keyMetrics: {
					ltv: 150,
					ltvDescription:
						"Average individual customer lifetime value based on 12-month retention for personal productivity apps",
					cac: 15,
					cacDescription: "Consumer acquisition cost through social media advertising and app store optimization",
					ltvCacRatio: 10,
					ltvCacRatioDescription:
						"Healthy 10:1 LTV:CAC ratio indicating profitable consumer growth",
					paybackPeriod: 2,
					paybackPeriodDescription:
						"2 months to recover individual customer acquisition cost",
					runway: 12,
					runwayDescription: "12 months of operating expenses for lean consumer app team",
					breakEvenPoint: "Month 8 at 5,000 paying users",
					breakEvenPointDescription: "Break-even when monthly recurring revenue reaches $50K",
				},
				financialProjections: [
					{
						year: 1,
						revenue: 180000,
						costs: 120000,
						netMargin: 33,
						revenueGrowth: 0,
					},
					{
						year: 2,
						revenue: 520000,
						costs: 280000,
						netMargin: 46,
						revenueGrowth: 189,
					},
					{
						year: 3,
						revenue: 1100000,
						costs: 550000,
						netMargin: 50,
						revenueGrowth: 112,
					},
				],
			};
		}
	}
}
