import Dashboard from "@/components/Dashboard";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for dashboard page
export const metadata: Metadata = {
  title: "Personal Dashboard | Track Your Startup Journey | Nugget Finder",
  description: "Monitor your saved startup ideas, claimed opportunities, and discovery analytics. Track your entrepreneurial progress with AI-powered insights and personalized recommendations.",
  openGraph: {
    title: "Personal Dashboard | Nugget Finder",
    description: "Monitor your startup ideas, track progress, and get personalized AI insights for your entrepreneurial journey.",
    url: "https://nuggetfinder.ai/dashboard",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Personal Startup Dashboard - Nugget Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Dashboard | Nugget Finder",
    description: "Track your startup ideas and entrepreneurial progress with AI-powered insights",
    images: ["/logo.webp"],
  },
  keywords: [
    "startup dashboard",
    "entrepreneurship tracker",
    "business idea management",
    "startup progress monitoring",
    "AI insights dashboard",
    "idea analytics",
    "personal business tools",
    "startup metrics",
    "entrepreneurial journey",
    "business opportunity tracker"
  ],
  robots: {
    index: false, // Don't index personal dashboard pages
    follow: true,
  },
};

// Dashboard page schema for user-specific functionality
const dashboardSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "name": "Startup Ideas Dashboard",
  "description": "Personal dashboard for tracking startup ideas, progress metrics, and AI-powered entrepreneurial insights",
  "url": "https://nuggetfinder.ai/dashboard",
  "mainEntity": {
    "@type": "Person",
    "description": "Entrepreneur using AI-powered startup intelligence",
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "Startup Intelligence Access",
      "description": "Access to AI-powered startup idea generation and market analysis"
    }
  },
  "about": {
    "@type": "Thing",
    "name": "Entrepreneurial Progress Tracking",
    "description": "Personal analytics and insights for startup idea development"
  },
  "provider": {
    "@type": "Organization",
    "name": "Nugget Finder",
    "url": "https://nuggetfinder.ai"
  },
  "potentialAction": [
    {
      "@type": "ViewAction",
      "name": "View Saved Ideas",
      "description": "Access saved startup opportunities",
      "target": "https://nuggetfinder.ai/saved-ideas"
    },
    {
      "@type": "ViewAction", 
      "name": "View Claimed Ideas",
      "description": "Track actively pursued opportunities",
      "target": "https://nuggetfinder.ai/claimed-ideas"
    },
    {
      "@type": "SearchAction",
      "name": "Discover New Ideas",
      "description": "Find new startup opportunities",
      "target": "https://nuggetfinder.ai/browse"
    }
  ]
};

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard page structured data */}
      <StructuredData data={dashboardSchema} />
      
      <RedirectToSignIn />
      <Dashboard />
    </div>
  );
}