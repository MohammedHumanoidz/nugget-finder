import { generateText } from "ai";
import type { AgentContext } from "../../../types/apps/idea-generation-agent";
import { openrouter } from "../../../utils/configs/ai.config";
import { EnhancedJsonParser } from "../../../utils/enhanced-json-parser";

// Interface for Master Research Director
interface ResearchDirectorData {
  researchTheme: string;
  geographicFocus: string;
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

**Core Mission:** Generate a research theme that directly addresses the user's prompt while ensuring commercial viability and software-first focus. The research should be tailored to uncover opportunities that align with the user's specific interests, background, or domain mentioned in their prompt.

**USER-FOCUSED RESEARCH STRATEGY:** Based on the user's prompt, you should:
- Extract the core domain, industry, or problem area they're interested in
- Identify their potential expertise level or background (if implied)
- Focus research on practical, actionable opportunities within their area of interest
- Consider both B2B and B2C opportunities that match their prompt
- Prioritize technologies and approaches that align with their request

Return this exact JSON structure:
{
  "researchTheme": "string (Research direction tailored to user's prompt, e.g., 'AI-Powered Healthcare Solutions for Mental Health' or 'Sustainable Energy Management Platforms for Small Businesses')",
  "geographicFocus": "string (Target market context relevant to user's domain, e.g., 'Global Market - Remote-First Solutions' or 'North American Healthcare Market')",
  "industryRotation": "string (The industry vertical that aligns with user's interests and expertise)",
  "diversityMandates": ["mandate 1: focus on user's specific domain", "mandate 2: align with user's apparent expertise level", "mandate 3: explore both technical and business opportunities in their area"],
  "researchApproach": "string (How the trend research should be conducted specific to user's domain - what communities, signals, and validation sources to prioritize)"
}

**User Context Analysis:** Analyze the user's prompt to understand their:
- Potential professional background or expertise
- Specific problems or industries they're interested in
- Level of technical vs business focus
- Geographic or market preferences (if any)

Tailor your research theme to generate ideas that would be actionable and relevant for this user.`
        : `You are the Master Research Director for a world-class startup opportunity discovery system. Your role is to establish today's research parameters that will drive the entire pipeline toward discovering genuinely novel, diverse startup opportunities.

**Core Mission:** Generate a research theme for today that ensures maximum diversity from previously generated ideas while maintaining commercial viability and software-first focus.

**CRITICAL DIVERSITY ENFORCEMENT:** Based on the previously generated ideas, you MUST choose a research direction that is fundamentally different in:
- Industry/vertical focus
- Target user demographic  
- Geographic/cultural context
- Business model approach (B2B vs B2C vs Creative/Original)
- Technology stack or approach

**Geographic Rotation Strategy (More Tech-Centric & Broad):** Rotate research focus across:
- **Major Innovation Hubs:** Silicon Valley, New York, London, Berlin, Tel Aviv, Bangalore, Singapore, Tokyo.
- **Emerging Tech Markets:** Latin America, Southeast Asia, Africa (focus on digital transformation & mobile-first solutions).
- **Global Digital-First:** Remote work tools, decentralized technologies, virtual economies, creator platforms.
- **Underserved Regions with Tech Potential:** Regions ripe for digital disruption or lacking robust tech infrastructure.

**Industry Rotation Mandates (More Tech & Diversity Focused):**
- If previous: Enterprise SaaS → Focus on: Developer Tools, Creator Economy, AI Infrastructure, Deep Tech
- If previous: Consumer Apps → Focus on: B2B SaaS, Vertical SaaS for SMBs, Web3 Applications, Bio/Health Tech
- If previous: AI/ML Focus → Focus on: Climate Tech, Space Tech, Advanced Robotics, Quantum Computing, Cybersecurity
- If previous: Web/Mobile Apps → Focus on: API-First Solutions, Blockchain/Decentralized Apps, Hardware-Software Integration

Return this exact JSON structure:
{
  "researchTheme": "string (Today's focused research direction, e.g., 'Decentralized Identity Solutions for African Startups' or 'AI-Powered Drug Discovery Platforms in Major Innovation Hubs')",
  "geographicFocus": "string (Broader region/market context, e.g., 'Emerging Tech Markets - Southeast Asia' or 'Major Innovation Hubs - Europe')",
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
    : "No previous ideas - establish initial research direction focusing on underserved global markets with high tech potential"
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
          ["researchTheme", "geographicFocus", "industryRotation"],
          {
            researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
            geographicFocus: "Global Digital-First opportunities",
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
        geography: directorData.geographicFocus,
        industry: directorData.industryRotation,
      });

      return directorData;
    } catch (error) {
      console.error("Master Research Director error:", error);
      // Return fallback research direction
      return {
        researchTheme: "AI-Powered Developer Tools for Global Remote Teams",
        geographicFocus: "Global Digital-First opportunities",
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
