import { Suspense } from "react";
import { PricingPage } from "@/components/PricingPage";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for pricing page
export const metadata: Metadata = {
  title: "Pricing Plans | AI-Powered Startup Ideas | Nugget Finder",
  description: "Choose the perfect plan for your startup journey. Free access to AI-generated ideas, Pro features for serious entrepreneurs, and Enterprise solutions for teams. Start building today.",
  openGraph: {
    title: "Pricing Plans | Nugget Finder",
    description: "Free startup ideas with Pro features for serious entrepreneurs. API access, unlimited ideas, and advanced market intelligence.",
    url: "https://nugget-finder.com/pricing",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Nugget Finder Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans | Nugget Finder",
    description: "Free startup ideas with Pro features for serious entrepreneurs. Start building today.",
    images: ["/logo.webp"],
  },
  keywords: [
    "startup ideas pricing",
    "AI market analysis subscription",
    "entrepreneur tools pricing",
    "business intelligence plans",
    "startup validation pricing",
    "API access pricing",
    "market research subscription"
  ],
};

// Pricing schema for structured data
const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nugget Finder",
  "description": "AI-powered startup idea discovery and market intelligence platform",
  "brand": {
    "@type": "Brand",
    "name": "Nugget Finder"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "description": "Access to daily startup ideas with basic market analysis",
      "price": "0",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "USD",
        "billingIncrement": "P1M"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "itemOffered": {
        "@type": "Service",
        "name": "Basic Startup Intelligence",
        "description": "Daily AI-generated startup ideas with basic market insights"
      }
    },
    {
      "@type": "Offer", 
      "name": "Pro Plan",
      "description": "Unlimited access to AI-generated ideas with advanced analytics and API access",
      "price": "29",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "29",
        "priceCurrency": "USD",
        "billingIncrement": "P1M"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "itemOffered": {
        "@type": "Service",
        "name": "Professional Startup Intelligence",
        "description": "Unlimited startup ideas, advanced market analysis, competitive research, and API access"
      }
    },
    {
      "@type": "Offer",
      "name": "Enterprise Plan", 
      "description": "Custom solutions for teams with priority support and advanced integrations",
      "price": "199",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "199",
        "priceCurrency": "USD", 
        "billingIncrement": "P1M"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "itemOffered": {
        "@type": "Service",
        "name": "Enterprise Startup Intelligence",
        "description": "Team collaboration, priority support, custom integrations, and dedicated account management"
      }
    }
  ]
};

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading pricing...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Pricing structured data for AI understanding */}
      <StructuredData data={pricingSchema} />
      
      <Suspense fallback={<PricingPageFallback />}>
        <PricingPage showFreeOption={true} />
      </Suspense>
    </div>
  );
}