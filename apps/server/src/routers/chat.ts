import { Elysia } from "elysia";
import { streamText } from "ai";
import { openrouter } from "../utils/configs/ai.config";
import prisma from "../../prisma";

export const chatRouter = new Elysia({ prefix: "/api" })
  .post("/chat", async ({ body, set }) => {
    try {
      const { messages, ideaId, ideaTitle, ideaDescription } = body as {
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
        ideaId: string;
        ideaTitle?: string;
        ideaDescription?: string;
      };

      // Fetch full idea details for context
      let ideaContext = "";
      
      if (ideaId) {
        try {
          const idea = await prisma.dailyIdea.findUnique({
            where: { id: ideaId },
            include: {
              whyNow: true,
              ideaScore: true,
              marketOpportunity: {
                include: {
                  customerSegments: true,
                  marketValidationSignals: true,
                },
              },
              monetizationStrategy: {
                include: {
                  revenueStreams: true,
                  keyMetrics: true,
                  financialProjections: true,
                },
              },
              marketCompetition: true,
              marketGap: true,
              competitiveAdvantage: true,
              strategicPositioning: true,
              executionPlan: true,
              tractionSignals: true,
              frameworkFit: true,
              whatToBuild: true,
            },
          });

          if (idea) {
            ideaContext = `
BUSINESS IDEA CONTEXT:
Title: ${idea.title}
Description: ${idea.description}

KEY DETAILS:
- Total Score: ${idea.ideaScore?.totalScore || 'N/A'}/100
- Problem Severity: ${idea.ideaScore?.problemSeverity || 'N/A'}/10
- Technical Feasibility: ${idea.ideaScore?.technicalFeasibility || 'N/A'}/10
- Monetization Potential: ${idea.ideaScore?.monetizationPotential || 'N/A'}/10
- Moat Strength: ${idea.ideaScore?.moatStrength || 'N/A'}/10

MARKET OPPORTUNITY:
${idea.marketOpportunity ? `
- Market Opportunity Score: ${idea.marketOpportunity.marketOpportunityScore}/100
- Total Market Size: ${idea.marketOpportunity.totalMarketSize}
- Reachable Market Size: ${idea.marketOpportunity.reachableMarketSize}
- Market Maturity: ${idea.marketOpportunity.marketMaturityLevel}
- Growth Rate: ${idea.marketOpportunity.growthRate}%
- Customer Segments: ${idea.marketOpportunity.customerSegments?.map(seg => seg.name).join(', ') || 'N/A'}
` : 'No market opportunity data available.'}

MONETIZATION STRATEGY:
${idea.monetizationStrategy ? `
- Primary Model: ${idea.monetizationStrategy.primaryModel}
- Pricing Strategy: ${idea.monetizationStrategy.pricingStrategy}
- Business Score: ${idea.monetizationStrategy.businessScore}/100
- Revenue Streams: ${idea.monetizationStrategy.revenueStreams?.map(stream => stream.name).join(', ') || 'N/A'}
` : 'No monetization strategy available.'}

MARKET COMPETITION:
${idea.marketCompetition ? `
- Market Concentration: ${idea.marketCompetition.marketConcentrationLevel}
- Competitive Positioning Score: ${idea.marketCompetition.competitivePositioningScore}/100
- Direct Competitors: ${Array.isArray(idea.marketCompetition.directCompetitors) ? idea.marketCompetition.directCompetitors.join(', ') : 'N/A'}
- Indirect Competitors: ${Array.isArray(idea.marketCompetition.indirectCompetitors) ? idea.marketCompetition.indirectCompetitors.join(', ') : 'N/A'}
- Unfair Advantages: ${Array.isArray(idea.marketCompetition.unfairAdvantage) ? idea.marketCompetition.unfairAdvantage.join(', ') : 'N/A'}
` : 'No competition analysis available.'}

EXECUTION PLAN:
${idea.executionPlan ? `
- MVP Description: ${idea.executionPlan.mvpDescription}
- Resource Requirements: ${idea.executionPlan.resourceRequirements}
- Key Milestones: ${Array.isArray(idea.executionPlan.keyMilestones) ? idea.executionPlan.keyMilestones.join(', ') : 'N/A'}
- Team Requirements: ${idea.executionPlan.teamRequirements?.join(', ') || 'N/A'}
- Risk Factors: ${idea.executionPlan.riskFactors?.join(', ') || 'N/A'}
` : 'No execution plan available.'}

WHAT TO BUILD:
${idea.whatToBuild ? `
- Platform Description: ${idea.whatToBuild.platformDescription}
- Core Features: ${idea.whatToBuild.coreFeaturesSummary?.join(', ') || 'N/A'}
- User Interfaces: ${idea.whatToBuild.userInterfaces?.join(', ') || 'N/A'}
- Key Integrations: ${idea.whatToBuild.keyIntegrations?.join(', ') || 'N/A'}
` : 'No build details available.'}

WHY NOW:
${idea.whyNow ? `
- Title: ${idea.whyNow.title}
- Description: ${idea.whyNow.description}
- Trend Strength: ${idea.whyNow.trendStrength}/10
- Catalyst Type: ${idea.whyNow.catalystType}
- Timing Urgency: ${idea.whyNow.timingUrgency}/10
` : 'No timing analysis available.'}
            `;
          }
        } catch (error) {
          console.error("Error fetching idea context:", error);
          ideaContext = `Limited context available for idea: ${ideaTitle || ideaId}`;
          if (ideaDescription) {
            ideaContext += `\nDescription: ${ideaDescription}`;
          }
        }
      }

      const systemPrompt = `You are an expert business consultant and startup advisor helping users understand and analyze business ideas. You have access to detailed information about a specific business idea/nugget.

${ideaContext}

Your role is to:
1. Answer questions about this specific business idea with detailed, actionable insights
2. Provide strategic advice on execution, market positioning, and growth
3. Explain complex business concepts in clear, accessible terms
4. Offer practical recommendations based on the data provided
5. Help users understand market opportunities, competition, and execution challenges

Keep your responses:
- Focused on the specific business idea being discussed
- Practical and actionable
- Well-structured and easy to read
- Based on the detailed context provided above
- Professional but conversational

If asked about information not available in the context, acknowledge the limitation and provide general business advice where appropriate.`;

      const result = await streamText({
        model: openrouter("openai/gpt-4.1-nano"),
        system: systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 1000,
      });

      set.headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      return result.toDataStreamResponse();
    } catch (error) {
      console.error("Chat API error:", error);
      set.status = 500;
      return { error: "Failed to process chat request" };
    }
  })
  .options("/chat", ({ set }) => {
    set.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    return new Response(null, { status: 200 });
  }); 