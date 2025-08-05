import type { MetadataRoute } from 'next'
import { getDailyIdeas } from '@/lib/server-api'

const baseUrl = 'https://nuggetfinder.ai'

// This function generates the sitemap.xml file at build time.
// It fetches all nuggets to create a comprehensive list of URLs.
// Documentation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Define static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // 2. Fetch all dynamic nugget pages
  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    console.log('Sitemap: Fetching ideas...');
    const response = await getDailyIdeas();
    
    if (response?.ideas) {
      const ideas = response.ideas;
      console.log(`Sitemap: Found ${ideas.length} ideas to add.`);

      dynamicPages = ideas.map((idea: any) => ({
        url: `${baseUrl}/nugget/${idea.id}`,
        lastModified: new Date(idea.updatedAt || idea.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } else {
      console.error('Sitemap: No ideas found in response');
    }
  } catch (error) {
    console.error('Sitemap: Error fetching ideas for sitemap:', error);
  }

  return [...staticPages, ...dynamicPages];
}