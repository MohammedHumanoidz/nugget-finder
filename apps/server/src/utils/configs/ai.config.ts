import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { PerplexityResponse } from "@/types/config/ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const perplexity = async (
  userPrompt: string,
  systemPrompt: string,
  reasoning_effort: "low" | "medium" | "high" = "medium",
  model: "sonar" | "sonar-pro" | "sonar-deep-research" = "sonar"
): Promise<PerplexityResponse | undefined> => {
  try {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8000,
        search_mode: "web",
        ...(model === "sonar-deep-research" && { reasoning_effort }),
      }),
    };

    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options
    );

    if (!response.ok) {
      throw new Error(
        `Perplexity API error: ${response.status} ${response.statusText}`
      );
    }

    const data: PerplexityResponse = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export { openrouter, perplexity };
