import { schedules } from "@trigger.dev/sdk/v3";
import IdeaGenerationAgentController from "../apps/idea-generation-agent/idea-generation-agent.controller";
import { debugLogger } from "../utils/logger";

export const dailyIdeaGenerationJob = schedules.task({
	id: "daily-idea-generator",
	cron: "0 0 * * *", // Every day at midnight (00:00)
	run: async (payload) => {
		const startTime = Date.now();
		let successCount = 0;
		let errorCount = 0;
		const results: Array<{
			attempt: number;
			success: boolean;
			ideaId?: string;
			error?: string;
		}> = [];

		console.log("🚀 Starting daily idea generation job", {
			timestamp: new Date().toISOString(),
			targetCount: 4,
		});

		// Generate 4 ideas with proper error handling and delay between requests
		for (let i = 1; i <= 4; i++) {
			try {
				console.log(`💡 Generating idea ${i}/4...`);

				const ideaId = await IdeaGenerationAgentController.generateDailyIdea();

				if (ideaId) {
					successCount++;
					results.push({ attempt: i, success: true, ideaId });
					console.log(`✅ Idea ${i} generated successfully`, { ideaId });

					// Log to application logger as well
					debugLogger.info("Daily idea generation successful", {
						attempt: i,
						ideaId,
						timestamp: new Date().toISOString(),
					});
				} else {
					errorCount++;
					results.push({
						attempt: i,
						success: false,
						error: "generateDailyIdea returned null",
					});
					console.error(`❌ Idea ${i} generation failed: No idea ID returned`);

					debugLogger.logError(
						"Daily idea generation failed",
						new Error("generateDailyIdea returned null"),
						{
							attempt: i,
						},
					);
				}
			} catch (error) {
				errorCount++;
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				results.push({ attempt: i, success: false, error: errorMessage });

				console.error(`❌ Idea ${i} generation failed with error`, {
					error: errorMessage,
					stack: error instanceof Error ? error.stack : undefined,
				});

				debugLogger.logError("Daily idea generation failed", error as Error, {
					attempt: i,
				});
			}

			// Add delay between requests to avoid overwhelming the system (except for the last one)
			if (i < 4) {
				console.log("⏳ Waiting 10 seconds before next generation...");
				await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay
			}
		}

		const endTime = Date.now();
		const duration = endTime - startTime;

		const summary = {
			totalRequested: 4,
			successCount,
			errorCount,
			duration: `${duration}ms`,
			results,
		};

		if (successCount > 0) {
			console.log("🎉 Daily idea generation completed", summary);
			debugLogger.info("Daily idea generation job completed", {
				...summary,
				timestamp: new Date().toISOString(),
			});
		} else {
			console.error("💥 Daily idea generation failed completely", summary);
			debugLogger.logError(
				"Daily idea generation job failed completely",
				new Error("All idea generation attempts failed"),
				{
					...summary,
				},
			);
		}

		return summary;
	},
});
