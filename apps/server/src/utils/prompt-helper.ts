import { prisma } from "./configs/db.config";

// In-memory cache for prompts
const promptCache = new Map<string, { content: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a prompt from the database with caching
 * @param agentName - Name of the agent (e.g., 'IdeaSynthesisAgent')
 * @param promptKey - Key of the prompt (e.g., 'systemPrompt', 'trendArchitectPrompt')
 * @param fallback - Fallback prompt if not found in database
 * @returns The prompt content
 */
export async function getPrompt(agentName: string, promptKey: string, fallback: string): Promise<string> {
  const cacheKey = `${agentName}:${promptKey}`;
  
  // Check cache first
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log(`📋 Using cached prompt for ${cacheKey}`);
    return cached.content;
  }

  try {
    console.log(`🔍 Fetching prompt from database: ${cacheKey}`);
    const prompt = await prisma.adminPrompts.findFirst({
      where: { 
        agentName,
        promptKey,
        isActive: true 
      }
    });
    
    const content = prompt?.promptContent || fallback;
    
    // Cache the result
    promptCache.set(cacheKey, {
      content,
      expiry: Date.now() + CACHE_TTL
    });
    
    if (prompt) {
      console.log(`✅ Found dynamic prompt for ${cacheKey} (${content.length} chars)`);
    } else {
      console.log(`⚠️ Using fallback prompt for ${cacheKey} (${content.length} chars)`);
    }
    
    return content;
  } catch (error) {
    console.error(`❌ Error fetching prompt ${agentName}:${promptKey}:`, error);
    console.log(`🔄 Using fallback prompt for ${cacheKey}`);
    return fallback;
  }
}

/**
 * Clear the prompt cache (useful for testing and when prompts are updated)
 */
export function clearPromptCache() {
  promptCache.clear();
  console.log("🧹 Prompt cache cleared");
}

/**
 * Get cache statistics
 */
export function getPromptCacheStats() {
  const now = Date.now();
  const active = Array.from(promptCache.entries()).filter(([_, data]) => data.expiry > now);
  const expired = Array.from(promptCache.entries()).filter(([_, data]) => data.expiry <= now);
  
  return {
    totalCached: promptCache.size,
    activeCached: active.length,
    expiredCached: expired.length,
    cacheKeys: Array.from(promptCache.keys())
  };
}