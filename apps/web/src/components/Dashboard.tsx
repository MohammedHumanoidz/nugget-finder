"use client";

import { motion } from "framer-motion";
import {
  BookmarkIcon,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Percent,
  Lightbulb,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Badge,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";

// Mock data for the chart - in real app this would come from API
const generateChartData = () => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      day: date.getDate(),
      saved: Math.floor(Math.random() * 5) + 1,
      claimed: Math.floor(Math.random() * 3) + 1,
    };
  });
  return days;
};
export default function Dashboard() {
  const { data: session } = authClient.useSession();
  // Fetch user data
  const { data: limits } = useQuery(trpc.ideas.getLimits.queryOptions());
  const { data: savedIdeas } = useQuery(
    trpc.ideas.getSavedIdeas.queryOptions()
  );
  const { data: claimedIdeas } = useQuery(
    trpc.ideas.getClaimedIdeas.queryOptions()
  );

  const chartData = generateChartData();

  // Calculate metrics
  const totalSaved = savedIdeas?.length || 0;
  const totalClaimed = claimedIdeas?.length || 0;
  const totalViews = limits?.viewsRemaining || 0;
  const totalActivity = totalSaved + totalClaimed + totalViews;

  // Mock percentage changes (in real app, calculate from historical data)
  const savedChange = 12; // +12%
  const claimedChange = -5; // -5%
  const activityChange = 8; // +8%

  // Calculate engagement rate
  const engagementRate =
    totalViews > 0
      ? Math.min(((totalSaved + totalClaimed) / totalViews) * 100, 100)
      : 0;

  // Member since calculations
  const memberSince = new Date(session?.user?.createdAt ?? new Date());
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24)
  );
  const memberSinceText = `${memberSince.toLocaleDateString("en-US", { month: "long", year: "numeric" })}, ${daysSince} days ago`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {session?.user?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Discover your next big idea and track your entrepreneurial journey
            </p>
          </motion.div>

          {/* Metric Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Saved Ideas Card */}
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Saved Ideas
                  </CardTitle>
                  <BookmarkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSaved}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{savedChange}%</span>
                    <span>from last month</span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                  >
                    <Link href="/saved-ideas">View Saved</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Claimed Ideas Card */}
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Claimed Ideas
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClaimed}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">{claimedChange}%</span>
                    <span>from last month</span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                  >
                    <Link href="/claimed-ideas">View Claimed</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Member Since Card */}
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Member Since
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold">{memberSinceText}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Thanks for being part of our community! 🚀
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Activity Card */}
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Activity
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActivity}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{activityChange}%</span>
                    <span>from last month</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Claims + Saves + Views
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Activity Summary and Quick Actions Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Activity Summary Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Activity Summary</span>
                  </CardTitle>
                  <CardDescription>Your engagement overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ideas Explored</span>
                    <span className="text-2xl font-bold">{totalViews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center space-x-1">
                      <Percent className="h-3 w-3" />
                      <span>Engagement Rate</span>
                    </span>
                    <span className="text-2xl font-bold">
                      {engagementRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Favorite Category
                    </span>
                    <span className="text-sm text-muted-foreground">
                      None yet
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>
                    Jump to your most used features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/browse">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Explore New Ideas
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/saved-ideas">
                      <BookmarkIcon className="mr-2 h-4 w-4" />
                      Review Saved Ideas
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/claimed-ideas">
                      <Target className="mr-2 h-4 w-4" />
                      View Claimed Nuggets
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>
                  Your saved and claimed ideas over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorSaved"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorClaimed"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f97316"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f97316"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                      />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="saved"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSaved)"
                        name="Saved Ideas"
                      />
                      <Area
                        type="monotone"
                        dataKey="claimed"
                        stroke="#f97316"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClaimed)"
                        name="Claimed Ideas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coming Soon Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2"
          >
            {/* AI Idea Agent Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-violet-600" />
                      <CardTitle>AI Idea Agent</CardTitle>
                    </div>
                    <BadgeComponent
                      variant="secondary"
                      className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                    >
                      Coming Soon
                    </BadgeComponent>
                  </div>
                  <CardDescription>
                    A new way to generate ideas with AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI agent will help you discover personalized startup
                    opportunities based on your interests, skills, and market
                    trends.
                  </p>
                  <Button disabled className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Early Access
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Agent Chat Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      <CardTitle>AI Agent Chat</CardTitle>
                    </div>
                    <BadgeComponent
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    >
                      Coming Soon
                    </BadgeComponent>
                  </div>
                  <CardDescription>
                    Brainstorm and chat with our upcoming AI-powered assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interactive conversations about your ideas, market
                    validation, and business strategy with our intelligent
                    assistant.
                  </p>
                  <Button disabled className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Waitlist
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
