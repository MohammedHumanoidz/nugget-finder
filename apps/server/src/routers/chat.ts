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
          // First try to find it as a daily idea
          let idea = await prisma.dailyIdea.findUnique({
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
            // Handle daily idea context
            ideaContext = `
BUSINESS IDEA CONTEXT (Daily Idea):
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
          } else {
            // If not found as daily idea, try as user-generated idea (mined nugget)
            const minedIdea = await prisma.userGeneratedIdea.findUnique({
              where: { id: ideaId }
            });

            if (minedIdea) {
              // Parse the full idea data
              let fullIdeaData = null;
              try {
                fullIdeaData = JSON.parse(minedIdea.fullIdeaDataJson);
              } catch (parseError) {
                console.error("Error parsing full idea data JSON:", parseError);
              }

              // Handle mined nugget context
              ideaContext = `
BUSINESS IDEA CONTEXT (Mined Nugget - User Generated):
Title: ${minedIdea.title}
Description: ${minedIdea.description}
Original Prompt: "${minedIdea.prompt}"

CORE DETAILS:
- Executive Summary: ${minedIdea.executiveSummary}
- Problem Statement: ${minedIdea.problemStatement}
- Narrative Hook: ${minedIdea.narrativeHook}
- Confidence Score: ${minedIdea.confidenceScore}%
- Tags: ${minedIdea.tags?.join(', ') || 'N/A'}

${fullIdeaData ? `
DETAILED ANALYSIS:

SCORING:
- Total Score: ${fullIdeaData.scoring?.totalScore || 'N/A'}/100
- Problem Severity: ${fullIdeaData.scoring?.problemSeverity || 'N/A'}/10
- Technical Feasibility: ${fullIdeaData.scoring?.technicalFeasibility || 'N/A'}/10
- Monetization Potential: ${fullIdeaData.scoring?.monetizationPotential || 'N/A'}/10
- Market Timing Score: ${fullIdeaData.scoring?.marketTimingScore || 'N/A'}/10
- Moat Strength: ${fullIdeaData.scoring?.moatStrength || 'N/A'}/10

WHAT TO BUILD:
${fullIdeaData.whatToBuild ? `
- Platform Description: ${fullIdeaData.whatToBuild.platformDescription}
- Core Features: ${fullIdeaData.whatToBuild.coreFeaturesSummary?.join(', ') || 'N/A'}
- User Interfaces: ${fullIdeaData.whatToBuild.userInterfaces?.join(', ') || 'N/A'}
- Key Integrations: ${fullIdeaData.whatToBuild.keyIntegrations?.join(', ') || 'N/A'}
- Pricing Strategy: ${fullIdeaData.whatToBuild.pricingStrategyBuildRecommendation || 'N/A'}
` : 'No build details available.'}

MONETIZATION STRATEGY:
${fullIdeaData.monetization ? `
- Primary Model: ${fullIdeaData.monetization.primaryModel}
- Pricing Strategy: ${fullIdeaData.monetization.pricingStrategy}
- Business Score: ${fullIdeaData.monetization.businessScore}/10
- Revenue Streams: ${fullIdeaData.monetization.revenueStreams?.map((stream: any) => `${stream.name} (${stream.percentage}%)`).join(', ') || 'N/A'}
- Key Metrics: LTV: $${fullIdeaData.monetization.keyMetrics?.ltv || 'N/A'}, CAC: $${fullIdeaData.monetization.keyMetrics?.cac || 'N/A'}
` : 'No monetization strategy available.'}

COMPETITIVE LANDSCAPE:
${fullIdeaData.competitive ? `
- Market Concentration: ${fullIdeaData.competitive.competition?.marketConcentrationLevel || 'N/A'}
- Competitive Positioning Score: ${fullIdeaData.competitive.competition?.competitivePositioningScore || 'N/A'}/10
- Direct Competitors: ${fullIdeaData.competitive.competition?.directCompetitors?.map((comp: any) => comp.name).join(', ') || 'N/A'}
- Unfair Advantages: ${fullIdeaData.competitive.competition?.unfairAdvantage?.join(', ') || 'N/A'}
` : 'No competition analysis available.'}

MARKET TRENDS:
${fullIdeaData.trends ? `
- Trend Title: ${fullIdeaData.trends.title}
- Trend Strength: ${fullIdeaData.trends.trendStrength}/10
- Timing Urgency: ${fullIdeaData.trends.timingUrgency}/10
- Catalyst Type: ${fullIdeaData.trends.catalystType}
` : 'No trend analysis available.'}

EXECUTION PLAN:
${fullIdeaData.executionPlan ? fullIdeaData.executionPlan : 'No execution plan available.'}
` : 'Limited detailed analysis available.'}
              `;
            }
          }


          
          // If neither daily idea nor mined nugget found, provide limited context
          if (!ideaContext) {
            ideaContext = `Limited context available for idea: ${ideaTitle || ideaId}`;
            if (ideaDescription) {
              ideaContext += `\nDescription: ${ideaDescription}`;
            }
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