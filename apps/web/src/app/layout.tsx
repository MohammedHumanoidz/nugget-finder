import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

const manrope = Manrope({
  subsets: ["latin"],
});

// This metadata object provides default SEO information for the entire site.
// Pages can override these defaults by exporting their own metadata object.
export const metadata: Metadata = {
  title: {
    default: "Nugget Finder | AI-Powered Startup Ideas & Market Intelligence",
    template: "%s | Nugget Finder"
  },
  description: "Discover validated startup opportunities with AI-powered market analysis. Get comprehensive business ideas, competitive research, and execution plans. Find your next big opportunity 5x faster.",
  keywords: [
    "startup ideas",
    "AI market analysis", 
    "business opportunities",
    "competitive research",
    "market intelligence",
    "startup validation",
    "entrepreneurship",
    "business ideas generator",
    "market trends",
    "startup finder"
  ],
  authors: [{ name: "Nugget Finder Team" }],
  creator: "Nugget Finder",
  publisher: "Nugget Finder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nuggetfinder.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nuggetfinder.ai",
    title: "Nugget Finder | AI-Powered Startup Ideas & Market Intelligence",
    description: "Discover validated startup opportunities with AI-powered market analysis.",
    siteName: "Nugget Finder",
    images: [ { url: "/logo.webp", width: 1200, height: 630, alt: "Nugget Finder Logo" } ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nugget Finder | AI-Powered Startup Ideas & Market Intelligence",
    description: "Discover validated startup opportunities with AI-powered market analysis.",
    images: ["/logo.webp"],
    creator: "@nuggetfinder", // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};

// Organization schema data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nugget Finder",
  "description": "AI-powered platform for discovering and validating startup ideas through intelligent market analysis",
  "url": "https://nuggetfinder.ai",
  "logo": "https://nuggetfinder.ai/logo.webp",
  "foundingDate": "2024",
  "industry": "Technology, Artificial Intelligence, Market Research",
  "serviceArea": "Global",
  "sameAs": [
    "https://twitter.com/nuggetfinder",
    "https://github.com/nuggetfinder"
  ],
  "offers": {
    "@type": "Service", 
    "name": "AI-Powered Startup Idea Generation",
    "description": "Comprehensive startup opportunity analysis with market research and validation",
    "provider": {
      "@type": "Organization",
      "name": "Nugget Finder"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Startup Intelligence Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Market Analysis",
            "description": "AI-powered competitive landscape and market opportunity analysis"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Idea Validation",
            "description": "Comprehensive startup idea scoring and feasibility assessment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Trend Intelligence",
            "description": "Real-time monitoring of emerging technology and market trends"
          }
        }
      ]
    }
  }
};

// Website schema data
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nugget Finder",
  "description": "AI-powered startup idea discovery and market intelligence platform",
  "url": "https://nuggetfinder.ai",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
              "urlTemplate": "https://nuggetfinder.ai/browse?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "mainEntity": {
    "@type": "SoftwareApplication",
    "name": "Nugget Finder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "AI-powered platform for discovering validated startup opportunities through intelligent market analysis and trend detection",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free access to startup ideas with premium features available"
    },
    "featureList": [
      "AI-generated startup ideas",
      "Market opportunity analysis", 
      "Competitive landscape research",
      "Business model recommendations",
      "Technical feasibility assessment",
      "Real-time trend tracking"
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nugget Finder",
    "url": "https://nuggetfinder.ai",
    "logo": "https://nuggetfinder.ai/logo.webp",
    "sameAs": [
      // "https://twitter.com/nuggetfinder", // Add your social media links
      // "https://www.linkedin.com/company/nugget-finder"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema for trust and AI understanding */}
        <StructuredData data={organizationSchema} />
        
        {/* Website Schema for AI understanding */}
        <StructuredData data={websiteSchema} />
      </head>
      <body className={`${manrope.className}`}>
        <Providers>
          <div className="flex flex-col gap-6 bg-background">
            <Navbar />
            {children}
            <Footer/>
          </div>
        </Providers>
      </body>
    </html>
  );
}
