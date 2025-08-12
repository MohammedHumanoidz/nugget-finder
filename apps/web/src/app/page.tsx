import AnimatedHowItWorks from "@/components/AnimatedHowItWorks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
// import { Scene } from "@/components/BoxedAnimation";
import FeaturedNuggetsGrid from "@/components/FeaturedNuggetsGrid";
import { HeroSection } from "@/components/HeroSection";
import LandingFAQSection from "@/components/LandingFAQSection";
import NuggetsCards from "@/components/nuggetsCards";
import { PricingPage } from "@/components/PricingPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { getLatestIdeasForDiscover, getTodaysTopIdeas } from "@/lib/server-api";
import Link from "next/link";

function PricingFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
      <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
      <p className="text-muted-foreground">Loading pricing options...</p>
    </div>
  );
}

// Server component with SSR
export default async function Page() {
  const todaysIdeas = await getTodaysTopIdeas();
  
  const discoverIdeas = await getLatestIdeasForDiscover();

  // Calculate market intelligence metrics
  const aiTrendsTracked = 12764;
  const signalsAnalyzed = 35431;

  return (
    <div className="min-h-screen w-full">
      {/* New Hero */}
      <HeroSection />

      {/* Featured Nuggets using today's ideas as placeholders */}
      {Array.isArray(todaysIdeas) && todaysIdeas.length > 0 && (
        <FeaturedNuggetsGrid
          nuggets={todaysIdeas.map((i: any) => ({
            id: i.id,
            title: i.title,
            narrativeHook: i.narrativeHook,
            problemStatement: i.problemStatement || i.problemSolution,
            description: i.description || i.problemSolution,
            tags: i.tags || [],
            innovationLevel: i.innovationLevel,
            timeToMarket: i.timeToMarket,
            urgencyLevel: i.urgencyLevel,
          }))}
        />
      )}

      {/* How It Works Section (existing) with anchor */}
      <div id="how-it-works">
        <AnimatedHowItWorks />
      </div>

      {/* Built with NuggetFinder Section (existing) */}
      <section className="mx-auto w-full max-w-6xl px-4 py-24">
        <div className="mb-16">
          <h2 className="mb-3 font-medium text-3xl text-foreground">
            Built with NuggetFinder
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Founders and teams using our intelligence platform to validate
            ideas, spot opportunities, and build the next generation of
            startups.
          </p>
        </div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <Card className="border border-border/30 bg-white/30 transition-all duration-300 hover:border-border/60 dark:bg-white/5">
              <CardContent className="p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <span className="font-medium text-lg text-slate-600 dark:text-slate-300">
                      SM
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      Sarah Martinez
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Founder, SecurePrompt
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">YC W24</p>
                  </div>
                </div>
                <blockquote className="mb-4 text-foreground leading-relaxed">
                  "NuggetFinder surfaced the prompt injection vulnerability
                  trend six months before it became mainstream. We built
                  SecurePrompt around that insight."
                </blockquote>
                <p className="text-muted-foreground text-sm">
                  — Launched in 3 weeks
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/30 bg-white/30 transition-all duration-300 hover:border-border/60 dark:bg-white/5">
              <CardContent className="p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800">
                    <span className="font-medium text-emerald-600 text-lg dark:text-emerald-300">
                      JC
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">James Chen</h3>
                    <p className="text-muted-foreground text-sm">
                      CTO, Unified AI
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Series A
                    </p>
                  </div>
                </div>
                <blockquote className="mb-4 text-foreground leading-relaxed">
                  "We use NuggetFinder to track competitive intelligence and
                  emerging AI agent patterns. It's become essential to our
                  product roadmap."
                </blockquote>
                <p className="text-muted-foreground text-sm">
                  — 2M+ API calls/month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:ml-24 lg:grid-cols-2">
            <Card className="border border-border/30 bg-white/30 transition-all duration-300 hover:border-border/60 dark:bg-white/5">
              <CardContent className="p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800">
                    <span className="font-medium text-lg text-purple-600 dark:text-purple-300">
                      EW
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">Emily Wang</h3>
                    <p className="text-muted-foreground text-sm">
                      Head of Product, CreatorOS
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Seed Stage
                    </p>
                  </div>
                </div>
                <blockquote className="mb-4 text-foreground leading-relaxed">
                  "Three of our core features came from NuggetFinder insights.
                  The platform helps us stay ahead of creator economy trends."
                </blockquote>
                <p className="text-muted-foreground text-sm">
                  — 50K+ creators onboarded
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <h3 className="mb-3 font-medium text-foreground text-xl">
                  Join the NuggetFinder Network
                </h3>
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  Connect with builders who are mining the future, one insight
                  at a time.
                </p>
                <Button className="flex items-center gap-2">
                  <span>⛏️</span>
                  Start Building
                </Button>
              </div>

              <div>
                <p className="mb-3 text-muted-foreground text-xs uppercase tracking-wide">
                  Active builders mining ideas now
                </p>
                <div className="-space-x-2 flex">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`avatar-${String.fromCharCode(65 + i)}`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-background font-medium text-xs ${
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

      <div className="relative z-10 mt-20 flex w-full flex-col items-center justify-center gap-12">
        <p className="text-center font-medium text-2xl">
          Latest finest nuggets
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-center justify-center">
          {Array.isArray(discoverIdeas) && discoverIdeas.length > 0 ? (
            discoverIdeas?.slice(0, 6).map((idea: any) => {
              return (
                <div key={idea.id} className="w-96">
                  <NuggetsCards 
                  className="flex h-[57dvh] justify-center"
                    nugget={idea}  />
                </div>
              );
            })
          ) : (
            <p className="w-full text-center text-gray-300">
              No ideas available yet
            </p>
          )}
        </div>
        <Link href={"/browse"}>
          <Button>View All Nuggets</Button>
        </Link>

        {/* Signals from the Field Section */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24">
          <div className="flex items-center justify-between">
            <div className="mb-16">
              <h2 className="mb-3 font-medium text-3xl text-foreground">
                Signals from the Field
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Real-time intelligence gathered from our continuous monitoring
                of startup ecosystems, funding patterns, and emerging technology
                adoption.
              </p>
            </div>
            <Image
              src="/nuggetfinder-digging-hard.png"
              alt="digging hard"
              width={200}
              height={200}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Card className="group border border-border/50 bg-white/50 transition-all duration-500 hover:border-border hover:shadow-sm dark:bg-white/5">
              <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="mb-2 font-light font-mono text-4xl text-foreground">
                      {aiTrendsTracked.toLocaleString()}
                    </div>
                    <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                      Trends Tracked
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs dark:text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    +12%
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Emerging patterns across AI/ML, web3, climate tech, and
                  developer tools—tracked through patent filings, research
                  publications, and early-stage funding.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-border/50 bg-white/50 transition-all duration-500 hover:border-border hover:shadow-sm dark:bg-white/5">
              <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="mb-2 font-light font-mono text-4xl text-foreground">
                      {signalsAnalyzed.toLocaleString()}
                    </div>
                    <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                      Signals Analyzed
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 text-xs dark:text-blue-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    +8%
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Market movements, funding rounds, product launches, and
                  technology adoptions processed through our intelligence
                  pipeline every 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Pricing Section (existing) */}
      <Suspense fallback={<PricingFallback />}>
        <PricingPage />
      </Suspense>

      {/* FAQ Section (landing new) before final CTA */}
      <LandingFAQSection />
    </div>
  );
}
