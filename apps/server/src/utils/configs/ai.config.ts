import { createPerplexity } from "@ai-sdk/perplexity";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import type { PerplexityResponse } from "../../types/config/ai";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const perplexityProvider = createPerplexity({
	apiKey: process.env.PERPLEXITY_API_KEY,
});

const perplexity = async (
	userPrompt: string,
	systemPrompt: string,
	reasoning_effort: "low" | "medium" | "high" = "medium",
	model: "sonar" | "sonar-pro" | "sonar-deep-research" = "sonar",
	maxRetries = 2
): Promise<PerplexityResponse | undefined> => {
	try {
		console.log("🔍 Perplexity AI SDK request:", {
			model,
			reasoning_effort,
			systemPromptLength: systemPrompt.length,
			userPromptLength: userPrompt.length,
		});

		const result = await generateText({
			model: perplexityProvider(model),
			system: systemPrompt,
			prompt: userPrompt,
			maxRetries,
			...(model === "sonar-deep-research" && {
				providerOptions: {
					perplexity: {
						reasoning_effort,
					},
				},
			}),
		});

		// Convert AI SDK response to match PerplexityResponse type
		const perplexityMetadata = result.providerMetadata?.perplexity as any;
		const response: PerplexityResponse = {
			id: result.response.id,
			model: result.response.modelId,
			created: Math.floor(result.response.timestamp.getTime() / 1000),
			usage: {
				prompt_tokens: result.usage.inputTokens ?? 0,
				completion_tokens: result.usage.outputTokens ?? 0,
				total_tokens: result.usage.totalTokens ?? 0,
				search_context_size: "0",
				citation_tokens: perplexityMetadata?.usage?.citationTokens || 0,
				num_search_queries: perplexityMetadata?.usage?.numSearchQueries || 0,
				reasoning_tokens: 0,
			},
			object: "chat.completion",
			choices: [
				{
					index: 0,
					finish_reason: result.finishReason || "stop",
					message: {
						content: result.text,
						role: "assistant",
					},
				},
			],
			citations: result.sources?.map(source => source.sourceType === "url" ? source.url : "") || [],
			search_results: result.sources?.map(source => ({
				title: source.title ?? "",
				url: source.sourceType === "url" ? source.url : "",
				date: new Date().toISOString(),
			})) || [],
		};

		console.log("✅ Perplexity AI SDK request successful:", {
			model,
			hasResponse: !!result.text,
			tokenUsage: result.usage,
		});

		return response;
	} catch (error) {
		console.error("❌ Perplexity AI SDK request failed:", {
			error: error instanceof Error ? error.message : String(error),
			model,
		});
		return undefined;
	}
};

export { openrouter, perplexity };
