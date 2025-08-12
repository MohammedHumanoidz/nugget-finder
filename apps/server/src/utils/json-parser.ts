/**
 * Robust JSON parser utility for extracting and parsing JSON from various text formats
 * Handles LLM responses that may contain JSON in markdown, with extra text, or formatting issues
 */

export interface ParseResult<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	rawContent?: string;
}

/**
 * Check if content is already valid JSON
 * @param content - Content to check
 * @returns True if content is already valid JSON
 */
function isAlreadyValidJson(content: string): boolean {
	try {
		const trimmed = content.trim();
		if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
			JSON.parse(trimmed);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

/**
 * Attempts to extract and parse JSON from content using multiple strategies
 * @param content - Raw content that may contain JSON
 * @param fallbackData - Optional fallback data to return if parsing fails
 * @returns ParseResult with success status and parsed data or error
 */
export function parseStructuredResponse<T = any>(
	content: string,
	fallbackData?: T,
): ParseResult<T> {
	if (!content || typeof content !== "string") {
		return {
			success: false,
			error: "Invalid content provided for JSON parsing",
			rawContent: content,
		};
	}

	// Strategy 0: Check if content is already valid JSON
	if (isAlreadyValidJson(content)) {
		try {
			const parsed = JSON.parse(content.trim());
			return {
				success: true,
				data: parsed,
				rawContent: content,
			};
		} catch (error) {
			// Continue to other strategies if this fails
		}
	}

	const strategies = [
		extractFromJsonCodeBlock,
		extractFromGenericCodeBlock,
		extractFromJsonObject,
		extractFromCleanedContent,
		extractFromAdvancedCleaning,
		extractDirectParse,
	];

	for (const strategy of strategies) {
		try {
			const jsonString = strategy(content);
			if (jsonString) {
				const parsed = JSON.parse(jsonString);
				return {
					success: true,
					data: parsed,
					rawContent: content,
				};
			}
		} catch (error) {
			// Continue to next strategy
		}
	}

	// If all strategies fail, return fallback if provided
	if (fallbackData) {
		return {
			success: false,
			data: fallbackData,
			error: "Failed to parse JSON, using fallback data",
			rawContent: content,
		};
	}

	return {
		success: false,
		error: "Failed to extract valid JSON from content using all strategies",
		rawContent: content,
	};
}

/**
 * Strategy 1: Extract JSON from ```json code blocks
 */
function extractFromJsonCodeBlock(content: string): string | null {
	const jsonBlockPattern = /```json\s*([\s\S]*?)\s*```/gi;
	const match = jsonBlockPattern.exec(content);
	if (match?.[1]) {
		return match[1].trim();
	}
	return null;
}

/**
 * Strategy 2: Extract JSON from generic ``` code blocks
 */
function extractFromGenericCodeBlock(content: string): string | null {
	const codeBlockPattern = /```\s*([\s\S]*?)\s*```/gi;
	const matches = Array.from(content.matchAll(codeBlockPattern));

	for (const match of matches) {
		const candidate = match[1]?.trim();
		if (candidate && isLikelyJson(candidate)) {
			return candidate;
		}
	}
	return null;
}

/**
 * Strategy 3: Look for JSON objects in the content (find { ... })
 */
function extractFromJsonObject(content: string): string | null {
	// Find the first opening brace and the last closing brace
	const firstBrace = content.indexOf("{");
	const lastBrace = content.lastIndexOf("}");

	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		const candidate = content.substring(firstBrace, lastBrace + 1);
		if (isLikelyJson(candidate)) {
			return candidate;
		}
	}
	return null;
}

/**
 * Strategy 4: Clean content and try again
 */
function extractFromCleanedContent(content: string): string | null {
	let cleaned = content;

	// Remove common non-JSON patterns
	const cleaningPatterns = [
		/<think>[\s\S]*?<\/think>/gi, // Remove thinking blocks
		/^[\s\S]*?(?=\{)/m, // Remove everything before first {
		/<[^>]*>/g, // Remove HTML tags
		/^[^{]*$/gm, // Remove lines without {
	];

	for (const pattern of cleaningPatterns) {
		cleaned = cleaned.replace(pattern, "").trim();
	}

	// Try to find JSON object in cleaned content
	if (cleaned.startsWith("{") && cleaned.includes("}")) {
		const firstBrace = cleaned.indexOf("{");
		const lastBrace = cleaned.lastIndexOf("}");

		if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
			const candidate = cleaned.substring(firstBrace, lastBrace + 1);
			if (isLikelyJson(candidate)) {
				return candidate;
			}
		}
	}

	return null;
}

/**
 * Strategy 5: Advanced cleaning for LLM responses with extra formatting
 */
function extractFromAdvancedCleaning(content: string): string | null {
	let cleaned = content;

	// Remove markdown code block indicators
	cleaned = cleaned.replace(/```json\s*/gi, "");
	cleaned = cleaned.replace(/```\s*/g, "");
	
	// Remove common prefixes that LLMs add
	cleaned = cleaned.replace(/^(here's|here is|the)\s+.*?:\s*/i, "");
	cleaned = cleaned.replace(/^(response|json|output|result|answer):\s*/i, "");
	
	// Remove text before the first brace
	const firstBraceIndex = cleaned.indexOf("{");
	if (firstBraceIndex > 0) {
		cleaned = cleaned.substring(firstBraceIndex);
	}
	
	// Remove text after the last brace
	const lastBraceIndex = cleaned.lastIndexOf("}");
	if (lastBraceIndex !== -1 && lastBraceIndex < cleaned.length - 1) {
		cleaned = cleaned.substring(0, lastBraceIndex + 1);
	}
	
	// Clean up trailing commas
	cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
	
	// Remove comments
	cleaned = cleaned.replace(/\/\/.*$/gm, "");
	cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");
	
	cleaned = cleaned.trim();
	
	if (isLikelyJson(cleaned)) {
		return cleaned;
	}
	
	return null;
}

/**
 * Strategy 6: Try parsing content directly
 */
function extractDirectParse(content: string): string | null {
	const trimmed = content.trim();
	if (isLikelyJson(trimmed)) {
		return trimmed;
	}
	return null;
}

/**
 * Helper function to check if a string looks like JSON
 */
function isLikelyJson(str: string): boolean {
	if (!str || typeof str !== "string") return false;

	const trimmed = str.trim();

	// Must start with { and end with }
	if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
		return false;
	}

	// Must contain quotes (JSON requires quoted strings)
	if (!trimmed.includes('"')) {
		return false;
	}

	// Should be reasonably long (more than just {})
	if (trimmed.length < 10) {
		return false;
	}

	// Count braces to ensure they're balanced
	let braceCount = 0;
	for (const char of trimmed) {
		if (char === "{") braceCount++;
		if (char === "}") braceCount--;
	}

	return braceCount === 0;
}

/**
 * Intelligently handle responses that may be JSON or need LLM structuring
 * @param content - Raw content from Perplexity (could be JSON or markdown)
 * @param structureWithLLM - Function to structure content using LLM if needed
 * @param expectedFields - Array of required field names to validate
 * @param fallbackData - Fallback data if parsing fails
 */
export async function parsePerplexityResponse<T = any>(
	content: string,
	structureWithLLM: (content: string) => Promise<string>,
	expectedFields: string[] = [],
	fallbackData?: T,
): Promise<ParseResult<T>> {
	console.log("🔍 Checking if Perplexity response is already JSON...");

	// First, check if content is already valid JSON
	if (isAlreadyValidJson(content)) {
		console.log("✅ Content is already valid JSON, using directly");
		const result = parseStructuredResponse<T>(content, fallbackData);

		if (
			result.success &&
			result.data &&
			expectedFields.length > 0 &&
			typeof result.data === "object" &&
			result.data !== null
		) {
			// Validate that expected fields are present
			const missingFields = expectedFields.filter(
				(field) => !(field in (result.data as Record<string, any>)),
			);

			if (missingFields.length > 0) {
				console.log(`⚠️ Missing required fields: ${missingFields.join(", ")}`);
				return {
					success: false,
					data: fallbackData,
					error: `Missing required fields: ${missingFields.join(", ")}`,
					rawContent: content,
				};
			}
		}

		return result;
	}

	// If not JSON, use LLM to structure it
	console.log("🔄 Content is not JSON, using LLM to structure...");
	try {
		const structuredContent = await structureWithLLM(content);
		console.log(
			"🔍 LLM structured response:",
			`${structuredContent.substring(0, 300)}...`,
		);

		const result = parseStructuredResponse<T>(structuredContent, fallbackData);

		if (
			result.success &&
			result.data &&
			expectedFields.length > 0 &&
			typeof result.data === "object" &&
			result.data !== null
		) {
			// Validate that expected fields are present
			const missingFields = expectedFields.filter(
				(field) => !(field in (result.data as Record<string, any>)),
			);

			if (missingFields.length > 0) {
				console.log(`⚠️ Missing required fields: ${missingFields.join(", ")}`);
				return {
					success: false,
					data: fallbackData,
					error: `Missing required fields: ${missingFields.join(", ")}`,
					rawContent: content,
				};
			}
		}

		return result;
	} catch (error) {
		console.error("❌ LLM structuring failed:", error);
		return {
			success: false,
			data: fallbackData,
			error: `LLM structuring failed: ${(error as Error).message}`,
			rawContent: content,
		};
	}
}

/**
 * Specialized parser for LLM-generated content that may have formatting issues
 * @param content - Raw LLM response
 * @param expectedFields - Array of required field names to validate
 * @param fallbackData - Fallback data if parsing fails
 */
export function parseLLMResponse<T = any>(
	content: string,
	expectedFields: string[] = [],
	fallbackData?: T,
): ParseResult<T> {
	const result = parseStructuredResponse<T>(content, fallbackData);

	if (
		result.success &&
		result.data &&
		expectedFields.length > 0 &&
		typeof result.data === "object" &&
		result.data !== null
	) {
		// Validate that expected fields are present
		const missingFields = expectedFields.filter(
			(field) => !(field in (result.data as Record<string, any>)),
		);

		if (missingFields.length > 0) {
			return {
				success: false,
				data: fallbackData,
				error: `Missing required fields: ${missingFields.join(", ")}`,
				rawContent: content,
			};
		}
	}

	return result;
}

/**
 * Debug utility to log detailed information about JSON parsing failures
 * @param content - Original content that failed to parse
 * @param error - The error that occurred
 * @param context - Additional context about where the parsing failed
 */
export function debugJsonParsingFailure(
	content: string,
	error: string,
	context = "Unknown",
): void {
	console.log(`🐛 JSON Parsing Debug for ${context}:`);
	console.log(`📏 Content length: ${content.length}`);
	console.log(`🚫 Error: ${error}`);
	
	// Show first and last 200 characters
	console.log(`🔍 First 200 chars: ${content.substring(0, 200)}...`);
	if (content.length > 400) {
		console.log(`🔍 Last 200 chars: ...${content.substring(content.length - 200)}`);
	}
	
	// Check for common issues
	const firstBrace = content.indexOf("{");
	const lastBrace = content.lastIndexOf("}");
	console.log(`🔧 First brace at: ${firstBrace}, Last brace at: ${lastBrace}`);
	
	// Count braces
	const openBraces = (content.match(/{/g) || []).length;
	const closeBraces = (content.match(/}/g) || []).length;
	console.log(`🔧 Open braces: ${openBraces}, Close braces: ${closeBraces}`);
	
	// Check for markdown indicators
	const hasMarkdown = content.includes("```");
	const hasJsonMarkdown = content.includes("```json");
	console.log(`🔧 Has markdown: ${hasMarkdown}, Has JSON markdown: ${hasJsonMarkdown}`);
	
	// Check for quotes
	const doubleQuotes = (content.match(/"/g) || []).length;
	const singleQuotes = (content.match(/'/g) || []).length;
	console.log(`🔧 Double quotes: ${doubleQuotes}, Single quotes: ${singleQuotes}`);
}