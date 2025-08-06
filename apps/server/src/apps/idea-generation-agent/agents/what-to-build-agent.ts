import { generateText } from "ai";
import type { AgentContext, WhatToBuildData } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

export class WhatToBuildAgent {
  /**
   * WhatToBuildAgent - Generate detailed technical implementation guide
   * Uses OpenRouter GPT-4o-mini for structured technical specification generation
   */
  static async execute(
    context: AgentContext
  ): Promise<WhatToBuildData | null> {
    try {
      const systemPrompt = `You are a product strategist focused on enabling solo founders and small teams to build a Minimal Viable Product (MVP) quickly and affordably. Your job is to provide a concise, high-level recommendation of "what to build" for a given business idea.

**Your mission:** Translate the validated business idea into specific, actionable components that prioritize SOFTWARE-FIRST solutions (SaaS, web/mobile apps) with clear user interactions and rapid development potential. Focus *only* on the absolute essentials for a *buildable, fundable MVP*.

**Critical Guidelines:**
1. **HIGH-LEVEL RECOMMENDATION:** Provide recommendations in simple, direct language. This is NOT a detailed technical specification or a database schema.
2. **SOLO-FOUNDER/SMALL TEAM FRIENDLY:** All suggested components should be feasible for a single developer or a very small team to build (within 3-6 months, ideally using no-code/low-code tools or common frameworks).
3. **COST-EFFICIENT:** Assume minimal budget (ideally <$10,000 for MVP build, excluding marketing). Avoid complex, expensive, or R&D-heavy components.
4. **MVP-FOCUSED:** Only include core features that directly solve the primary problem and enable the initial monetization.
5. **INTEGRATION-SMART:** Recommend leveraging battle-tested, off-the-shelf third-party services/APIs wherever possible to accelerate development (e.g., Stripe for payments, Twilio for comms).

Return this exact JSON structure:
{
  "platformDescription": "string (A concise summary of what the platform *is* and *does* for the user, in plain language. Example: 'An online dashboard that helps local coffee shops instantly sync their daily specials across social media and website, solving outdated info.')",
  "coreFeaturesSummary": ["High-level feature 1 that solves a key problem (e.g., '1-click content distribution to social media')", "High-level feature 2 for core user workflow (e.g., 'Centralized dashboard for all updates')", "High-level feature 3 supporting the recommended monetization (e.g., 'Subscription management via Stripe')"],
  "userInterfaces": ["Key UI/dashboard for primary user type (e.g., 'Coffee Shop Owner Dashboard')", "Any essential public-facing UI (e.g., 'Public-facing 'Today's Specials' embed')", "Minimal Admin UI (e.g., 'Basic Admin Settings page')"],
  "keyIntegrations": ["Essential integration 1 for core functionality (e.g., 'Meta API for Facebook/Instagram posting')", "Integration 2 for payments/billing (e.g., 'Stripe Connect')", "Integration 3 for communication (e.g., 'Twilio for SMS notifications')"],
  "pricingStrategyBuildRecommendation": "string (A simple, actionable recommendation on how to technically implement the recommended pricing model. Example: 'Implement a tiered subscription model (Basic/Pro) using Stripe Subscriptions, with feature flags to gate Pro features.')",
  "freemiumComponents": "string? (Optional: if a freemium model is recommended, describe the specific features that would be free to attract users. Example: 'Offer a free tier that allows 1 social media sync per day and view-only access to basic analytics.')"
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
      const parseResult = await EnhancedJsonParser.parseWithFallback<WhatToBuildData>(
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
        }
      );

      if (!parseResult.success) {
        console.error(
          "❌ WhatToBuild Agent JSON parsing failed:",
          parseResult.error
        );
        console.log(
          "📝 Original response:",
          parseResult.originalText?.substring(0, 500)
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
