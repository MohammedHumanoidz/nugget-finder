/**
 * Safe JSON Parser with LLM Fallback
 * Provides robust JSON parsing with AI-powered repair for malformed JSON
 */

import { generateText } from "ai";
import { openrouter } from "./configs/ai.config";
import { debugLogger } from "./logger";

export interface SafeParseResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	originalText?: string;
	repairedText?: string;
	usedLLMRepair?: boolean;
}

export interface SchemaHint {
	expectedKeys?: string[];
	description?: string;
	example?: object;
}

export class SafeJsonParser {
	/**
	 * Parse JSON with LLM fallback for repair
	 */
	static async parseWithLLMFallback<T>(
		jsonString: string,
		context?: string,
		maxRetries = 1,
		schemaHint?: SchemaHint
	): Promise<SafeParseResult<T>> {
		try {
			// First attempt: direct parsing
			const parsed = JSON.parse(jsonString);
			return {
				success: true,
				data: parsed,
				originalText: jsonString,
				usedLLMRepair: false
			};
		} catch (error) {
			debugLogger.debug('JSON parsing failed, attempting LLM repair...', {
				error: error instanceof Error ? error.message : String(error),
				jsonPreview: jsonString.substring(0, 200)
			});

			// LLM repair attempt
			try {
				let repairPrompt: string;
				
				if (schemaHint && (schemaHint.expectedKeys || schemaHint.example)) {
					// Schema-aware repair for content restructuring
					repairPrompt = `The following content needs to be converted to valid JSON with a specific structure. The content may be in markdown or other format, but needs to be restructured into the expected JSON schema:

${context ? `Context: ${context}` : ''}

${schemaHint.description ? `Description: ${schemaHint.description}` : ''}

${schemaHint.expectedKeys ? `Expected JSON structure should have these top-level keys: ${schemaHint.expectedKeys.join(', ')}` : ''}

${schemaHint.example ? `Example of expected structure:\n${JSON.stringify(schemaHint.example, null, 2)}` : ''}

Content to convert:
${jsonString}

Rules:
1. Return ONLY a valid JSON object with the expected structure
2. Extract relevant information from the content and map it to the expected keys  
3. No markdown code blocks (\`\`\`json)
4. No explanations or additional text
5. If content is already JSON, fix syntax errors and restructure to match expected schema
6. Use arrays for list-like content, strings for descriptions

JSON:`;
				} else {
					// Standard JSON repair for syntax fixes
					repairPrompt = `The following JSON is malformed and needs to be fixed. Please fix it and return ONLY valid JSON with no explanations or markdown formatting:

${context ? `Context: ${context}` : ''}

Malformed JSON:
${jsonString}

Rules:
1. Return ONLY the corrected JSON object
2. No markdown code blocks (\`\`\`json)
3. No explanations or additional text
4. Preserve all original data and structure
5. Fix syntax errors like missing quotes, trailing commas, etc.

Corrected JSON:`;
				}

				const { text: repairedJson } = await generateText({
					model: openrouter("openai/gpt-4o-mini"),
					prompt: repairPrompt,
					temperature: 0.1,
					maxOutputTokens: 2000,
				});

				// Clean the LLM response
				const cleanedJson = SafeJsonParser.cleanLLMResponse(repairedJson);
				
				// Try parsing the repaired JSON
				const repairedParsed = JSON.parse(cleanedJson);
				
				debugLogger.debug('LLM successfully repaired JSON');
				return {
					success: true,
					data: repairedParsed,
					originalText: jsonString,
					repairedText: cleanedJson,
					usedLLMRepair: true
				};

			} catch (llmError) {
				debugLogger.logError('LLM JSON repair failed', llmError as Error, {
					originalError: error instanceof Error ? error.message : String(error),
					jsonPreview: jsonString.substring(0, 200)
				});

				return {
					success: false,
					error: `JSON parsing failed even with LLM repair: ${llmError instanceof Error ? llmError.message : String(llmError)}`,
					originalText: jsonString,
					usedLLMRepair: true
				};
			}
		}
	}

	/**
	 * Clean LLM response to extract pure JSON
	 */
	private static cleanLLMResponse(text: string): string {
		let cleaned = text.trim();

		// Remove markdown code blocks
		cleaned = cleaned.replace(/^```json\s*/i, "");
		cleaned = cleaned.replace(/^```\s*/, "");
		cleaned = cleaned.replace(/\s*```\s*$/, "");

		// Remove common prefixes and explanations
		cleaned = cleaned.replace(/^(here's the|here is the|the)\s+(corrected|fixed|repaired)?\s*(json)?:?\s*/i, "");
		cleaned = cleaned.replace(/^corrected json:?\s*/i, "");

		// Find the JSON object boundaries
		const firstBrace = cleaned.indexOf('{');
		const lastBrace = cleaned.lastIndexOf('}');
		
		if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
			cleaned = cleaned.substring(firstBrace, lastBrace + 1);
		}

		return cleaned.trim();
	}

	/**
	 * Safe wrapper for JSON.parse with better error handling
	 */
	static safeParse<T>(jsonString: string): SafeParseResult<T> {
		try {
			const parsed = JSON.parse(jsonString);
			return {
				success: true,
				data: parsed,
				originalText: jsonString,
				usedLLMRepair: false
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				originalText: jsonString,
				usedLLMRepair: false
			};
		}
	}

	/**
	 * Validate UUID string to prevent character-by-character parsing
	 */
	static validateUUID(value: any): string | null {
		if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
			return value;
		}
		return null;
	}

	/**
	 * Safe array handling to prevent character iteration over strings
	 */
	static ensureArray<T>(value: any): T[] {
		if (Array.isArray(value)) {
			return value;
		}
		if (typeof value === 'string') {
			// Don't iterate over string characters - return as single-item array
			return [value as unknown as T];
		}
		return [];
	}
}

/**
 * Convenience wrapper function for common usage
 */
export async function safeJsonParse<T>(
	jsonString: string,
	context?: string
): Promise<SafeParseResult<T>> {
	return SafeJsonParser.parseWithLLMFallback<T>(jsonString, context);
}

/**
 * Specific wrapper for UUID arrays to prevent character iteration
 */
export function safeUuidArray(value: any): string[] {
	if (Array.isArray(value)) {
		return value.filter(item => SafeJsonParser.validateUUID(item));
	}
	if (typeof value === 'string') {
		const uuid = SafeJsonParser.validateUUID(value);
		return uuid ? [uuid] : [];
	}
	return [];
}