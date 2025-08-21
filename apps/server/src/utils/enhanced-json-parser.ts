/**
 * Enhanced JSON Parser Utility
 * Handles various JSON response formats from LLMs including markdown code blocks,
 * extra text, and malformed responses with robust error handling and fallback strategies.
 * Now includes LLM-powered repair for maximum reliability.
 */

import { SafeJsonParser } from "./safe-json-parser";

export interface ParseResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	originalText?: string;
	cleanedText?: string;
}

export class EnhancedJsonParser {
	/**
	 * Main parsing function that attempts multiple strategies to extract valid JSON
	 * Now includes LLM repair as the ultimate fallback before using fallback data
	 */
	static async parseWithFallback<T>(
		rawText: string,
		requiredFields: string[] = [],
		fallbackData?: T,
	): Promise<ParseResult<T>> {
		try {
			// Store original for debugging
			const originalText = rawText;

			// Strategy 1: Try parsing as-is (fastest path)
			try {
				const directResult = JSON.parse(rawText);
				if (
					EnhancedJsonParser.validateRequiredFields(
						directResult,
						requiredFields,
					)
				) {
					return { success: true, data: directResult, originalText };
				}
			} catch (e) {
				// Continue to other strategies
			}

			// Strategy 2: Clean markdown code blocks and extra text
			const cleanedText = EnhancedJsonParser.cleanJsonResponse(rawText);
			if (cleanedText !== rawText) {
				try {
					const cleanedResult = JSON.parse(cleanedText);
					if (
						EnhancedJsonParser.validateRequiredFields(
							cleanedResult,
							requiredFields,
						)
					) {
						return {
							success: true,
							data: cleanedResult,
							originalText,
							cleanedText,
						};
					}
				} catch (e) {
					// Continue to other strategies
				}
			}

			// Strategy 3: Extract JSON from mixed content
			const extractedJson = EnhancedJsonParser.extractJsonFromText(rawText);
			if (extractedJson) {
				try {
					const extractedResult = JSON.parse(extractedJson);
					if (
						EnhancedJsonParser.validateRequiredFields(
							extractedResult,
							requiredFields,
						)
					) {
						return {
							success: true,
							data: extractedResult,
							originalText,
							cleanedText: extractedJson,
						};
					}
				} catch (e) {
					// Continue to other strategies
				}
			}

			// Strategy 4: Try to fix common JSON issues
			const fixedJson = EnhancedJsonParser.fixCommonJsonIssues(
				cleanedText || rawText,
			);
			if (fixedJson) {
				try {
					const fixedResult = JSON.parse(fixedJson);
					if (
						EnhancedJsonParser.validateRequiredFields(
							fixedResult,
							requiredFields,
						)
					) {
						return {
							success: true,
							data: fixedResult,
							originalText,
							cleanedText: fixedJson,
						};
					}
				} catch (e) {
					// Continue to fallback
				}
			}

			// Strategy 5: Try LLM repair as last resort before fallback
			try {
				console.warn("🤖 Attempting LLM repair for malformed JSON...");
				const llmResult = await SafeJsonParser.parseWithLLMFallback<T>(
					rawText,
					"EnhancedJsonParser LLM repair attempt"
				);
				
				if (llmResult.success && llmResult.data) {
					if (
						EnhancedJsonParser.validateRequiredFields(
							llmResult.data,
							requiredFields,
						)
					) {
						return {
							success: true,
							data: llmResult.data,
							originalText,
							cleanedText: llmResult.repairedText || "LLM repaired",
						};
					}
				}
			} catch (llmError) {
				console.warn("⚠️ LLM repair failed:", llmError);
			}

			// Strategy 6: Use fallback data if provided
			if (fallbackData) {
				console.warn("⚠️ Using fallback data due to JSON parsing failure");
				return {
					success: true,
					data: fallbackData,
					originalText,
					error: "Used fallback data due to parsing failure",
				};
			}

			// All strategies failed
			return {
				success: false,
				error: "All JSON parsing strategies failed",
				originalText,
				cleanedText: cleanedText || extractedJson || undefined,
			};
		} catch (error) {
			return {
				success: false,
				error: `Unexpected parsing error: ${error instanceof Error ? error.message : String(error)}`,
				originalText: rawText,
			};
		}
	}

	/**
	 * Clean common markdown and formatting issues from JSON responses
	 */
	static cleanJsonResponse(text: string): string {
		let cleaned = text.trim();

		// Remove markdown code blocks
		cleaned = cleaned.replace(/^```json\s*/i, "");
		cleaned = cleaned.replace(/^```\s*/, "");
		cleaned = cleaned.replace(/\s*```\s*$/, "");

		// Remove common prefixes
		cleaned = cleaned.replace(
			/^(here's the json|here is the json|json response|response):\s*/i,
			"",
		);
		cleaned = cleaned.replace(/^(the|here's|here is)\s+.*?:\s*/i, "");

		// Remove trailing explanatory text after JSON
		// Find the last closing brace and trim everything after it
		const lastBraceIndex = cleaned.lastIndexOf("}");
		const firstBraceIndex = cleaned.indexOf("{");
		if (lastBraceIndex > firstBraceIndex) {
			cleaned = cleaned.substring(0, lastBraceIndex + 1);
		}

		// Clean up whitespace
		cleaned = cleaned.trim();

		return cleaned;
	}

	/**
	 * Extract JSON object from text that may contain other content
	 */
	private static extractJsonFromText(text: string): string | null {
		// Look for JSON object boundaries
		const jsonStart = text.indexOf("{");
		const jsonEnd = text.lastIndexOf("}");

		if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
			return null;
		}

		// Extract potential JSON
		const potentialJson = text.substring(jsonStart, jsonEnd + 1);

		// Basic validation - count braces
		const openBraces = (potentialJson.match(/{/g) || []).length;
		const closeBraces = (potentialJson.match(/}/g) || []).length;

		if (openBraces === closeBraces) {
			return potentialJson;
		}

		return null;
	}

	/**
	 * Fix common JSON formatting issues
	 */
	private static fixCommonJsonIssues(text: string): string | null {
		let fixed = text;

		try {
			// Fix trailing commas
			fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

			// Fix unquoted keys (basic cases)
			fixed = fixed.replace(/(\w+)(\s*):/g, '"$1"$2:');

			// Fix single quotes to double quotes
			fixed = fixed.replace(/'/g, '"');

			// Fix escaped quotes that shouldn't be escaped
			fixed = fixed.replace(/\\"/g, '"');

			// Remove comments (// and /* */)
			fixed = fixed.replace(/\/\/.*$/gm, "");
			fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, "");

			return fixed.trim();
		} catch (e) {
			return null;
		}
	}

	/**
	 * Validate that required fields are present in the parsed object
	 */
	private static validateRequiredFields(
		obj: any,
		requiredFields: string[],
	): boolean {
		if (!obj || typeof obj !== "object") {
			return false;
		}

		return requiredFields.every((field) => {
			const keys = field.split(".");
			let current = obj;
			for (const key of keys) {
				if (
					current == null ||
					typeof current !== "object" ||
					!(key in current)
				) {
					return false;
				}
				current = current[key];
			}
			return true;
		});
	}

	/**
	 * Parse JSON with enhanced error reporting
	 */
	static parseWithValidation<T>(
		text: string,
		requiredFields: string[] = [],
		fieldDescriptions: Record<string, string> = {},
	): ParseResult<T> {
		try {
			const cleaned = EnhancedJsonParser.cleanJsonResponse(text);
			const parsed = JSON.parse(cleaned);

			// Validate required fields
			const missingFields = requiredFields.filter(
				(field) => !EnhancedJsonParser.validateRequiredFields(parsed, [field]),
			);

			if (missingFields.length > 0) {
				const descriptions = missingFields
					.map((field) =>
						fieldDescriptions[field]
							? `${field} (${fieldDescriptions[field]})`
							: field,
					)
					.join(", ");

				return {
					success: false,
					error: `Missing required fields: ${descriptions}`,
					originalText: text,
					cleanedText: cleaned,
				};
			}

			return {
				success: true,
				data: parsed,
				originalText: text,
				cleanedText: cleaned,
			};
		} catch (error) {
			return {
				success: false,
				error: `JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`,
				originalText: text,
			};
		}
	}

	/**
	 * Safely extract a specific field from potentially malformed JSON
	 */
	static extractField(text: string, fieldName: string): any {
		try {
			// Try direct parsing first
			const parsed = JSON.parse(EnhancedJsonParser.cleanJsonResponse(text));
			return parsed[fieldName];
		} catch (e) {
			// Try regex extraction as fallback
			const fieldRegex = new RegExp(`"${fieldName}"\\s*:\\s*([^,}]+)`, "i");
			const match = text.match(fieldRegex);
			if (match) {
				try {
					return JSON.parse(match[1].trim());
				} catch (e) {
					return match[1].replace(/^["']|["']$/g, ""); // Remove quotes
				}
			}
			return undefined;
		}
	}
}

/**
 * Convenience function for backward compatibility
 */
export async function parseEnhancedJson<T>(
	text: string,
	requiredFields: string[] = [],
	fallbackData?: T,
): Promise<ParseResult<T>> {
	return EnhancedJsonParser.parseWithFallback(
		text,
		requiredFields,
		fallbackData,
	);
}
