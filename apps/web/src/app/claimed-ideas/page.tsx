import ClaimedIdeas from "@/components/ClaimedIdeas";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for claimed ideas page
export const metadata: Metadata = {
  title: "Claimed Startup Ideas | Active Projects | Nugget Finder",
  description: "Track your actively pursued startup opportunities. Monitor progress, access execution plans, and manage claimed business ideas you're building into real ventures.",
  openGraph: {
    title: "Claimed Startup Ideas | Nugget Finder",
    description: "Track your actively pursued startup opportunities with execution plans and progress monitoring.",
    url: "https://nuggetfinder.ai/claimed-ideas",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Claimed Startup Ideas - Active Projects - Nugget Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claimed Startup Ideas | Nugget Finder",
    description: "Track your actively pursued startup opportunities and execution progress",
    images: ["/logo.webp"],
  },
  keywords: [
    "claimed startup ideas",
    "active projects",
    "startup execution",
    "business development",
    "entrepreneurial ventures",
    "project tracking",
    "startup progress",
    "venture management",
    "business building",
    "startup portfolio"
  ],
  robots: {
    index: false, // Don't index personal project pages
    follow: true,
  },
};

// Collection page schema for claimed ideas (active projects)
const claimedIdeasSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Claimed Startup Ideas",
  "description": "Collection of actively pursued startup opportunities with execution plans and progress tracking",
  "url": "https://nuggetfinder.ai/claimed-ideas",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Active Startup Projects",
    "description": "Claimed business opportunities being actively developed into ventures",
    "itemListElement": [
      {
        "@type": "CreativeWork",
        "name": "Active Business Ventures",
        "description": "Startup ideas claimed for exclusive development with execution roadmaps",
        "genre": "Business Development"
      }
    ]
  },
  "about": {
    "@type": "Thing",
    "name": "Startup Execution Tracking",
    "description": "Active management and development of claimed business opportunities"
  },
  "provider": {
    "@type": "Organization",
    "name": "Nugget Finder",
    "url": "https://nuggetfinder.ai"
  },
  "potentialAction": [
    {
      "@type": "TrackAction",
      "name": "Monitor Progress",
      "description": "Track development progress of claimed startup ideas"
    },
    {
      "@type": "PlanAction",
      "name": "Execute Business Plan",
      "description": "Access and implement execution roadmaps for claimed opportunities"
    },
    {
      "@type": "OrganizeAction",
      "name": "Manage Active Projects",
      "description": "Organize and prioritize claimed startup ventures"
    }
  ]
};

export default async function ClaimedIdeasPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Claimed ideas page structured data */}
      <StructuredData data={claimedIdeasSchema} />
      
      <RedirectToSignIn/>
      <ClaimedIdeas />
    </div>
  );
}