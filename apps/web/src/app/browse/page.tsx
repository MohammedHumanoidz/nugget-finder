import { Suspense } from "react";
import BrowseClient from "@/components/BrowseClient";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for browse page
export const metadata: Metadata = {
  title: "Browse AI-Generated Startup Ideas | Nugget Finder",
  description: "Explore 500+ validated startup opportunities across AI, fintech, healthtech, and climate tech. Filter by industry, market size, and feasibility. Find your next big opportunity with comprehensive market analysis.",
  openGraph: {
    title: "Browse AI-Generated Startup Ideas | Nugget Finder",
    description: "Explore 500+ validated startup opportunities with AI-powered market analysis. Filter by industry, feasibility, and market potential.",
    url: "https://nuggetfinder.ai/browse",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Browse Startup Ideas - Nugget Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse AI-Generated Startup Ideas | Nugget Finder",
    description: "Explore 500+ validated startup opportunities across technology sectors",
    images: ["/logo.webp"],
  },
  keywords: [
    "startup ideas browser",
    "AI business opportunities",
    "validated startup concepts",
    "market analysis filter",
    "technology sectors",
    "business idea search",
    "entrepreneurship discovery",
    "startup validation",
    "market research tools",
    "innovation opportunities"
  ],
};

// Collection page schema for browse functionality
const browsePageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Browse Startup Ideas",
  "description": "Explore AI-generated startup opportunities across multiple technology sectors with comprehensive market analysis and validation",
  "url": "https://nuggetfinder.ai/browse",
  "about": {
    "@type": "Thing",
    "name": "Startup Opportunities",
    "description": "AI-analyzed business opportunities with market validation and competitive research"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Startup Ideas Collection",
    "description": "Curated collection of validated startup opportunities across technology sectors",
    "numberOfItems": "500+",
    "itemListElement": [
      {
        "@type": "CreativeWork",
        "name": "AI-Generated Startup Ideas",
        "description": "Comprehensive business opportunities with market analysis",
        "genre": "Business Intelligence"
      }
    ]
  },
  "provider": {
    "@type": "Organization",
    "name": "Nugget Finder",
    "url": "https://nuggetfinder.ai"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Entrepreneurs, Investors, Product Managers",
    "geographicArea": "Worldwide"
  },
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nuggetfinder.ai/browse?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    {
      "@type": "FilterAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nuggetfinder.ai/browse?filter={filter_term}"
      },
      "query-input": "required name=filter_term"
    }
  ]
};

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Browse page structured data */}
      <StructuredData data={browsePageSchema} />
      
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading startup opportunities...</p>
            </div>
          </div>
        }
      >
        <BrowseClient />
      </Suspense>
    </div>
  );
}