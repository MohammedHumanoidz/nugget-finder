import type { MetadataRoute } from 'next';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/types';

// Create a server-side tRPC client for sitemap generation
const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
};

const serverTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getServerUrl()}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          next: { revalidate: 3600 }, // Revalidate sitemap every hour
        });
      },
    }),
  ],
});

// Fallback fetch for ideas if tRPC fails
async function fallbackFetchAllIdeas() {
  try {
    console.log('Fallback: Fetching all ideas for sitemap...');
    
    const queryParams = new URLSearchParams({
      batch: '1',
      input: JSON.stringify({ 0: { limit: 1000, offset: 0 } }) // Get up to 1000 ideas
    });
    
    const response = await fetch(`${getServerUrl()}/trpc/agents.getDailyIdeas?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.[0]?.result?.data?.ideas || [];
  } catch (error) {
    console.error('Fallback fetch failed:', error);
    return [];
  }
}

// Get all ideas for sitemap
async function getAllIdeas() {
  try {
    console.log('Fetching all ideas for sitemap via tRPC...');
    
    // Try to get a large batch of ideas (up to 1000)
    const result = await serverTrpcClient.agents.getDailyIdeas.query({
      limit: 1000,
      offset: 0
    });
    
    return result?.ideas || [];
  } catch (error) {
    console.error('tRPC fetch failed for sitemap, trying fallback:', error);
    return await fallbackFetchAllIdeas();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nuggetfinder.ai';
  
  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/saved-ideas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/claimed-ideas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  try {
    // Fetch all ideas/nuggets
    const ideas = await getAllIdeas();
    console.log(`Generating sitemap with ${ideas.length} nuggets`);

    // Generate dynamic pages for each nugget/idea
    const nuggetPages: MetadataRoute.Sitemap = ideas.map((idea: any) => ({
      url: `${baseUrl}/nugget/${idea.id}`,
      lastModified: new Date(idea.updatedAt || idea.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // High priority for individual nuggets
    }));

    // Combine static and dynamic pages
    return [...staticPages, ...nuggetPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static pages if dynamic content fails
    return staticPages;
  }
} 