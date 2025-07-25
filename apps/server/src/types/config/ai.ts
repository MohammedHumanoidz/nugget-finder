export type PerplexityResponse = {
	id: string;
	model: string;
	created: number;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
		search_context_size: string;
		citation_tokens: number;
		num_search_queries: number;
		reasoning_tokens: number;
	};
	object: "chat.completion";
	choices: Array<{
		index: number;
		finish_reason: string;
		message: {
			content: string;
			role: string;
		};
	}>;
	citations: string[];
	search_results: Array<{
		title: string;
		url: string;
		date: string;
	}>;
};
