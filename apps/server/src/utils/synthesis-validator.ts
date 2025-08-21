/**
 * Synthesis Validation Utility
 * Validates and fixes idea synthesis to prevent fallback research content
 */

import { generateText } from "ai";
import { openrouter } from "./configs/ai.config";
import { debugLogger } from "./logger";
import type { SynthesizedIdea } from "../types/apps/idea-generation-agent";

interface ValidationResult {
	isValid: boolean;
	issues: string[];
	correctedIdea?: SynthesizedIdea;
}

export class SynthesisValidator {
	/**
	 * Validate that the generated idea is consumer-focused and not research fallback
	 */
	static async validateAndCorrectIdea(
		idea: SynthesizedIdea,
		originalProblems: string[],
		trends: any
	): Promise<ValidationResult> {
		const issues: string[] = [];

		// Check for generic research content in description
		if (this.isGenericResearchContent(idea.description)) {
			issues.push("Description contains generic research analysis instead of consumer-focused idea");
		}

		// Check for generic titles
		if (this.isGenericTitle(idea.title)) {
			issues.push("Title is too generic and not consumer-specific");
		}

		// Check if description addresses consumer problems
		if (!this.addressesConsumerProblems(idea.description, originalProblems)) {
			issues.push("Description doesn't clearly address the identified consumer problems");
		}

		// Check for business jargon instead of consumer language
		if (this.containsBusinessJargon(idea.description)) {
			issues.push("Description uses business jargon instead of consumer-friendly language");
		}

		// If no issues, return as valid
		if (issues.length === 0) {
			return { isValid: true, issues: [] };
		}

		// Attempt to correct the idea using LLM
		try {
			const correctedIdea = await this.correctIdea(idea, originalProblems, trends, issues);
			return {
				isValid: false,
				issues,
				correctedIdea
			};
		} catch (error) {
			debugLogger.logError('Failed to correct idea synthesis', error as Error, { issues });
			return { isValid: false, issues };
		}
	}

	/**
	 * Check if description contains generic research content
	 */
	private static isGenericResearchContent(description: string): boolean {
		if (!description || typeof description !== 'string') {
			return false;
		}

		const researchIndicators = [
			'comprehensive analysis',
			'this analysis explores',
			'research identifies',
			'study reveals',
			'analysis demonstrates',
			'findings indicate',
			'research shows',
			'data suggests',
			'according to studies',
			'market analysis',
			'industry analysis'
		];

		const lowerDesc = description.toLowerCase();
		return researchIndicators.some(indicator => lowerDesc.includes(indicator));
	}

	/**
	 * Check if title is too generic
	 */
	private static isGenericTitle(title: string): boolean {
		if (!title || typeof title !== 'string') {
			return false;
		}

		const genericIndicators = [
			'comprehensive analysis',
			'market analysis',
			'global market',
			'industry analysis',
			'research',
			'study',
			'examination',
			'investigation'
		];

		const lowerTitle = title.toLowerCase();
		return genericIndicators.some(indicator => lowerTitle.includes(indicator));
	}

	/**
	 * Check if description addresses specific consumer problems
	 */
	private static addressesConsumerProblems(description: string, problems: string[]): boolean {
		if (!description || typeof description !== 'string' || !problems || problems.length === 0) {
			return false;
		}

		// Extract key consumer pain points from problems
		const painPoints = problems.join(' ').toLowerCase();
		const descLower = description.toLowerCase();

		// Look for consumer-focused language
		const consumerIndicators = [
			'people',
			'users',
			'customers',
			'individuals',
			'families',
			'consumers',
			'daily',
			'everyday',
			'frustrating',
			'time-consuming',
			'waste time',
			'save time',
			'easier',
			'simpler'
		];

		return consumerIndicators.some(indicator => descLower.includes(indicator));
	}

	/**
	 * Check for business jargon that should be consumer-friendly
	 */
	private static containsBusinessJargon(description: string): boolean {
		if (!description || typeof description !== 'string') {
			return false;
		}

		const businessJargon = [
			'operational efficiency',
			'strategic positioning',
			'competitive advantage',
			'market penetration',
			'stakeholders',
			'ecosystem',
			'scalability',
			'optimization',
			'transformation',
			'integration platforms',
			'operational tools'
		];

		const lowerDesc = description.toLowerCase();
		return businessJargon.some(jargon => lowerDesc.includes(jargon));
	}

	/**
	 * Use LLM to correct the idea synthesis
	 */
	private static async correctIdea(
		idea: SynthesizedIdea,
		originalProblems: string[],
		trends: any,
		issues: string[]
	): Promise<SynthesizedIdea> {
		const correctionPrompt = `
You are tasked with fixing a startup idea that has been incorrectly generated. The idea currently has these issues:
${issues.map(issue => `- ${issue}`).join('\n')}

ORIGINAL PROBLEMS IDENTIFIED:
${originalProblems.join('\n')}

CURRENT FLAWED IDEA:
Title: ${idea.title}
Description: ${idea.description}

FIXING REQUIREMENTS:
1. Create a CONSUMER-FOCUSED tool/app that regular people would use
2. Focus on what individuals, families, or everyday people need
3. Use simple, conversational language (no business jargon)
4. Address the specific daily frustrations mentioned in the problems
5. Make it feel like a helpful tool someone would pay $5-20/month for
6. NO research analysis - focus on the actual product/service

Create a corrected version that:
- Has a clear, consumer-friendly title (max 10 words)
- Describes what the tool DOES for regular people (not market analysis)
- Explains how it solves the daily frustration
- Feels like something you'd see on the App Store

Return in JSON format:
{
  "title": "Consumer-friendly tool name that explains what it does",
  "description": "2-3 sentences about what this tool does for regular people and how it helps them",
  "executiveSummary": "Simple pitch about the consumer problem and solution",
  "problemSolution": "People spend X time on Y problem. This tool fixes it by doing Z.",
  "problemStatement": "Clear statement of the daily frustration this solves"
}`;

		const { text } = await generateText({
			model: openrouter("openai/gpt-4o-mini"),
			prompt: correctionPrompt,
			temperature: 0.1,
			maxOutputTokens: 1000,
		});

		// Parse the corrected version
		const cleanText = this.cleanLLMResponse(text);
		const corrected = JSON.parse(cleanText);

		// Ensure the original idea has proper structure
		if (!idea.scoring) {
			idea.scoring = {
				totalScore: 7.5,
				problemSeverity: 8.0,
				founderMarketFit: 7.5,
				technicalFeasibility: 8.0,
				monetizationPotential: 7.5,
				urgencyScore: 8.0,
				marketTimingScore: 7.5,
				executionDifficulty: 6.5,
				moatStrength: 7.0,
				regulatoryRisk: 4.0,
			};
		}

		// Merge with original idea, keeping corrected fields and ensuring all required fields exist
		const correctedIdea = {
			...idea,
			title: corrected.title || idea.title,
			description: corrected.description || idea.description,
			executiveSummary: corrected.executiveSummary || idea.executiveSummary,
			problemSolution: corrected.problemSolution || idea.problemSolution,
			problemStatement: corrected.problemStatement || idea.problemStatement,
		};

		// Ensure all required numeric/array fields have values
		if (correctedIdea.innovationLevel === undefined) correctedIdea.innovationLevel = 7.5;
		if (correctedIdea.timeToMarket === undefined) correctedIdea.timeToMarket = 4;
		if (correctedIdea.confidenceScore === undefined) correctedIdea.confidenceScore = 8.0;
		if (correctedIdea.urgencyLevel === undefined) correctedIdea.urgencyLevel = 8.0;
		if (correctedIdea.executionComplexity === undefined) correctedIdea.executionComplexity = 6.5;
		if (!correctedIdea.narrativeHook) correctedIdea.narrativeHook = "A simple solution for everyday problems";
		if (!correctedIdea.targetKeywords) correctedIdea.targetKeywords = ["consumer", "app", "simple"];
		if (!correctedIdea.tags) correctedIdea.tags = ["Consumer", "Tool", "Solution"];
		if (!correctedIdea.executionPlan) correctedIdea.executionPlan = "Build MVP with core features, test with target users, iterate based on feedback.";
		if (!correctedIdea.tractionSignals) correctedIdea.tractionSignals = "Achieve initial user adoption with positive feedback and engagement metrics.";
		if (!correctedIdea.frameworkFit) correctedIdea.frameworkFit = "Consumer-focused approach addressing validated market need.";

		return correctedIdea;
	}

	/**
	 * Clean LLM response to extract JSON
	 */
	private static cleanLLMResponse(text: string): string {
		let cleaned = text.trim();

		// Remove markdown
		cleaned = cleaned.replace(/^```json\s*/i, "");
		cleaned = cleaned.replace(/^```\s*/, "");
		cleaned = cleaned.replace(/\s*```\s*$/, "");

		// Extract JSON object
		const firstBrace = cleaned.indexOf('{');
		const lastBrace = cleaned.lastIndexOf('}');
		
		if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
			cleaned = cleaned.substring(firstBrace, lastBrace + 1);
		}

		return cleaned.trim();
	}

	/**
	 * Quick validation for consumer focus
	 */
	static isConsumerFocused(idea: SynthesizedIdea): boolean {
		if (!idea || !idea.title || !idea.description) {
			return false;
		}

		const consumerKeywords = [
			'app', 'tool', 'helps', 'save time', 'easier', 'simple', 
			'people', 'families', 'users', 'daily', 'personal'
		];
		
		const combinedText = `${idea.title} ${idea.description}`.toLowerCase();
		return consumerKeywords.some(keyword => combinedText.includes(keyword));
	}

	/**
	 * Validate that an idea is specific and actionable
	 */
	static isSpecificAndActionable(idea: SynthesizedIdea): boolean {
		if (!idea || !idea.title || !idea.description) {
			return false;
		}

		// Check title length and specificity
		if (idea.title.split(' ').length > 12) return false;
		
		// Check for vague words
		const vague = ['comprehensive', 'solution', 'platform', 'system', 'various', 'multiple'];
		const titleLower = idea.title.toLowerCase();
		
		if (vague.some(word => titleLower.includes(word))) return false;
		
		// Check description length (should be concise)
		if (idea.description.length > 500) return false;
		
		return true;
	}
}