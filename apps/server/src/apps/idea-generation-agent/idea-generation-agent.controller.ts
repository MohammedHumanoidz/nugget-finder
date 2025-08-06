import { IdeaGenerationAgentService } from "./idea-generation-agent.service";
import type {
  AgentContext,
  SynthesizedIdea,
} from "../../types/apps/idea-generation-agent";
import { debugLogger } from "../../utils/logger";
import { prisma } from "../../utils/configs/db.config";

// Import all the agents
import { MasterResearchDirector, type ResearchDirectorData } from "./agents/master-research-director";
import { TrendResearchAgent } from "./agents/trend-research-agent";
import { ProblemGapAgent } from "./agents/problem-gap-agent";
import { CompetitiveIntelligenceAgent } from "./agents/competitive-intelligence-agent";
import { MonetizationAgent } from "./agents/monetization-agent";
import { WhatToBuildAgent } from "./agents/what-to-build-agent";
import { CriticAgent } from "./agents/critic-agent";
import { IdeaSynthesisAgent } from "./agents/idea-synthesis-agent";

const IdeaGenerationAgentController = {
  /**
   * Master Research Director - Creates diverse research themes per day
   * Influences trend research with rotating diversity across industry + geography
   */
  async masterResearchDirector(
    context: AgentContext
  ): Promise<ResearchDirectorData | null> {
    return MasterResearchDirector.execute(context);
  },

  // Helper functions for extracting patterns from previous ideas
  extractIndustry(description: string): string {
    return MasterResearchDirector.extractIndustry(description);
  },

  extractTarget(description: string): string {
    return MasterResearchDirector.extractTarget(description);
  },

  /**
   * Enhanced TrendResearchAgent - Now guided by Master Research Director
   * Uses Perplexity Deep Research with Director's research theme
   */
  async trendResearchAgent(
    context: AgentContext,
    researchDirection?: ResearchDirectorData
  ) {
    return TrendResearchAgent.execute(context, researchDirection);
  },

  /**
   * Enhanced ProblemGapAgent - Uses reasoning-rich prompts from sonar-reasoning model
   * Identifies 2-3 sharply defined, systemic problems for specific personas
   */
  async problemGapAgent(context: AgentContext) {
    return ProblemGapAgent.execute(context);
  },

  /**
   * Enhanced CompetitiveIntelligenceAgent - Better competitive analysis with strategic positioning
   * Uses structured prompts for deeper market understanding
   */
  async competitiveIntelligenceAgent(context: AgentContext) {
    return CompetitiveIntelligenceAgent.execute(context);
  },

  /**
   * MonetizationAgent - Generate revenue models and financial projections
   * Uses OpenRouter GPT-4.1-nano for structured business model generation
   */
  async monetizationAgent(context: AgentContext) {
    return MonetizationAgent.execute(context);
  },

  /**
   * WhatToBuildAgent - Generate detailed technical implementation guide
   * Uses OpenRouter GPT-4o-mini for structured technical specification generation
   */
  async whatToBuildAgent(context: AgentContext) {
    return WhatToBuildAgent.execute(context);
  },

  /**
   * Critic Agent - Silent critic that analyzes generated ideas and creates refinement prompts
   * Uses advanced reasoning to critique and improve idea quality
   */
  async criticAgent(ideas: SynthesizedIdea[], context: AgentContext) {
    return CriticAgent.execute(ideas, context);
  },

  /**
   * Enhanced IdeaSynthesisAgent - Uses Trend Architect logic with critic feedback
   * Implements markdown-style output format and strategic refinement
   */
  async ideaSynthesisAgent(context: AgentContext, refinementPrompt?: string) {
    return IdeaSynthesisAgent.execute(context, refinementPrompt);
  },

  /**
   * On-Demand Idea Generation - Generates 3 ideas based on user prompt
   * Uses the same agent pipeline but driven by user input
   */
  async generateIdeasOnDemand(userPrompt: string, userId: string): Promise<any[]> {
    try {
      console.log(`🚀 Starting On-Demand Idea Generation for prompt: "${userPrompt}"`);
      debugLogger.info("🚀 On-demand idea generation started", {
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(),
        userPrompt,
        userId,
        version: "2.0-on-demand",
      });

      const generatedIdeas = [];

      // Generate 3 ideas for the user
      for (let i = 0; i < 3; i++) {
        console.log(`🎯 Generating idea ${i + 1} of 3 for prompt: "${userPrompt}"`);
        
        try {
          // Initialize agent context with user prompt
          const agentContext: AgentContext = {
            userPrompt,
            previousIdeas: [], // Clean slate for each on-demand generation
          };

          // Step 1: Master Research Director - Set research parameters based on user prompt
          console.log(`🎯 Step 1: Activating Master Research Director (Idea ${i + 1})`);
          const researchDirection = await this.masterResearchDirector(agentContext);

          // Step 2: Enhanced Trend Research - Guided by research director and user prompt
          console.log(`📈 Step 2: Enhanced Trend Research (Idea ${i + 1})`);
          const trends = await this.trendResearchAgent(agentContext, researchDirection || undefined);
          if (!trends) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to research trends for idea ${i + 1}`),
              { step: "trendResearch", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }
          agentContext.trends = trends;

          // Step 3: Enhanced Problem Gap Analysis
          console.log(`🎯 Step 3: Enhanced Problem Gap Analysis (Idea ${i + 1})`);
          const problemGaps = await this.problemGapAgent(agentContext);
          if (!problemGaps) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to analyze problems for idea ${i + 1}`),
              { step: "problemAnalysis", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }
          agentContext.problemGaps = problemGaps;

          // Step 4: Enhanced Competitive Intelligence
          console.log(`🏆 Step 4: Enhanced Competitive Intelligence (Idea ${i + 1})`);
          const competitive = await this.competitiveIntelligenceAgent(agentContext);
          if (!competitive) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to research competition for idea ${i + 1}`),
              { step: "competitiveIntelligence", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }
          agentContext.competitive = competitive;

          // Step 5: Enhanced Monetization Strategy
          console.log(`💰 Step 5: Enhanced Monetization Strategy (Idea ${i + 1})`);
          const monetization = await this.monetizationAgent(agentContext);
          if (!monetization) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to design monetization for idea ${i + 1}`),
              { step: "monetization", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }
          agentContext.monetization = monetization;

          // Step 6: Generate what to build
          console.log(`🛠️ Step 6: What To Build Analysis (Idea ${i + 1})`);
          const whatToBuild = await this.whatToBuildAgent(agentContext);
          agentContext.whatToBuild = whatToBuild || undefined;

          // Step 7: Initial idea synthesis
          console.log(`🧠 Step 7: Initial Idea Synthesis (Idea ${i + 1})`);
          const initialIdea = await this.ideaSynthesisAgent(agentContext);
          if (!initialIdea) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to synthesize initial idea ${i + 1}`),
              { step: "initialSynthesis", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }

          // Step 8: Critic Agent - Analyze and create refinement prompt
          console.log(`🔍 Step 8: Critic Agent Analysis (Idea ${i + 1})`);
          const refinementPrompt = await this.criticAgent([initialIdea], agentContext);

          // Step 9: Final Refined Synthesis - Apply critic feedback
          console.log(`🎨 Step 9: Final Refined Idea Synthesis (Idea ${i + 1})`);
          const finalIdea = await this.ideaSynthesisAgent(agentContext, refinementPrompt || undefined);
          if (!finalIdea) {
            debugLogger.logError(
              "generateIdeasOnDemand",
              new Error(`Failed to create final refined idea ${i + 1}`),
              { step: "finalSynthesis", ideaNumber: i + 1, userPrompt }
            );
            continue;
          }

          // Step 10: Save to UserGeneratedIdea table
          console.log(`💾 Step 10: Saving User Generated Idea ${i + 1} to Database`);
          const savedIdea = await prisma.userGeneratedIdea.create({
            data: {
              userId,
              prompt: userPrompt,
              title: finalIdea.title,
              description: finalIdea.description,
              executiveSummary: finalIdea.executiveSummary,
              problemStatement: finalIdea.problemStatement,
              narrativeHook: finalIdea.narrativeHook,
              tags: finalIdea.tags,
              confidenceScore: finalIdea.confidenceScore,
              fullIdeaDataJson: JSON.stringify({
                ...finalIdea,
                trends,
                problemGaps,
                competitive,
                monetization,
                whatToBuild,
              }),
            },
          });

          generatedIdeas.push(savedIdea);
          console.log(`✅ Successfully generated and saved idea ${i + 1}: ${finalIdea.title}`);

        } catch (error) {
          console.error(`❌ Failed to generate idea ${i + 1}:`, error);
          debugLogger.logError(`On-demand idea generation ${i + 1}`, error as Error, {
            userPrompt,
            userId,
            ideaNumber: i + 1,
          });
          // Continue to next idea even if one fails
        }
      }

      console.log(`🎉 On-Demand Idea Generation Completed. Generated ${generatedIdeas.length} ideas.`);
      debugLogger.info("🎉 On-demand idea generation completed", {
        userPrompt,
        userId,
        generatedCount: generatedIdeas.length,
        pipelineVersion: "2.0-on-demand",
      });

      return generatedIdeas;
    } catch (error) {
      console.error("❌ On-Demand Idea Generation Failed:", error);
      debugLogger.logError("On-Demand Idea Generation", error as Error, {
        userPrompt,
        userId,
        pipelineVersion: "2.0-on-demand",
        failurePoint: "pipeline execution",
      });
      return [];
    }
  },

  /**
   * Enhanced Master Orchestration - Runs complete enhanced idea generation pipeline
   * Implements modern multi-agent architecture with critique and refinement
   */
  async generateDailyIdea(): Promise<string | null> {
    try {
      console.log("🚀 Starting Enhanced Daily Idea Generation Pipeline");
      debugLogger.info("🚀 Enhanced daily idea generation started", {
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(),
        version: "2.0-enhanced",
      });

      // Get previous ideas for diversity enforcement
      const previousIdeas = await IdeaGenerationAgentService.getDailyIdeas();
      debugLogger.info("📚 Retrieved previous ideas for diversity context", {
        previousIdeasCount: previousIdeas.length,
      });

      const previousIdeaSummaries = previousIdeas.map((idea: any) => ({
        title: idea.title,
        description: idea.description,
      }));

      // Initialize enhanced agent context
      const agentContext: AgentContext = {
        previousIdeas: previousIdeaSummaries,
      };

      // Step 1: Master Research Director - Set today's research parameters
      console.log("🎯 Step 1: Activating Master Research Director");
      const researchDirection = await this.masterResearchDirector(agentContext);

      // Step 2: Enhanced Trend Research - Guided by research director
      console.log("📈 Step 2: Enhanced Trend Research");
      debugLogger.info(
        "📈 Starting enhanced trend research with research direction"
      );
      const trends = await this.trendResearchAgent(
        agentContext,
        researchDirection || undefined
      );
      if (!trends) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to research trends"),
          { step: "enhancedTrendResearch" }
        );
        throw new Error("Failed to research trends");
      }
      agentContext.trends = trends;
      debugLogger.info("✅ Enhanced trend research completed", { trends });

      // Step 3: Enhanced Problem Gap Analysis - Deep persona-specific problems
      console.log("🎯 Step 3: Enhanced Problem Gap Analysis");
      debugLogger.info("🎯 Starting enhanced problem gap analysis");
      const problemGaps = await this.problemGapAgent(agentContext);
      if (!problemGaps) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to analyze problems"),
          { step: "enhancedProblemAnalysis", trends }
        );
        throw new Error("Failed to analyze problems");
      }
      agentContext.problemGaps = problemGaps;
      debugLogger.info("✅ Enhanced problem gap analysis completed", {
        problemGaps,
      });

      // Step 4: Enhanced Competitive Intelligence - Strategic positioning
      console.log("🏆 Step 4: Enhanced Competitive Intelligence");
      debugLogger.info("🏆 Starting enhanced competitive intelligence");
      const competitive = await this.competitiveIntelligenceAgent(agentContext);
      if (!competitive) {
        debugLogger.logError(
          "generateDailyIdea",
          new Error("Failed to research competition"),
          { step: "enhancedCompetitive" }
        );
        throw new Error("Failed to research competition");
      }
      agentContext.competitive = competitive;
      debugLogger.info("✅ Enhanced competitive intelligence completed", {
        competitive,
      });

      // Step 5: Enhanced Monetization Strategy
      console.log("💰 Step 5: Enhanced Monetization Strategy");
      const monetization = await this.monetizationAgent(agentContext);
      if (!monetization) throw new Error("Failed to design monetization");
      agentContext.monetization = monetization;

      // Step 6: Generate initial idea synthesis
      console.log("🧠 Step 6: Initial Idea Synthesis");
      const whatToBuild = await this.whatToBuildAgent(agentContext);
      agentContext.whatToBuild = whatToBuild || undefined;
      const initialIdea = await this.ideaSynthesisAgent(agentContext);
      if (!initialIdea) throw new Error("Failed to synthesize initial idea");

      // Step 7: Critic Agent - Analyze and create refinement prompt
      console.log("🔍 Step 7: Critic Agent Analysis");
      const refinementPrompt = await this.criticAgent(
        [initialIdea],
        agentContext
      );

      // Step 8: Final Refined Synthesis - Apply critic feedback
      console.log("🎨 Step 8: Final Refined Idea Synthesis");
      const finalIdea = await this.ideaSynthesisAgent(
        agentContext,
        refinementPrompt || undefined
      );
      if (!finalIdea) throw new Error("Failed to create final refined idea");

      const idea = finalIdea;

      // Step 9: Save to database
      console.log("💾 Step 9: Saving Enhanced Idea to Database");
      const whyNow = await IdeaGenerationAgentService.createWhyNow(trends);
      const ideaScore = await IdeaGenerationAgentService.createIdeaScore(
        idea.scoring
      );
      const monetizationStrategy =
        await IdeaGenerationAgentService.createMonetizationStrategy(
          monetization
        );

      // Handle the circular dependency between DailyIdea and WhatToBuild using transaction
      let dailyIdea: any;

      if (whatToBuild) {
        // Use a transaction to handle the circular dependency
        dailyIdea = await prisma.$transaction(async (tx) => {
          // First create DailyIdea without whatToBuildId
          const createdIdea = await tx.dailyIdea.create({
            data: {
              title: idea.title,
              description: idea.description,
              executiveSummary: idea.executiveSummary,
              problemSolution: idea.problemSolution,
              problemStatement: idea.problemStatement,
              innovationLevel: idea.innovationLevel,
              timeToMarket: idea.timeToMarket,
              confidenceScore: idea.confidenceScore,
              narrativeHook: idea.narrativeHook,
              targetKeywords: idea.targetKeywords,
              urgencyLevel: idea.urgencyLevel,
              executionComplexity: idea.executionComplexity,
              tags: idea.tags,
              whyNowId: whyNow.id,
              ideaScoreId: ideaScore.id,
              monetizationStrategyId: monetizationStrategy.id,
            },
          });

          // Then create WhatToBuild with the actual DailyIdea ID
          const createdWhatToBuild = await tx.whatToBuild.create({
            data: {
              platformDescription: whatToBuild.platformDescription,
              coreFeaturesSummary: whatToBuild.coreFeaturesSummary,
              userInterfaces: whatToBuild.userInterfaces,
              keyIntegrations: whatToBuild.keyIntegrations,
              pricingStrategyBuildRecommendation:
                whatToBuild.pricingStrategyBuildRecommendation,
              dailyIdeaId: createdIdea.id,
            },
          });

          // Finally update DailyIdea to include the whatToBuildId
          const updatedIdea = await tx.dailyIdea.update({
            where: { id: createdIdea.id },
            data: { whatToBuildId: createdWhatToBuild.id },
          });

          return updatedIdea;
        });
      } else {
        // Create DailyIdea without WhatToBuild
        dailyIdea = await IdeaGenerationAgentService.createDailyIdea(
          idea,
          whyNow.id,
          ideaScore.id,
          monetizationStrategy.id
        );
      }

      // Create related entities
      if (problemGaps.gaps.length > 0) {
        await IdeaGenerationAgentService.createMarketGap(
          problemGaps.gaps[0],
          dailyIdea.id
        );
      }

      await IdeaGenerationAgentService.createMarketCompetition(
        competitive.competition,
        dailyIdea.id
      );
      await IdeaGenerationAgentService.createStrategicPositioning(
        competitive.positioning,
        dailyIdea.id
      );

      // Create new related entities for execution plan, traction signals, and framework fit
      if (idea.executionPlan) {
        await IdeaGenerationAgentService.createExecutionPlan(
          idea.executionPlan,
          dailyIdea.id
        );
      }

      if (idea.tractionSignals) {
        await IdeaGenerationAgentService.createTractionSignals(
          idea.tractionSignals,
          dailyIdea.id
        );
      }

      if (idea.frameworkFit) {
        await IdeaGenerationAgentService.createFrameworkFit(
          idea.frameworkFit,
          dailyIdea.id
        );
      }

      console.log(
        "🎉 Enhanced Daily Idea Generated Successfully:",
        dailyIdea.id
      );
      console.log("📊 Final Idea Summary:", {
        title: idea.title,
        confidenceScore: idea.confidenceScore,
        urgencyLevel: idea.urgencyLevel,
        totalScore: idea.scoring.totalScore,
        timeToMarket: idea.timeToMarket,
        tags: idea.tags,
      });

      debugLogger.info(
        "🎉 Enhanced daily idea generation completed successfully",
        {
          ideaId: dailyIdea.id,
          pipelineVersion: "2.0-enhanced",
          totalSteps: 9,
          idea: {
            title: idea.title,
            confidenceScore: idea.confidenceScore,
            urgencyLevel: idea.urgencyLevel,
          },
        }
      );

      return dailyIdea.id;
    } catch (error) {
      console.error("❌ Enhanced Daily Idea Generation Failed:", error);
      debugLogger.logError("Enhanced Daily Idea Generation", error as Error, {
        pipelineVersion: "2.0-enhanced",
        failurePoint: "pipeline execution",
      });
      return null;
    }
  },
};

export default IdeaGenerationAgentController;
