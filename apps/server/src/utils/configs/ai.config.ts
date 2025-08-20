import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { PerplexityResponse } from "../../types/config/ai";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const perplexity = async (
	userPrompt: string,
	systemPrompt: string,
	reasoning_effort: "low" | "medium" | "high" = "medium",
	model: "sonar" | "sonar-pro" | "sonar-deep-research" = "sonar",
	maxRetries: number = 2
): Promise<PerplexityResponse | undefined> => {
	// Set timeout based on model and reasoning effort
	const getTimeout = () => {
		if (model === "sonar-deep-research") {
			switch (reasoning_effort) {
				case "high": return 180000; // 3 minutes for high effort deep research
				case "medium": return 120000; // 2 minutes for medium effort
				case "low": return 90000; // 1.5 minutes for low effort
			}
		}
		return 60000; // 1 minute for regular models
	};

	const timeout = getTimeout();
	
	for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
		try {
			const requestBody = {
				model: model,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				max_tokens: 8000,
				search_mode: "web",
				...(model === "sonar-deep-research" && { reasoning_effort }),
			};

			console.log("🔍 Perplexity API request:", {
				model,
				reasoning_effort,
				attempt,
				timeout: `${timeout / 1000}s`,
				messageCount: requestBody.messages.length,
				systemPromptLength: systemPrompt.length,
				userPromptLength: userPrompt.length,
			});

			// Create AbortController for timeout handling
			const abortController = new AbortController();
			const timeoutId = setTimeout(() => {
				abortController.abort();
			}, timeout);

			const options = {
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				signal: abortController.signal,
			};

			const response = await fetch(
				"https://api.perplexity.ai/chat/completions",
				options,
			);

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Perplexity API error response:", errorText);
				throw new Error(
					`Perplexity API error: ${response.status} ${response.statusText}`,
				);
			}

			const contentType = response.headers.get("content-type");
			if (!contentType?.includes("application/json")) {
				const responseText = await response.text();
				console.error("Non-JSON response from Perplexity:", responseText);
				throw new Error("Perplexity API returned non-JSON response");
			}

			const data: PerplexityResponse = await response.json();
			console.log("✅ Perplexity API request successful:", {
				model,
				attempt,
				hasResponse: !!data?.choices?.[0]?.message?.content
			});
			return data;
		} catch (error) {
			const isTimeoutError = error instanceof Error && (
				error.name === "AbortError" || 
				error.message.includes("timeout") ||
				error.message.includes("aborted")
			);

			console.error(`❌ Perplexity API attempt ${attempt} failed:`, {
				error: error instanceof Error ? error.message : String(error),
				isTimeoutError,
				willRetry: attempt <= maxRetries
			});

			// If it's a timeout error and we have retries left, try again
			if (isTimeoutError && attempt <= maxRetries) {
				console.log(`🔄 Retrying Perplexity request (attempt ${attempt + 1}/${maxRetries + 1}) in 2 seconds...`);
				await new Promise(resolve => setTimeout(resolve, 2000));
				continue;
			}

			// If it's not a timeout error or we're out of retries, return undefined
			console.error("🚫 Perplexity request failed after all attempts:", error);
			return undefined;
		}
	}
};

export { openrouter, perplexity };
