// Server-side API utilities for SSR
import { cache } from 'react';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/types';

// Get server URL with fallback
const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
};

// Create a server-side tRPC client
const serverTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getServerUrl()}/trpc`,
      // Don't include credentials for server-side requests
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // Add caching for better performance
          next: { revalidate: 60 }, // Revalidate every 60 seconds
        });
      },
    }),
  ],
});

// Fallback HTTP fetch function for tRPC queries
async function fallbackFetch<T>(endpoint: string, input: any): Promise<T | null> {
  try {
    console.log(`Attempting fallback fetch to: ${getServerUrl()}/trpc/${endpoint}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: input }))}`);
    
    // Format as tRPC query request
    const queryParams = new URLSearchParams({
      batch: '1',
      input: JSON.stringify({ 0: input })
    });
    
    const response = await fetch(`${getServerUrl()}/trpc/${endpoint}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fallback fetch response:', data);
    
    // Handle tRPC batch response format
    return data[0]?.result?.data || data.result?.data || data;
  } catch (error) {
    console.error(`Fallback fetch failed for ${endpoint}:`, error);
    return null;
  }
}

// Cached function to get daily ideas
export const getDailyIdeas = cache(async () => {
  try {
    console.log('Attempting to fetch daily ideas via tRPC client...');
    const result = await serverTrpcClient.agents.getDailyIdeas.query({
      limit: 50,
      offset: 0
    });
    console.log('tRPC fetch successful:', result);
    return result;
  } catch (error) {
    console.error('tRPC fetch failed, trying fallback:', error);
    
    // Try fallback HTTP request
    const fallbackResult = await fallbackFetch<{ ideas: any[] }>('agents.getDailyIdeas', {
      limit: 50,
      offset: 0
    });
    
    return fallbackResult || { ideas: [] };
  }
});

// Cached function to get idea by ID
export const getIdeaById = cache(async (id: string) => {
  try {
    console.log(`Attempting to fetch idea ${id} via tRPC client...`);
    const result = await serverTrpcClient.agents.getIdeaById.query({ id });
    console.log('tRPC fetch successful:', result);
    return result;
  } catch (error) {
    console.error('tRPC fetch failed, trying fallback:', error);
    
    // Try fallback HTTP request
    const fallbackResult = await fallbackFetch<any>('agents.getIdeaById', { id });
    
    return fallbackResult;
  }
});

// Cached function for semantic search
export const semanticSearchIdeas = cache(async (query: string, limit = 12, offset = 0) => {
  try {
    console.log(`Attempting semantic search for: "${query}" via tRPC client...`);
    // TODO: Implement semanticSearch endpoint in agent router
    console.log('Semantic search not implemented yet, returning empty result');
    const result = { ideas: [], pagination: { total: 0, limit, offset, hasMore: false } };
    console.log('Semantic search successful:', result);
    return result;
  } catch (error) {
    console.error('Semantic search failed, trying fallback:', error);
    
    // Try fallback HTTP request
    const fallbackResult = await fallbackFetch<{ ideas: any[]; hasMore: boolean }>('agents.semanticSearch', {
      query,
      limit,
      offset
    });
    
    return fallbackResult || { ideas: [], hasMore: false };
  }
});

// Get today's top 3 ideas for homepage - fallback to mock data for now
export const getTodaysTopIdeas = cache(async () => {
  try {
    console.log('Fetching today\'s top 3 ideas...');
    
    // Try the tRPC client first
    try {
      const result = await serverTrpcClient.agents.getDailyIdeas.query({
        limit: 50,
        offset: 0
      });
      
      if (result?.ideas?.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Filter and sort today's ideas
        const todaysIdeas = result.ideas
          .filter((idea: any) => {
            const createdAt = new Date(idea.createdAt);
            return createdAt >= today && createdAt < tomorrow;
          })
          .sort((a: any, b: any) => {
            const scoreA = a.ideaScore?.overallScore || 0;
            const scoreB = b.ideaScore?.overallScore || 0;
            return scoreB - scoreA;
          })
          .slice(0, 3);
        
        if (todaysIdeas.length > 0) {
          console.log(`Found ${todaysIdeas.length} ideas from today`);
          return todaysIdeas;
        }
      }
    } catch (error) {
      console.error('tRPC fetch failed:', error);
    }
  } catch (error) {
    console.error('Error fetching today\'s top ideas:', error);
    return [];
  }
});

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  try {
    const response = await getDailyIdeas();
    if (!response?.ideas) return [];
    
    return response.ideas.slice(0, 10).map((idea: any) => ({
      id: idea.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}