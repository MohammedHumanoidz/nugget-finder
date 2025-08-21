import { task } from "@trigger.dev/sdk/v3";
import IdeaGenerationAgentController from "../apps/idea-generation-agent/idea-generation-agent.controller";
import {
	GENERATION_STEPS,
	getCompletionStep,
	getStepForIdeaGeneration,
} from "../constants/generation-steps";
import type { AgentContext } from "../types/apps/idea-generation-agent";
import { prisma } from "../utils/configs/db.config";
import { debugLogger } from "../utils/logger";
import { safeUuidArray } from "../utils/safe-json-parser";

export const onDemandIdeaGenerationJob = task({
	id: "on-demand-idea-generator",
	run: async (payload: {
		requestId: string;
		userPrompt: string;
		userId: string;
	}) => {
		const { requestId, userPrompt, userId } = payload;

		try {
			console.log(
				`🚀 Starting On-Demand Idea Generation for request: ${requestId}`,
			);
			debugLogger.info("🚀 On-demand idea generation background job started", {
				requestId,
				userPrompt,
				userId,
				timestamp: new Date().toISOString(),
			});

			// Update status to RUNNING
			await prisma.ideaGenerationRequest.update({
				where: { id: requestId },
				data: {
					status: "RUNNING",
					currentStep: "Starting Research",
					progressMessage: "Initializing idea generation pipeline...",
					imageState: "confused",
				},
			});

			const generatedIdeas = [];

			// Generate 3 ideas for the user
			for (let i = 0; i < 3; i++) {
				console.log(
					`🎯 Generating idea ${i + 1} of 3 for prompt: "${userPrompt}"`,
				);

				try {
					// Update progress for this idea iteration
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: `Generating idea ${i + 1}/3`,
							progressMessage: `Working on your ${i === 0 ? "first" : i === 1 ? "second" : "third"} business opportunity...`,
							imageState: "confused",
						},
					});

					// Initialize agent context with user prompt
					const agentContext: AgentContext = {
						userPrompt,
						previousIdeas: [], // Clean slate for each on-demand generation
					};

					// Step 1: Master Research Director
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Research Direction",
							progressMessage:
								"Setting research direction based on your prompt...",
							imageState: "confused",
						},
					});

					const researchDirection =
						await IdeaGenerationAgentController.masterResearchDirector(
							agentContext,
						);

					// Step 2: Trend Research
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Trend Research",
							progressMessage: "Analyzing market trends and opportunities...",
							imageState: "digging",
						},
					});

					const trends = await IdeaGenerationAgentController.trendResearchAgent(
						agentContext,
						researchDirection || undefined,
					);
					if (!trends) {
						throw new Error(`Failed to research trends for idea ${i + 1}`);
					}
					agentContext.trends = trends;

					// Step 3: Problem Gap Analysis
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Problem Analysis",
							progressMessage:
								"Uncovering critical market gaps and pain points...",
							imageState: "digging",
						},
					});

					const problemGaps =
						await IdeaGenerationAgentController.problemGapAgent(agentContext);
					if (!problemGaps) {
						throw new Error(`Failed to analyze problems for idea ${i + 1}`);
					}
					agentContext.problemGaps = problemGaps;

					// Step 4: Competitive Intelligence
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Competitive Analysis",
							progressMessage:
								"Mapping competitive landscape and strategic positioning...",
							imageState: "digging",
						},
					});

					const competitive =
						await IdeaGenerationAgentController.competitiveIntelligenceAgent(
							agentContext,
						);
					if (!competitive) {
						throw new Error(`Failed to research competition for idea ${i + 1}`);
					}
					agentContext.competitive = competitive;

					// Step 5: Monetization Strategy
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Monetization Strategy",
							progressMessage:
								"Architecting sustainable monetization strategies...",
							imageState: "digging",
						},
					});

					const monetization =
						await IdeaGenerationAgentController.monetizationAgent(agentContext);
					if (!monetization) {
						throw new Error(`Failed to design monetization for idea ${i + 1}`);
					}
					agentContext.monetization = monetization;

					// Step 6: What To Build
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Technical Planning",
							progressMessage:
								"Blueprinting technical implementation and MVP roadmap...",
							imageState: "digging",
						},
					});

					const whatToBuild =
						await IdeaGenerationAgentController.whatToBuildAgent(agentContext);
					agentContext.whatToBuild = whatToBuild || undefined;

					// Step 7: Initial Synthesis
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Idea Synthesis",
							progressMessage:
								"Weaving insights into breakthrough business opportunities...",
							imageState: "happy",
						},
					});

					const initialIdea =
						await IdeaGenerationAgentController.ideaSynthesisAgent(
							agentContext,
						);
					if (!initialIdea) {
						throw new Error(`Failed to synthesize initial idea ${i + 1}`);
					}

					// Step 8: Critic Analysis
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Critical Review",
							progressMessage:
								"Examining opportunity through expert critical lens...",
							imageState: "happy",
						},
					});

					const refinementPrompt =
						await IdeaGenerationAgentController.criticAgent(
							[initialIdea],
							agentContext,
						);

					// Step 9: Final Synthesis
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Final Refinement",
							progressMessage:
								"Crafting your final breakthrough opportunity...",
							imageState: "happy",
						},
					});

					const finalIdea =
						await IdeaGenerationAgentController.ideaSynthesisAgent(
							agentContext,
							refinementPrompt || undefined,
						);
					if (!finalIdea) {
						throw new Error(`Failed to create final refined idea ${i + 1}`);
					}

					// Step 10: Save to Database
					await prisma.ideaGenerationRequest.update({
						where: { id: requestId },
						data: {
							currentStep: "Saving Results",
							progressMessage: `Securing golden nugget ${i + 1} in your treasure vault...`,
							imageState: "found",
						},
					});

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
					console.log(
						`✅ Successfully generated and saved idea ${i + 1}: ${finalIdea.title}`,
					);
				} catch (error) {
					console.error(`❌ Failed to generate idea ${i + 1}:`, error);
					debugLogger.logError(
						`On-demand idea generation ${i + 1}`,
						error as Error,
						{
							requestId,
							userPrompt,
							userId,
							ideaNumber: i + 1,
						},
					);
					// Continue to next idea even if one fails
				}
			}

			// Update final status
			if (generatedIdeas.length > 0) {
				await prisma.ideaGenerationRequest.update({
					where: { id: requestId },
					data: {
						status: "COMPLETED",
						currentStep: "Complete",
						progressMessage: `🎉 Discovery complete! Found ${generatedIdeas.length} golden business nuggets for you!`,
						imageState: "found",
						generatedIdeaIds: generatedIdeas.map((idea) => idea.id),
					},
				});

				console.log(
					`🎉 On-Demand Idea Generation Completed. Generated ${generatedIdeas.length} ideas.`,
				);
				debugLogger.info(
					"🎉 On-demand idea generation background job completed",
					{
						requestId,
						userPrompt,
						userId,
						generatedCount: generatedIdeas.length,
					},
				);
			} else {
				await prisma.ideaGenerationRequest.update({
					where: { id: requestId },
					data: {
						status: "FAILED",
						currentStep: "Failed",
						progressMessage: "Failed to generate ideas. Please try again.",
						imageState: "confused",
						errorMessage: "No ideas were successfully generated",
					},
				});

				throw new Error("No ideas were successfully generated");
			}

			return {
				success: true,
				generatedCount: generatedIdeas.length,
				ideaIds: generatedIdeas.map((idea) => idea.id),
			};
		} catch (error) {
			console.error(
				"❌ On-Demand Idea Generation Background Job Failed:",
				error,
			);

			// Update status to failed
			await prisma.ideaGenerationRequest.update({
				where: { id: requestId },
				data: {
					status: "FAILED",
					currentStep: "Failed",
					progressMessage: "Something went wrong. Please try again.",
					imageState: "confused",
					errorMessage:
						error instanceof Error ? error.message : "Unknown error",
				},
			});

			debugLogger.logError(
				"On-Demand Idea Generation Background Job",
				error as Error,
				{
					requestId,
					userPrompt,
					userId,
				},
			);

			throw error;
		}
	},
});
