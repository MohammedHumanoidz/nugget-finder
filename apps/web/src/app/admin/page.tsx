"use client";

import { useQuery } from '@tanstack/react-query';
import { Eye, Users, Lightbulb, TrendingUp, Calendar, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';

// Types for the featured nuggets data
interface FeaturedNugget {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  views: number;
  saves: number;
  claims: number;
}

// Chart configuration for the engagement chart
const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  saves: {
    label: "Saves", 
    color: "hsl(var(--chart-2))",
  },
  claims: {
    label: "Claims",
    color: "hsl(var(--chart-3))",
  },
};

export default function AdminDashboard() {
  // Fetch analytics data
  const { data: statsData, isLoading: statsLoading } = useQuery(trpc.admin.getStats.queryOptions());
  const { data: featuredNuggetsData, isLoading: featuredLoading } = useQuery(trpc.admin.getTodaysFeaturedNuggets.queryOptions());
  const { data: engagementData, isLoading: engagementLoading } = useQuery(trpc.admin.getEngagementData.queryOptions({ days: 30 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a snapshot of your platform's performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.totalUsers?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform members
            </p>
          </CardContent>
        </Card>

        {/* Total Nuggets Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nuggets</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.totalNuggets?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ideas generated
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Nuggets</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage</div>
            <p className="text-xs text-muted-foreground">Schedule daily features</p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/admin/featured-nuggets">
                Configure
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts</CardTitle>
            <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Edit</div>
            <p className="text-xs text-muted-foreground">AI agent prompts</p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/admin/prompts">
                Configure
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Featured Nuggets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Featured Nuggets</CardTitle>
          <CardDescription>
            Nuggets scheduled to be featured today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featuredLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={`skeleton-${i}`} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </div>
              ))}
            </div>
          ) : featuredNuggetsData && featuredNuggetsData.length > 0 ? (
            <div className="space-y-3">
              {featuredNuggetsData.map((nugget: FeaturedNugget) => (
                <div key={nugget.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{nugget.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {nugget.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {nugget.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <BookmarkCheck className="h-3 w-3" />
                        {nugget.saves} saves
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {nugget.claims} claims
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {nugget.status}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/nuggets/${nugget.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No featured nuggets today</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule some nuggets to be featured today
              </p>
              <Button asChild>
                <Link href="/admin/featured-nuggets">
                  Schedule Nuggets
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Overview</CardTitle>
          <CardDescription>
            User engagement over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {engagementLoading ? (
            <div className="h-80 bg-muted animate-pulse rounded" />
          ) : engagementData && engagementData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={chartConfig.views.color}
                    fill={chartConfig.views.color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="saves"
                    stackId="1"
                    stroke={chartConfig.saves.color}
                    fill={chartConfig.saves.color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    stackId="1"
                    stroke={chartConfig.claims.color}
                    fill={chartConfig.claims.color}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No engagement data</h3>
              <p className="text-sm text-muted-foreground">
                Engagement data will appear as users interact with nuggets
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}