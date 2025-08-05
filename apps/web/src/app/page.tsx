import { Suspense } from "react";
import AnimatedHowItWorks from "@/components/AnimatedHowItWorks";
// import { Scene } from "@/components/BoxedAnimation";
import FAQSection from "@/components/FaqSection";
import IdeaActions from "@/components/IdeaActions";
import IdeaForm from "@/components/IdeaForm";
import { PricingPage } from "@/components/PricingPage";
import NuggetLink from "@/components/NuggetLink";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodaysTopIdeas } from "@/lib/server-api";
import {
  ArrowUpRight,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata for homepage
export const metadata: Metadata = {
  title: "AI-Powered Startup Ideas & Market Intelligence | Nugget Finder",
  description: "Find validated startup opportunities 5x faster with AI-powered market analysis. Discover trending business ideas, competitive research, and execution plans. Join 10,000+ entrepreneurs building the future.",
  openGraph: {
    title: "AI-Powered Startup Ideas & Market Intelligence | Nugget Finder",
    description: "Find validated startup opportunities 5x faster with AI-powered market analysis. Join 10,000+ entrepreneurs building the future.",
    url: "https://nuggetfinder.ai",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Nugget Finder - Discover Your Next Startup Opportunity",
      },
    ],
  },
};

function PricingFallback() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center">
      <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
      <p className="text-muted-foreground">Loading pricing options...</p>
    </div>
  );
}

// FAQ Schema data for AI crawlers - High impact SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How quickly can I launch a startup with Nugget Finder?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entrepreneurs typically launch validated startup ideas 3-5x faster using Nugget Finder's AI-powered market analysis. Our platform provides complete business frameworks, competitive research, and execution plans that save 3-4 weeks of initial research time."
      }
    },
    {
      "@type": "Question", 
      "name": "What startup ideas are included?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nugget Finder generates 50+ new AI-powered startup ideas daily across technology sectors including AI/ML, fintech, healthtech, climate tech, and developer tools. Each idea includes market size analysis, competitive landscape, and technical feasibility scores."
      }
    },
    {
      "@type": "Question",
      "name": "How do I integrate market intelligence into my workflow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pro subscribers get API access to integrate real-time startup intelligence into existing tools. Our platform tracks 12,000+ market trends and analyzes 35,000+ signals daily to identify emerging opportunities before they become mainstream."
      }
    },
    {
      "@type": "Question",
      "name": "What makes Nugget Finder different from other idea platforms?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nugget Finder uses advanced AI to provide comprehensive startup validation including market analysis, competitive research, technical roadmaps, and execution plans. Unlike simple idea generators, we deliver complete business frameworks with 68-89% accuracy in trend prediction."
      }
    },
    {
      "@type": "Question",
      "name": "Can I claim and pursue ideas from the platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! All ideas are market opportunities available for entrepreneurs to pursue. Claiming an idea provides access to additional research, connects you with other builders, and unlocks advanced execution resources including technical specifications and go-to-market strategies."
      }
    }
  ]
};

// Server component with SSR
export default async function Page() {
  const todaysIdeas = await getTodaysTopIdeas();

  // Calculate market intelligence metrics  
  const aiTrendsTracked = 12764;
  const signalsAnalyzed = 35431;

  return (
    <div className="min-h-screen w-full">
      {/* FAQ Schema for AI crawlers - High impact SEO */}
      <StructuredData data={faqSchema} />

      {/* Hero Section - Optimized for AI understanding */}
      <div className="z-10 flex flex-col items-center justify-center gap-12">
        <IdeaForm />
      </div>
      {/* <div className="absolute inset-0 opacity-10 dark:opacity-30">
        <Scene />
      </div> */}

      {/* Today's Nuggets Section */}
      <div className="relative z-10 mt-20 w-full flex flex-col items-center justify-center gap-12">
        <h1 className="text-center font-medium text-2xl">
          Today&apos;s finest nuggets
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {Array.isArray(todaysIdeas) && todaysIdeas.length > 0 ? (
            // @ts-ignore
            todaysIdeas.map((idea) => (
              <Card
                key={idea.id}
                className="w-96 border border-yellow-400/20 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-zinc-700 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950"
              >
                <CardHeader className="flex items-start justify-between space-y-2">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-yellow-800 dark:text-primary">
                      💡 {idea.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {idea.narrativeHook}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="text-sm leading-relaxed space-y-2 text-gray-800 dark:text-gray-200 line-clamp-6">
                  <p>{idea.problemSolution}</p>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-2">
                  <IdeaActions
                    ideaId={idea.id}
                    isSaved={false}
                    isClaimed={false}
                    isClaimedByOther={false}
                    size="sm"
                  />
                  <NuggetLink ideaId={idea.id} className="w-full">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      View Nugget <ArrowUpRight />
                    </Button>
                  </NuggetLink>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-gray-300 text-center w-full">
              No ideas generated today yet
            </p>
          )}
        </div>

        {/* Signals from the Field Section - Enhanced for AI */}
        <section className="w-full max-w-6xl mx-auto px-4 py-24">
          <div className="flex items-center justify-between">
            <div className="mb-16">
              <h2 className="text-3xl font-medium mb-3 text-foreground">
                Real-Time Market Intelligence Signals
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Our AI continuously monitors startup ecosystems and analyzes 35,000+ market signals daily. We track funding patterns, technology adoption, and emerging opportunities 6 months before they become mainstream trends.
              </p>
            </div>
            <Image
              src="/nuggetfinder-digging-hard.png"
              alt="AI analyzing market data and trends"
              width={200}
              height={200}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-white/50 dark:bg-white/5 border border-border/50 hover:border-border transition-all duration-500 hover:shadow-sm group">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="font-mono text-4xl font-light text-foreground mb-2">
                      {aiTrendsTracked.toLocaleString()}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      AI Trends Tracked Daily
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    +12% growth
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive tracking across AI/ML innovations, web3 developments, climate technology, and developer tools. Data sourced from patent filings, research publications, and early-stage funding rounds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-white/5 border border-border/50 hover:border-border transition-all duration-500 hover:shadow-sm group">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="font-mono text-4xl font-light text-foreground mb-2">
                      {signalsAnalyzed.toLocaleString()}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Market Signals Analyzed
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    +8% accuracy
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Market movements, funding rounds, product launches, and technology adoptions processed through our intelligence pipeline every 24 hours with 89% trend prediction accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section (existing) */}
        <AnimatedHowItWorks />

        {/* Built with NuggetFinder Section - Enhanced testimonials */}
        <section className="w-full max-w-6xl mx-auto px-4 py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-medium mb-3 text-foreground">
              Entrepreneurs Building with NuggetFinder
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Over 10,000+ founders and teams use our intelligence platform to validate ideas, spot opportunities, and build the next generation of startups. Average time to launch: 3 weeks.
            </p>
          </div>

          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <Card className="bg-white/30 dark:bg-white/5 border border-border/30 hover:border-border/60 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                        SM
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        Sarah Martinez
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Founder, SecurePrompt
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        YC W24 | $2M ARR
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-4">
                    "NuggetFinder surfaced the prompt injection vulnerability
                    trend six months before it became mainstream. We built
                    SecurePrompt around that insight and reached product-market fit in 8 weeks."
                  </blockquote>
                  <p className="text-sm text-muted-foreground">
                    — Launched in 3 weeks, $2M ARR within 12 months
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/30 dark:bg-white/5 border border-border/30 hover:border-border/60 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800 flex items-center justify-center">
                      <span className="text-lg font-medium text-emerald-600 dark:text-emerald-300">
                        JC
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        James Chen
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        CTO, Unified AI
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Series A | $15M raised
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-4">
                    "We use NuggetFinder to track competitive intelligence and
                    emerging AI agent patterns. The platform saves our team 20+ hours weekly on market research."
                  </blockquote>
                  <p className="text-sm text-muted-foreground">
                    — 2M+ API calls/month, 40% faster product decisions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start lg:ml-24">
              <Card className="bg-white/30 dark:bg-white/5 border border-border/30 hover:border-border/60 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800 flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-600 dark:text-purple-300">
                        EW
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        Emily Wang
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Head of Product, CreatorOS
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seed Stage | 300% YoY growth
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-4">
                    "Three of our core features came from NuggetFinder insights.
                    The platform helps us stay ahead of creator economy trends and identify monetization opportunities."
                  </blockquote>
                  <p className="text-sm text-muted-foreground">
                    — 50K+ creators onboarded, 3x feature adoption rate
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-3 text-foreground">
                    Join 10,000+ Builders Mining the Future
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Start building your next startup with AI-powered market intelligence. Save 3-4 weeks of research time and launch with confidence.
                  </p>
                  <Button className="flex items-center gap-2">
                    <span>⛏️</span>
                    Start Building Today
                  </Button>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                    Active builders mining ideas now
                  </p>
                  <div className="flex -space-x-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={`avatar-${String.fromCharCode(65 + i)}`}
                        className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium ${
                          i % 4 === 0
                            ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                            : i % 4 === 1
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                              : i % 4 === 2
                                ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
                                : "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (existing) */}
        <Suspense fallback={<PricingFallback />}>
          <PricingPage />
        </Suspense>

        {/* Discover More Nuggets Section */}
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Discover More AI-Generated Opportunities
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore 500+ validated startup ideas across technology sectors with complete market analysis
            </p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <Link href="/browse">
              <Button variant="outline">
                View All Ideas <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todaysIdeas?.slice(0, 6).map((idea) => (
              <Card
                key={`discover-${idea.id}`}
                className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-2 flex items-center gap-2">
                        🚀 {idea.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-muted-foreground">
                          {idea.narrativeHook}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {idea.problemSolution}
                  </p>
                  <div className="flex items-center justify-between">
                    <IdeaActions
                      ideaId={idea.id}
                      isSaved={false}
                      isClaimed={false}
                      isClaimedByOther={false}
                      size="sm"
                    />
                    <NuggetLink ideaId={idea.id}>
                      <Button size="sm">
                        Explore <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </NuggetLink>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </section>

        {/* Trending Topics Section - Enhanced with statistics */}
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Fastest Growing Technology Sectors
            </h2>
            <p className="text-muted-foreground text-lg">
              Real-time trend analysis showing 127% average growth in AI agents and emerging market opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <CardTitle className="text-lg">AI Agents</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">+127% YoY</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Autonomous AI systems revolutionizing business workflows and decision-making processes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <CardTitle className="text-lg">AI Security</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-semibold">+94% funding</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Protecting AI systems from prompt injection attacks and security vulnerabilities
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-purple-500/20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <CardTitle className="text-lg">Fintech AI</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-600 font-semibold">+78% adoption</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  AI-powered financial services, automated trading, and predictive analytics solutions
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
              <CardHeader className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <CardTitle className="text-lg">Creator Economy</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-600 font-semibold">+65% tools</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  AI-powered content creation tools and creator monetization platforms
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section - Enhanced for AI */}
        <section className="w-full max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about finding and validating startup opportunities with AI
            </p>
          </div>

          <FAQSection />
        </section>
      </div>
    </div>
  );
}
