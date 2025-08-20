import { prisma } from "./configs/db.config";

// In-memory cache for prompts
const promptCache = new Map<string, { content: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Retry configuration for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get a prompt from the database with caching
 * @param agentName - Name of the agent (e.g., 'IdeaSynthesisAgent')
 * @param promptKey - Key of the prompt (e.g., 'systemPrompt', 'trendArchitectPrompt')
 * @param fallback - Fallback prompt if not found in database
 * @returns The prompt content
 */
export async function getPrompt(agentName: string, promptKey: string, fallback: string): Promise<string> {
  const cacheKey = `${agentName}:${promptKey}`;
  
  console.log(`🎯 PROMPT REQUEST: ${cacheKey}`);
  
  // Check cache first
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log(`📋 Using cached prompt for ${cacheKey}`);
    return cached.content;
  } else if (cached) {
    console.log(`🕰️ Cache expired for ${cacheKey}, fetching fresh`);
  } else {
    console.log(`📋 Cache miss for ${cacheKey}, querying database`);
  }

  try {
    let prompt: any = null;
    let lastError: any = null;
    
    // Retry logic for database operations
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 DB RETRY ${attempt}/${MAX_RETRIES}: Attempting database query...`);
        }
        
        // Test database connection first
        await prisma.$queryRaw`SELECT 1 as test`;
        
        prompt = await prisma.adminPrompts.findFirst({
          where: { 
            agentName,
            promptKey,
            isActive: true 
          },
          select: {
            id: true,
            promptContent: true,
            agentName: true,
            promptKey: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        });
        
        break; // Success, exit retry loop
        
      } catch (dbError) {
        lastError = dbError;
        console.error(`❌ DB attempt ${attempt}/${MAX_RETRIES} failed:`, dbError);
        
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * attempt; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await sleep(delay);
        } else {
          console.error(`💥 All ${MAX_RETRIES} database attempts failed`);
          throw dbError;
        }
      }
    }
    
    if (prompt) {
      console.log(`✅ Found database prompt for ${cacheKey} (${prompt.promptContent.length} chars)`);
    } else {
      console.log(`⚠️ No database prompt found for ${cacheKey}, using fallback`);
    }
    
    const content = prompt?.promptContent || fallback;
    
    // Cache the result
    promptCache.set(cacheKey, {
      content,
      expiry: Date.now() + CACHE_TTL
    });
    
    if (prompt) {
      console.log(`🎉 Returning DATABASE prompt for ${cacheKey}`);
    } else {
      console.log(`⚠️ Returning FALLBACK prompt for ${cacheKey}`);
    }
    
    return content;
  } catch (error) {
    console.error(`💥 Error fetching prompt ${agentName}:${promptKey}:`, error);
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