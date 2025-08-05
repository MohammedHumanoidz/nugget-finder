import SavedIdeas from "@/components/SavedIdeas";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for saved ideas page
export const metadata: Metadata = {
  title: "Saved Startup Ideas | Your Personal Collection | Nugget Finder",
  description: "Access your curated collection of saved startup opportunities. Review market analysis, competitive insights, and execution plans for your bookmarked business ideas.",
  openGraph: {
    title: "Saved Startup Ideas | Nugget Finder",
    description: "Your personal collection of curated startup opportunities with comprehensive market analysis and insights.",
    url: "https://nuggetfinder.ai/saved-ideas",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Saved Startup Ideas Collection - Nugget Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Startup Ideas | Nugget Finder",
    description: "Your personal collection of curated startup opportunities",
    images: ["/logo.webp"],
  },
  keywords: [
    "saved startup ideas",
    "bookmarked opportunities",
    "curated business ideas",
    "personal idea collection",
    "startup watchlist",
    "business opportunity tracker",
    "entrepreneurial bookmarks",
    "idea management",
    "startup portfolio",
    "business concept library"
  ],
  robots: {
    index: false, // Don't index personal collections
    follow: true,
  },
};

// Collection page schema for saved ideas
const savedIdeasSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Saved Startup Ideas",
  "description": "Personal collection of curated startup opportunities saved for future exploration and development",
  "url": "https://nuggetfinder.ai/saved-ideas",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Personal Startup Ideas Collection",
    "description": "Curated list of saved business opportunities with market analysis and execution insights",
    "itemListElement": [
      {
        "@type": "CreativeWork",
        "name": "Saved Business Opportunities",
        "description": "AI-analyzed startup ideas saved for personal reference and development",
        "genre": "Business Intelligence"
      }
    ]
  },
  "about": {
    "@type": "Thing",
    "name": "Entrepreneurial Opportunity Management",
    "description": "Personal curation of validated startup ideas for future pursuit"
  },
  "provider": {
    "@type": "Organization",
    "name": "Nugget Finder",
    "url": "https://nuggetfinder.ai"
  },
  "potentialAction": [
    {
      "@type": "OrganizeAction",
      "name": "Manage Saved Ideas",
      "description": "Organize and review saved startup opportunities"
    },
    {
      "@type": "ViewAction",
      "name": "Review Market Analysis",
      "description": "Access detailed market research for saved ideas"
    }
  ]
};

export default async function SavedIdeasPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Saved ideas page structured data */}
      <StructuredData data={savedIdeasSchema} />
      
      <RedirectToSignIn/>      
      <SavedIdeas />
    </div>
  );
}