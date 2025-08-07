import { generateText } from "ai";
import type { AgentContext } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

// Interface for Master Research Director
interface ResearchDirectorData {
  researchTheme: string;
  globalMarketFocus: string;
  industryRotation: string;
  diversityMandates: string[];
  researchApproach: string;
}

export class MasterResearchDirector {
  /**
   * Master Research Director - Creates diverse research themes per day
   * Influences trend research with rotating diversity across industry + geography
   */
  static async execute(
    context: AgentContext
  ): Promise<ResearchDirectorData | null> {
    try {
      console.log("🎯 Step 1: Activating Master Research Director");

      // Check if this is user-driven or daily automatic generation
      const isUserDriven = context.userPrompt && context.userPrompt.trim().length > 0;
      
      const directorPrompt = isUserDriven 
        ? `You are the Master Research Director for a world-class startup opportunity discovery system. You are responding to a specific user inquiry to generate business ideas based on their prompt.

**User's Request:** "${context.userPrompt}"

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on GLOBAL problems and solutions that work worldwide
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Target universal human problems that exist everywhere
- Solutions should be globally applicable and digitally scalable

**Core Mission:** Generate a research theme that directly addresses the user's prompt while ensuring commercial viability and global applicability. The research should uncover universal opportunities that work worldwide using simple, clear language.

**USER-FOCUSED RESEARCH STRATEGY:** Based on the user's prompt, you should:
- Extract the core domain or problem area they're interested in (without geographic focus)
- Focus research on universal problems that exist globally
- Look for simple software solutions that work worldwide
- Consider both business and consumer opportunities using plain language
- Prioritize straightforward approaches that anyone can understand

Return this exact JSON structure:
{
  "researchTheme": "string (Research direction tailored to user's prompt, e.g., 'AI-Powered Healthcare Solutions for Mental Health' or 'Sustainable Energy Management Platforms for Small Businesses')",
  "globalMarketFocus": "string (Always use 'Global Digital Market' to ensure worldwide applicability)",
  "industryRotation": "string (The industry vertical that aligns with user's interests and expertise)",
  "diversityMandates": ["mandate 1: focus on user's specific domain", "mandate 2: align with user's apparent expertise level", "mandate 3: explore both technical and business opportunities in their area"],
  "researchApproach": "string (How the trend research should be conducted specific to user's domain - what communities, signals, and validation sources to prioritize)"
}

**User Context Analysis:** Analyze the user's prompt to understand their:
- Potential professional background or expertise
- Specific problems or industries they're interested in
- Level of technical vs business focus
- Solution scalability and global applicability

Focus on creating globally applicable solutions that work universally across different markets worldwide. Emphasize digital-first opportunities that transcend boundaries.`
        : `You are the Master Research Director for a world-class startup opportunity discovery system. Your role is to establish today's research parameters that will drive the entire pipeline toward discovering genuinely novel, diverse startup opportunities.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on GLOBAL problems and solutions that work worldwide
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Target universal human problems that exist everywhere
- Solutions should be globally applicable and digitally scalable

**Core Mission:** Generate a research theme for today that ensures maximum diversity from previously generated ideas while maintaining global applicability and using simple, clear language.

**CRITICAL DIVERSITY ENFORCEMENT:** Based on the previously generated ideas, you MUST choose a research direction that is fundamentally different in:
- Industry/vertical focus
- Target user demographic  
- Business model approach (B2B vs B2C vs Creative/Original)
- Technology stack or approach
- Problem scale and complexity

**Global Market Strategy (Simple & Universally Applicable):** Focus on solutions that work everywhere:
- **Simple Digital Tools:** Remote work helpers, online platforms, creator tools, productivity apps.
- **Universal Problems:** Communication, organization, data storage, security, time-saving.
- **Easy-to-Use Software:** Web apps, mobile apps, simple online services.
- **Worldwide Applications:** Solutions that work for people everywhere, regardless of location.

**Industry Rotation Mandates (Simple Language Focus):**
- If previous: Business software → Focus on: Creative tools, Communication apps, Learning platforms
- If previous: Consumer apps → Focus on: Business tools, Team software, Work helpers
- If previous: Smart software → Focus on: Simple automation, Data tools, Security software
- If previous: Web/Mobile apps → Focus on: Online services, Digital platforms, Collaboration tools

Return this exact JSON structure:
{
  "researchTheme": "string (Today's focused research direction, e.g., 'AI-Powered Identity Verification for Digital Platforms' or 'Automated Drug Discovery Platforms for Pharmaceutical Research')",
  "globalMarketFocus": "string (Always use 'Global Digital Market' to ensure worldwide applicability)",
  "industryRotation": "string (The industry vertical to explore today, ensuring diversity from previous, focusing on tech-forward areas)",
  "diversityMandates": ["mandate 1: avoid X from previous ideas", "mandate 2: focus on Y demographic not covered before", "mandate 3: explore Z business model not used recently"],
  "researchApproach": "string (How the trend research should be conducted - what communities, signals, and validation sources to prioritize)"
}

**Previous Research Context (MUST AVOID THESE PATTERNS to ensure diversity):**
${
  context.previousIdeas && context.previousIdeas.length > 0
    ? context.previousIdeas
        .map(
          (idea, idx) =>
            `${idx + 1}. "${idea.title}" - Industry: ${this.extractIndustry(
              idea.description
            )}, Target: ${this.extractTarget(idea.description)}`
        )
        .join("\n")
    : "No previous ideas - establish initial research direction focusing on underserved global digital markets with high tech potential"
}

Today's research must explore completely new territory, pushing boundaries in technology and market application. Be specific and actionable, ensuring the diversity mandates are strictly followed.`;

      const { text } = await generateText({
        model: openrouter("openai/gpt-4.1-mini"),
        prompt: directorPrompt,
        temperature: 0.3,
        maxTokens: 600,
      });

      // Use enhanced JSON parser to handle markdown code blocks and formatting issues
      const parseResult =
        await EnhancedJsonParser.parseWithFallback<ResearchDirectorData>(
          text,
          ["researchTheme", "globalMarketFocus", "industryRotation"],
          {
            researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
            globalMarketFocus: "Global Digital Market",
            industryRotation: "Developer Productivity and AI Infrastructure",
            diversityMandates: [
              "Avoid consumer social apps",
              "Target software developers and engineering teams",
              "Explore B2B SaaS models for deep tech",
            ],
            researchApproach:
              "Focus on developer communities, open-source trends, and AI research papers",
          }
        );

      if (!parseResult.success) {
        console.error(
          "❌ Master Research Director JSON parsing failed:",
          parseResult.error
        );
        console.log(
          "📝 Original response:",
          parseResult.originalText?.substring(0, 500)
        );
        if (parseResult.cleanedText) {
          console.log(
            "🧹 Cleaned response:",
            parseResult.cleanedText.substring(0, 500)
          );
        }
      }

      const directorData = parseResult.data as ResearchDirectorData;

      console.log("✅ Step 1: Research Director Set Research Parameters:", {
        theme: directorData.researchTheme,
        geography: directorData.globalMarketFocus,
        industry: directorData.industryRotation,
      });

      return directorData;
    } catch (error) {
      console.error("Master Research Director error:", error);
      // Return fallback research direction
      return {
        researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
        globalMarketFocus: "Global Digital Market",
        industryRotation: "Developer Productivity and AI Infrastructure",
        diversityMandates: [
          "Avoid consumer social apps",
          "Target software developers and engineering teams",
          "Explore B2B SaaS models for deep tech",
        ],
        researchApproach:
          "Focus on developer communities, open-source trends, and AI research papers",
      };
    }
  }

  // Helper functions for extracting patterns from previous ideas
  static extractIndustry(description: string): string {
    const industryKeywords = {
      enterprise: ["enterprise", "corporate", "large business"],
      smb: ["small business", "SMB", "local business"],
      consumer: ["consumer", "individual", "personal"],
      creator: ["creator", "artist", "content"],
      healthcare: ["health", "medical", "wellness"],
      fintech: ["finance", "payment", "banking"],
      edtech: ["education", "learning", "student"],
      ai: ["AI", "artificial intelligence", "machine learning"],
      developer_tools: ["developer", "coding", "API", "toolchain"],
      web3: ["blockchain", "decentralized", "crypto"],
      climate_tech: ["climate", "sustainability", "environmental"],
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (
        keywords.some((keyword) => description.toLowerCase().includes(keyword))
      ) {
        return industry;
      }
    }
    return "general";
  }

  static extractTarget(description: string): string {
    const targetKeywords = {
      enterprise: ["enterprise", "corporation", "large company"],
      smb: ["small business", "SMB", "local shop"],
      individual: ["individual", "personal", "consumer"],
      professional: ["professional", "freelancer", "consultant"],
      creator: ["creator", "artist", "influencer"],
      developer: ["developer", "engineer", "programmer"],
      scientist: ["scientist", "researcher", "analyst"],
    };

    for (const [target, keywords] of Object.entries(targetKeywords)) {
      if (
        keywords.some((keyword) => description.toLowerCase().includes(keyword))
      ) {
        return target;
      }
    }
    return "general";
  }
}

export type { ResearchDirectorData };
