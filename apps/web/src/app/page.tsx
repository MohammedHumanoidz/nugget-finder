import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, TrendingUp } from 'lucide-react';
import AnimatedHowItWorks from '@/components/AnimatedHowItWorks';
import Navbar from '@/components/Navbar';
import StatsCards from '@/components/StatsCards';
import IdeaScoreBreakdown from '@/components/IdeaScoreBreakdown';
import ClientFallback from '@/components/ClientFallback';
import { getDailyIdeas } from '@/lib/server-api';

// Server component with SSR
export default async function Page() {
  // Fetch data server-side with caching
  const ideasResponse = await getDailyIdeas();
  const dailyIdeas = ideasResponse?.ideas || [];

  // If no data from server-side, use client fallback
  if (!dailyIdeas || dailyIdeas.length === 0) {
    console.log('No server data, using client fallback');
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ClientFallback type="home" />
      </div>
    );
  }
  
  // Get featured nugget (latest idea)
  const featuredNugget = dailyIdeas[0];
  
  // Get other nuggets for the grid
  const otherNuggets = dailyIdeas.slice(1, 7); // Take up to 6 other ideas
  
  // Calculate market intelligence metrics
  const aiTrendsTracked = dailyIdeas.reduce((sum: number, idea: any) => {
    return sum + (idea.problemGaps?.problems?.length || 0);
  }, 0);
  
  const signalsAnalyzed = dailyIdeas.reduce((sum: number, idea: any) => {
    const whyNowData = idea.whyNow?.supportingData?.length || 0;
    const revenueStreams = idea.monetizationStrategy?.revenueStreams?.length || 0;
    const financialProjections = idea.monetizationStrategy?.financialProjections?.length || 0;
    return sum + whyNowData + revenueStreams + financialProjections;
  }, 0);
  
  const marketOpportunities = dailyIdeas.length;
  const activeUsers = 0; // Hardcoded as requested

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Nuggets Mined Today */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🆕 NUGGETS MINED TODAY 🌟</h1>
          <div className="w-24 h-1 bg-primary mx-auto"/>
        </div>

        {featuredNugget && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{featuredNugget.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-green-600/10 border border-green-600 text-foreground px-3 py-1 rounded-full text-sm font-medium">✅ Unfair Advantage</span>
                <span className="bg-purple-600/10 border border-purple-600 text-foreground px-3 py-1 rounded-full text-sm font-medium">✅ Product Ready</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {featuredNugget.description}
              </p>

              {/* Score Metrics */}
              <StatsCards idea={featuredNugget} />

              {/* Idea Score Breakdown Section */}
              <IdeaScoreBreakdown idea={featuredNugget} />
            </CardContent>
            
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/nugget/${featuredNugget.id}`}>Read Full Analysis →</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </section>

      {/* Market Intelligence Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Market Intelligence</h2>
          <p className="text-muted-foreground">Real-time data powering our AI-driven trend analysis platform</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Trends Tracked</CardTitle>
              <CardDescription>
                Our AI system has identified and structured {aiTrendsTracked} unique market signals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{aiTrendsTracked}</div>
                <div className="text-muted-foreground">Structured Problems</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signals Analyzed</CardTitle>
              <CardDescription>
                We've processed {signalsAnalyzed} raw signals from multiple problems from various Reddit, Twitter, Hacker News, and industry forums.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{signalsAnalyzed}</div>
                <div className="text-muted-foreground">Data Points Processed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Opportunities</CardTitle>
              <CardDescription>
                {marketOpportunities} detailed business reports have been generated and published
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{marketOpportunities}</div>
                <div className="text-muted-foreground">Detailed Reports</div>
                <div className="text-sm text-muted-foreground mt-2">Active Users: {activeUsers}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Choose Your Path (Pricing) Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Path</h2>
          <p className="text-muted-foreground">Flexible options for every innovator. Start free, grow fast.</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>[Best for exploring]</CardDescription>
              <div className="text-3xl font-bold">FREE</div>
              <p className="text-sm text-muted-foreground">Basic access for individuals.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  5 ideas/day
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Limited trend searches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  No historical data access
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Get Started</Button>
            </CardFooter>
          </Card>

          <Card className="border-orange-500 border-2 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most popular</span>
            </div>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>[Most popular]</CardDescription>
              <div className="text-3xl font-bold">$29/mo</div>
              <p className="text-sm text-muted-foreground">For individuals.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  5 ideas/day
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  50 trend searches/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  7-day historical data access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  3 idea claims/month
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>[For power users]</CardDescription>
              <div className="text-3xl font-bold">$79/mo</div>
              <p className="text-sm text-muted-foreground">For users.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  10 ideas/day
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Unlimited trend searches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Full historical idea database
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  10 idea claims/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Community signals dashboard
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Community Signals Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Community Signals</h2>
          <p className="text-muted-foreground">See how the conversation is growing across platforms.</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">R</div>
                Reddit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,800</div>
              <div className="text-muted-foreground">Members</div>
              <div className="text-lg font-semibold mt-2">4.2</div>
              <div className="text-muted-foreground">Engagement</div>
              <div className="mt-4 space-y-1 text-sm">
                <div>#aiagents</div>
                <div>#automation</div>
                <div>#startups</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">F</div>
                Facebook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9,500</div>
              <div className="text-muted-foreground">Members</div>
              <div className="text-lg font-semibold mt-2">3.8</div>
              <div className="text-muted-foreground">Engagement</div>
              <div className="mt-4 space-y-1 text-sm">
                <div>#smb</div>
                <div>#growth</div>
                <div>#community</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">Y</div>
                YouTube
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,300</div>
              <div className="text-muted-foreground">Members</div>
              <div className="text-lg font-semibold mt-2">5.1</div>
              <div className="text-muted-foreground">Engagement</div>
              <div className="mt-4 space-y-1 text-sm">
                <div>#tutorials</div>
                <div>#ai</div>
                <div>#reviews</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">O</div>
                Other
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,200</div>
              <div className="text-muted-foreground">Members</div>
              <div className="text-lg font-semibold mt-2">2.9</div>
              <div className="text-muted-foreground">Engagement</div>
              <div className="mt-4 space-y-1 text-sm">
                <div>#discord</div>
                <div>#forums</div>
                <div>#slack</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trending Topics Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Trending Topics</h2>
          <p className="text-muted-foreground">Explore the fastest-growing AI domains right now.</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">5,400</span>
                <span className="text-green-600 font-semibold">+22%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Rapidly growing use of autonomous AI agents in business workflows.
              </p>
              {/* Sparkline placeholder */}
              <div className="h-8 bg-muted rounded flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Healthcare AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">2,900</span>
                <span className="text-green-600 font-semibold">+18%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-driven diagnostics and patient management are on the rise.
              </p>
              {/* Sparkline placeholder */}
              <div className="h-8 bg-muted rounded flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fintech AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">3,200</span>
                <span className="text-green-600 font-semibold">+15%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI is transforming financial services and risk management.
              </p>
              {/* Sparkline placeholder */}
              <div className="h-8 bg-muted rounded flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Robotics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">2,100</span>
                <span className="text-green-600 font-semibold">+12%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Robotics and automation are on the rise, adoption in industry.
              </p>
              {/* Sparkline placeholder */}
              <div className="h-8 bg-muted rounded flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline">See all trends</Button>
        </div>
      </section>

      {/* Community Momentum Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Community Momentum</h2>
          <p className="text-muted-foreground">Join a thriving network of innovators, founders, and AI enthusiasts across the globe.</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">AK</div>
                Twitter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Alice Kim</div>
                <div className="text-muted-foreground">AI Researcher</div>
                <div className="text-muted-foreground">San Francisco, CA</div>
              </div>
              <div className="mt-4">
                <div className="font-semibold">12,400 members</div>
                <div className="text-green-600 text-sm">+12% growth this month</div>
              </div>
              <blockquote className="mt-4 text-sm italic">
                "The best place to discover new AI trends!"
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">BL</div>
                LinkedIn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Bob Lee</div>
                <div className="text-muted-foreground">Startup Founder</div>
                <div className="text-muted-foreground">London, UK</div>
              </div>
              <div className="mt-4">
                <div className="font-semibold">9,800 members</div>
                <div className="text-green-600 text-sm">+9% growth this month</div>
              </div>
              <blockquote className="mt-4 text-sm italic">
                "Helped me connect with top founders and investors."
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">CS</div>
                Product Hunt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Carol Smith</div>
                <div className="text-muted-foreground">Product Manager</div>
                <div className="text-muted-foreground">Berlin, DE</div>
              </div>
              <div className="mt-4">
                <div className="font-semibold">7,200 members</div>
                <div className="text-green-600 text-sm">+15% growth this month</div>
              </div>
              <blockquote className="mt-4 text-sm italic">
                "A must-follow for anyone in the AI space."
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">DP</div>
                Global Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Dave Patel</div>
                <div className="text-muted-foreground">Community Lead</div>
                <div className="text-muted-foreground">Bangalore, IN</div>
              </div>
              <div className="mt-4">
                <div className="font-semibold">15,600 members</div>
                <div className="text-green-600 text-sm">+11% growth this month</div>
              </div>
              <blockquote className="mt-4 text-sm italic">
                "The global AI community is thriving here!"
              </blockquote>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button>Join the Community</Button>
        </div>
      </section>

      {/* How It Works Section - Animated */}
      <AnimatedHowItWorks />

      {/* Mine Other Nuggets Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">⛏️ MINE OTHER NUGGETS 💡</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherNuggets.map((nugget: any) => (
            <Card key={nugget.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{nugget.title || "Nugget Title"}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {nugget.description || "Short description of this startup opportunity and its market potential."}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full">
                  <Link href={`/nugget/${nugget.id}`}>View Idea →</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {/* Fill remaining slots if we have fewer than 6 nuggets */}
          {Array.from({ length: Math.max(0, 6 - otherNuggets.length) }).map((_, index) => (
            <Card key={`placeholder-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Nugget Title {otherNuggets.length + index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  Short description of this startup opportunity and its market potential.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" disabled>View Idea →</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/browse">Browse more ideas →</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 NuggetFinder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}