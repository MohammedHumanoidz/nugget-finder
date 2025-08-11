import path from "path";
import winston from "winston";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

// Winston logger configuration
const logger = winston.createLogger({
	level: "debug",
	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss.SSS",
		}),
		winston.format.errors({ stack: true }),
		winston.format.printf(({ timestamp, level, message, ...meta }) => {
			const metaString = Object.keys(meta).length
				? `\n${JSON.stringify(meta, null, 2)}`
				: "";
			return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
		}),
	),
	transports: [
		// File transport for all logs
		new winston.transports.File({
			filename: path.join(logsDir, "logs.txt"),
			maxsize: 50 * 1024 * 1024, // 50MB max file size
			maxFiles: 5, // Keep 5 backup files
			tailable: true,
		}),
		// Console transport for development
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `[${timestamp}] ${level}: ${message}`;
				}),
			),
		}),
	],
});

// Enhanced logging functions with full content capture
export const debugLogger = {
	/**
	 * Log Perplexity API request details
	 */
	logPerplexityRequest: (
		agent: string,
		userPrompt: string,
		systemPrompt: string,
		params: any,
	) => {
		logger.info(`🔍 ${agent} - Perplexity API Request`, {
			agent,
			userPrompt,
			systemPrompt,
			params,
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log Perplexity API response (FULL CONTENT)
	 */
	logPerplexityResponse: (agent: string, response: any) => {
		logger.info(`📥 ${agent} - Perplexity API Response (FULL)`, {
			agent,
			fullResponse: response,
			contentLength: response?.choices?.[0]?.message?.content?.length || 0,
			content: response?.choices?.[0]?.message?.content || "NO CONTENT",
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log content analysis (is it JSON vs markdown)
	 */
	logContentAnalysis: (
		agent: string,
		content: string,
		isAlreadyJson: boolean,
	) => {
		logger.info(`🔍 ${agent} - Content Analysis`, {
			agent,
			isAlreadyJson,
			contentLength: content.length,
			contentPreview: content.substring(0, 500),
			fullContent: content, // FULL CONTENT FOR DEBUGGING
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log LLM structuring request
	 */
	logLLMStructuring: (agent: string, prompt: string, content: string) => {
		logger.info(`🔄 ${agent} - LLM Structuring Request`, {
			agent,
			structuringPrompt: prompt,
			contentToStructure: content, // FULL CONTENT
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log LLM structuring response (FULL)
	 */
	logLLMStructuringResponse: (agent: string, structuredContent: string) => {
		logger.info(`📤 ${agent} - LLM Structuring Response (FULL)`, {
			agent,
			structuredContent, // FULL STRUCTURED CONTENT
			structuredLength: structuredContent.length,
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log parsing attempt and result
	 */
	logParsingAttempt: (agent: string, content: string, parseResult: any) => {
		logger.info(`🔧 ${agent} - Parsing Attempt`, {
			agent,
			inputContent: content, // FULL INPUT
			parseSuccess: parseResult.success,
			parseError: parseResult.error,
			parsedData: parseResult.data, // FULL PARSED DATA
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log final agent result
	 */
	logAgentResult: (agent: string, result: any, wasSuccessful: boolean) => {
		logger.info(`✅ ${agent} - Final Result`, {
			agent,
			wasSuccessful,
			finalResult: result, // FULL FINAL RESULT
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log errors with full context
	 */
	logError: (agent: string, error: Error, context: any = {}) => {
		logger.error(`❌ ${agent} - Error`, {
			agent,
			errorMessage: error.message,
			errorStack: error.stack,
			context,
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log general debug information
	 */
	debug: (message: string, data: any = {}) => {
		logger.debug(message, {
			...data,
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log general info
	 */
	info: (message: string, data: any = {}) => {
		logger.info(message, {
			...data,
			timestamp: new Date().toISOString(),
		});
	},

	/**
	 * Log warnings
	 */
	warn: (message: string, data: any = {}) => {
		logger.warn(message, {
			...data,
			timestamp: new Date().toISOString(),
		});
	},
};

// Create logs directory
import fs from "fs";

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;
