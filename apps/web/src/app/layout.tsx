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
    template: "%s | Nugget Finder", // Used for child pages, e.g., "Pricing | Nugget Finder"
  },
  description: "Discover validated startup opportunities with AI-powered market analysis. Get comprehensive business ideas, competitive research, and execution plans. Find your next big opportunity 5x faster.",
  keywords: [ "startup ideas", "AI market analysis", "business opportunities", "competitive research", "market intelligence", "startup validation" ],
  authors: [{ name: "Nugget Finder Team", url: "https://nuggetfinder.ai" }],
  creator: "Nugget Finder",
  publisher: "Nugget Finder",
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
        <StructuredData data={organizationSchema} />
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
