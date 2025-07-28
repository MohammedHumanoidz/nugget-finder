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
): Promise<PerplexityResponse | undefined> => {
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
			messageCount: requestBody.messages.length,
			systemPromptLength: systemPrompt.length,
			userPromptLength: userPrompt.length
		});

		const options = {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		};

		const response = await fetch(
			"https://api.perplexity.ai/chat/completions",
			options,
		);

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
		return data;
	} catch (error) {
		console.error(error);
		return undefined;
	}
};

export { openrouter, perplexity };
