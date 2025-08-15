import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StructuredData from "@/components/StructuredData";
import type { Metadata } from "next";

// This metadata object provides default SEO information for the entire site.
// Pages can override these defaults by exporting their own metadata object.
export const metadata: Metadata = {
  title: {
    default: "AI Startup Ideas, Validated by Real Market Signals",
    template: "%s | NuggetFinder",
  },
  description:
    "Discover AI startup ideas with simple, clear market analysis. Get validated business ideas, competitor insights, and step-by-step plans—fast.",
  keywords: [
    "AI startup ideas",
    "startup ideas",
    "market analysis",
    "business opportunities",
    "competitive research",
    "startup validation",
  ],
  authors: [
    {
      name: "NuggetFinder Team",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://nuggetfinder.ai",
    },
  ],
  creator: "NuggetFinder",
  publisher: "NuggetFinder",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://nuggetfinder.ai"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://nuggetfinder.ai",
    title: "AI Startup Ideas, Validated by Real Market Signals",
    description:
      "Discover AI startup ideas with simple, clear market analysis. Get validated business ideas, competitor insights, and step-by-step plans—fast.",
    siteName: "NuggetFinder",
    images: [
      { url: "/logo.webp", width: 1200, height: 630, alt: "NuggetFinder Logo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Startup Ideas, Validated by Real Market Signals",
    description:
      "Discover AI startup ideas with simple, clear market analysis. Get validated business ideas, competitor insights, and step-by-step plans—fast.",
    images: ["/logo.webp"],
    creator: "@nuggetfinder",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nugget Finder",
    url: "https://nuggetfinder.ai",
    logo: "https://nuggetfinder.ai/logo.webp",
    sameAs: [
      // "https://twitter.com/nuggetfinder", // Add your social media links
      // "https://www.linkedin.com/company/nugget-finder"
    ],
  };

  return (
    <>
      <StructuredData data={organizationSchema} />
      <div className="flex flex-col gap-6 bg-background">
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  );
}
