# Admin Dashboard Implementation Guide

## Overview
This guide provides step-by-step instructions to implement an admin dashboard for the NuggetFinder application with the following features:
1. Role-based authentication system
2. Featured nuggets scheduling with calendar interface
3. Feature visibility controls for free vs paid users
4. Dynamic prompt management system

## Prerequisites
- Existing NuggetFinder codebase
- Bun package manager
- PostgreSQL database
- shadcn/ui components

## Phase 1: Basic Admin Authentication & Dashboard Setup

### 1.1 Database Schema Updates

#### Add Role Field to User Model
**File:** `apps/server/prisma/schema.prisma`

```prisma
model User {
  id               String    @id @map("_id")
  name             String
  email            String
  emailVerified    Boolean
  image            String?
  createdAt        DateTime
  updatedAt        DateTime
  role             String    @default("user") // ADD THIS LINE
  stripeCustomerId String?
  // ... existing fields ...
  
  // Add new relations
  featuredSchedules      FeaturedNuggetsSchedule[]
  promptUpdates          AdminPrompts[]
  
  // ... existing relations ...
}
```

#### Run Migration
```bash
cd apps/server
bun db:migrate --name add_user_role
bun db:generate
```

### 1.2 Authentication Middleware

#### Create Admin Authentication
**File:** `apps/server/src/lib/admin-auth.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.role || ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});
```

#### Update tRPC Exports
**File:** `apps/server/src/lib/trpc.ts`

```typescript
// Add this export
export { adminProcedure } from "./admin-auth";
```

### 1.3 Install Dashboard Components

```bash
cd apps/web
bunx shadcn@latest add dashboard-01
```

### 1.4 Create Admin Layout

#### Admin Layout Component
**File:** `apps/web/src/app/admin/layout.tsx`

```typescript
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        <div className="p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
```

#### Update AppSidebar for Admin Routes
**File:** `apps/web/src/components/app-sidebar.tsx`

```typescript
import { Calendar, Home, Settings, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Featured Nuggets", url: "/admin/featured-nuggets", icon: Calendar },
  { title: "Feature Visibility", url: "/admin/feature-visibility", icon: Settings },
  { title: "Prompts", url: "/admin/prompts", icon: FileText },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

#### Admin Dashboard Home
**File:** `apps/web/src/app/admin/page.tsx`

```typescript
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage featured nuggets, feature visibility, and prompts
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Featured Nuggets</h3>
          <p className="text-sm text-muted-foreground">Schedule daily features</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Feature Visibility</h3>
          <p className="text-sm text-muted-foreground">Control free/paid access</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Prompts</h3>
          <p className="text-sm text-muted-foreground">Edit AI agent prompts</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">Manage admin users</p>
        </div>
      </div>
    </div>
  );
}
```

### Phase 1 Checklist
- [ ] Add `role` field to User model in Prisma schema
- [ ] Run database migration and generate types
- [ ] Create `admin-auth.ts` middleware file
- [ ] Install dashboard-01 component via shadcn
- [ ] Create admin layout with sidebar
- [ ] Update AppSidebar with admin navigation
- [ ] Create admin dashboard home page
- [ ] Test admin route protection

---

## Phase 2: Featured Nuggets Scheduling

### 2.1 Database Schema

#### Featured Nuggets Schedule Model
**File:** `apps/server/prisma/schema.prisma`

```prisma
model FeaturedNuggetsSchedule {
  id          String   @id @default(uuid())
  date        DateTime @unique @db.Date
  ideaIds     String[]
  order       Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
}
```

#### Run Migration
```bash
cd apps/server
bun db:migrate --name add_featured_nuggets_schedule
bun db:generate
```

### 2.2 Backend API

#### Create Admin Router
**File:** `apps/server/src/routers/admin.ts`

```typescript
import { z } from "zod";
import { adminProcedure, router } from "../lib/trpc";
import { prisma } from "../utils/configs/db.config";

export const adminRouter = router({
  // Featured Nuggets Management
  getFeaturedSchedule: adminProcedure
    .input(z.object({ 
      date: z.string().transform((str) => new Date(str)).optional() 
    }))
    .query(async ({ input }) => {
      const targetDate = input.date || new Date();
      const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      return await prisma.featuredNuggetsSchedule.findFirst({
        where: { date: dateOnly },
        include: { 
          creator: { select: { name: true, email: true } }
        }
      });
    }),

  updateFeaturedSchedule: adminProcedure
    .input(z.object({
      date: z.string().transform((str) => new Date(str)),
      ideaIds: z.array(z.string()).max(3, "Maximum 3 ideas allowed"),
    }))
    .mutation(async ({ input, ctx }) => {
      const dateOnly = new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate());
      
      return await prisma.featuredNuggetsSchedule.upsert({
        where: { date: dateOnly },
        update: { 
          ideaIds: input.ideaIds,
          updatedAt: new Date()
        },
        create: {
          date: dateOnly,
          ideaIds: input.ideaIds,
          order: 1,
          createdBy: ctx.session.user.id
        }
      });
    }),

  getAvailableIdeas: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      search: z.string().optional()
    }))
    .query(async ({ input }) => {
      return await prisma.dailyIdea.findMany({
        where: input.search ? {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } }
          ]
        } : undefined,
        select: { 
          id: true, 
          title: true, 
          narrativeHook: true,
          createdAt: true,
          ideaScore: {
            select: { totalScore: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      });
    }),

  getFeaturedScheduleRange: adminProcedure
    .input(z.object({
      startDate: z.string().transform((str) => new Date(str)),
      endDate: z.string().transform((str) => new Date(str))
    }))
    .query(async ({ input }) => {
      return await prisma.featuredNuggetsSchedule.findMany({
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate
          }
        },
        orderBy: { date: 'asc' }
      });
    }),
});
```

#### Update Main Router
**File:** `apps/server/src/routers/index.ts`

```typescript
import { adminRouter } from "./admin";

export const appRouter = router({
  agents: agentRouter,
  ideas: ideasRouter,
  chat: chatRouter,
  debug: debugRouter,
  semanticSearch: semanticSearchRouter,
  subscription: subscriptionRouter,
  admin: adminRouter, // ADD THIS LINE
});
```

### 2.3 Frontend Implementation

#### Install Calendar Dependencies
```bash
cd apps/web
bun add react-big-calendar moment @types/react-big-calendar
```

#### Featured Nuggets Page
**File:** `apps/web/src/app/admin/featured-nuggets/page.tsx`

```typescript
"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function FeaturedNuggetsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: schedule, refetch: refetchSchedule } = trpc.admin.getFeaturedSchedule.useQuery({
    date: selectedDate.toISOString()
  });

  const { data: availableIdeas } = trpc.admin.getAvailableIdeas.useQuery({
    search: searchTerm || undefined,
    limit: 20
  });

  const { data: calendarEvents } = trpc.admin.getFeaturedScheduleRange.useQuery({
    startDate: moment(selectedDate).startOf('month').toISOString(),
    endDate: moment(selectedDate).endOf('month').toISOString()
  });

  // Mutations
  const updateScheduleMutation = trpc.admin.updateFeaturedSchedule.useMutation({
    onSuccess: () => {
      refetchSchedule();
      setSelectedIdeas([]);
    }
  });

  // Calendar events for display
  const events = useMemo(() => {
    return calendarEvents?.map(event => ({
      id: event.id,
      title: `${event.ideaIds.length} ideas scheduled`,
      start: new Date(event.date),
      end: new Date(event.date),
      allDay: true
    })) || [];
  }, [calendarEvents]);

  // Load existing schedule when date changes
  useMemo(() => {
    if (schedule?.ideaIds) {
      setSelectedIdeas(schedule.ideaIds);
    } else {
      setSelectedIdeas([]);
    }
  }, [schedule]);

  const handleSaveSchedule = () => {
    updateScheduleMutation.mutate({
      date: selectedDate.toISOString(),
      ideaIds: selectedIdeas
    });
  };

  const addIdea = (ideaId: string) => {
    if (selectedIdeas.length < 3 && !selectedIdeas.includes(ideaId)) {
      setSelectedIdeas([...selectedIdeas, ideaId]);
    }
  };

  const removeIdea = (ideaId: string) => {
    setSelectedIdeas(selectedIdeas.filter(id => id !== ideaId));
  };

  const getSelectedIdeaDetails = (ideaId: string) => {
    return availableIdeas?.find(idea => idea.id === ideaId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Featured Nuggets Schedule</h1>
        <Button 
          onClick={handleSaveSchedule}
          disabled={updateScheduleMutation.isPending}
        >
          {updateScheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '400px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
                onSelectEvent={(event) => {
                  const scheduleDate = new Date(event.start);
                  setSelectedDate(scheduleDate);
                }}
                selectable
                views={['month']}
                defaultView="month"
              />
            </div>
          </CardContent>
        </Card>

        {/* Idea Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Schedule for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Ideas */}
              <div>
                <h3 className="font-medium mb-2">Selected Ideas ({selectedIdeas.length}/3)</h3>
                <div className="space-y-2">
                  {selectedIdeas.map((ideaId, index) => {
                    const idea = getSelectedIdeaDetails(ideaId);
                    return (
                      <div key={ideaId} className="flex items-center gap-2 p-2 border rounded">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="flex-1">
                          <p className="font-medium">{idea?.title || 'Loading...'}</p>
                          {idea?.narrativeHook && (
                            <p className="text-sm text-muted-foreground truncate">
                              {idea.narrativeHook}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIdea(ideaId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Search Available Ideas */}
              <div>
                <h3 className="font-medium mb-2">Available Ideas</h3>
                <Input
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableIdeas?.map((idea) => (
                    <div 
                      key={idea.id} 
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => addIdea(idea.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{idea.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {idea.ideaScore?.totalScore || 'N/A'} | 
                          Created: {new Date(idea.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedIdeas.includes(idea.id) && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 2.4 Update Featured Nuggets Logic

#### Modify Server API
**File:** `apps/web/src/lib/server-api.ts`

```typescript
// Update getTodaysTopIdeas function
export const getTodaysTopIdeas = cache(async () => {
  try {
    console.log("Fetching today's top ideas with scheduled check...");
    
    // First check for scheduled featured nuggets
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      const scheduled = await serverTrpcClient.admin.getFeaturedSchedule.query({
        date: today.toISOString()
      });
      
      if (scheduled?.ideaIds?.length > 0) {
        console.log(`Found ${scheduled.ideaIds.length} scheduled ideas for today`);
        
        // Fetch the scheduled ideas in order
        const scheduledIdeas = await Promise.all(
          scheduled.ideaIds.map(async (id) => {
            try {
              return await serverTrpcClient.agents.getIdeaById.query({ id });
            } catch (error) {
              console.error(`Failed to fetch scheduled idea ${id}:`, error);
              return null;
            }
          })
        );
        
        const validIdeas = scheduledIdeas.filter(Boolean);
        if (validIdeas.length > 0) {
          console.log(`Returning ${validIdeas.length} scheduled ideas`);
          return validIdeas.slice(0, 3);
        }
      }
    } catch (adminError) {
      console.log("No scheduled ideas or admin query failed, using fallback");
    }
    
    // Fallback to existing logic
    const result = await serverTrpcClient.agents.getDailyIdeas.query({
      limit: 50,
      offset: 0,
    });

    if (result?.ideas?.length > 0) {
      const latestIdeas = result.ideas
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          if (dateB !== dateA) {
            return dateB - dateA;
          }
          const scoreA = a.ideaScore?.overallScore || 0;
          const scoreB = b.ideaScore?.overallScore || 0;
          return scoreB - scoreA;
        })
        .slice(0, 3);

      console.log(`Found ${latestIdeas.length} fallback ideas`);
      return latestIdeas;
    }
  } catch (error) {
    console.error("Error fetching today's top ideas:", error);
    return [];
  }
});
```

### Phase 2 Checklist
- [ ] Add FeaturedNuggetsSchedule model to Prisma schema
- [ ] Run migration and generate types
- [ ] Create admin router with featured nuggets endpoints
- [ ] Update main router to include admin routes
- [ ] Install react-big-calendar dependencies
- [ ] Create featured nuggets management page
- [ ] Update getTodaysTopIdeas to check for scheduled ideas
- [ ] Test calendar interface and idea scheduling

---

## Phase 3: Feature Visibility Controls

### 3.1 Database Schema Updates

#### Add Feature Visibility Flags to DailyIdea
**File:** `apps/server/prisma/schema.prisma`

```prisma
model DailyIdea {
  id                 String       @id @default(uuid())
  title              String
  description        String
  executiveSummary   String
  problemSolution    String
  problemStatement   String
  innovationLevel    Int
  timeToMarket      Int
  confidenceScore   Int
  narrativeHook     String
  targetKeywords    String[]
  urgencyLevel      Int
  executionComplexity Int
  tags              String[]
  
  // Feature visibility flags - ADD THESE LINES
  isFreeQuickOverview       Boolean @default(true)
  isFreeWhyThisMatters      Boolean @default(true)
  isFreeDetailedOverview    Boolean @default(true)
  isFreeTheClaimWhyNow      Boolean @default(false)
  isFreeWhatToBuild         Boolean @default(false)
  isFreeExecutionPlan       Boolean @default(false)
  isFreeMarketGap           Boolean @default(false)
  isFreeCompetitiveLandscape Boolean @default(false)
  isFreeRevenueModel        Boolean @default(false)
  isFreeExecutionValidation Boolean @default(false)
  isFreeChat                Boolean @default(false)
  
  // ... existing relations ...
}
```

#### Run Migration
```bash
cd apps/server
bun db:migrate --name add_feature_visibility_flags
bun db:generate
```

### 3.2 Backend API Updates

#### Add Feature Visibility Endpoints
**File:** `apps/server/src/routers/admin.ts`

```typescript
// Add these endpoints to the existing admin router

// Feature Visibility Management
getFeatureVisibilityDefaults: adminProcedure.query(async () => {
  // Get the most recent idea to see current defaults
  const recentIdea = await prisma.dailyIdea.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      isFreeQuickOverview: true,
      isFreeWhyThisMatters: true,
      isFreeDetailedOverview: true,
      isFreeTheClaimWhyNow: true,
      isFreeWhatToBuild: true,
      isFreeExecutionPlan: true,
      isFreeMarketGap: true,
      isFreeCompetitiveLandscape: true,
      isFreeRevenueModel: true,
      isFreeExecutionValidation: true,
      isFreeChat: true,
    }
  });

  return recentIdea || {
    isFreeQuickOverview: true,
    isFreeWhyThisMatters: true,
    isFreeDetailedOverview: true,
    isFreeTheClaimWhyNow: false,
    isFreeWhatToBuild: false,
    isFreeExecutionPlan: false,
    isFreeMarketGap: false,
    isFreeCompetitiveLandscape: false,
    isFreeRevenueModel: false,
    isFreeExecutionValidation: false,
    isFreeChat: false,
  };
}),

updateFeatureVisibilityDefaults: adminProcedure
  .input(z.object({
    isFreeQuickOverview: z.boolean(),
    isFreeWhyThisMatters: z.boolean(),
    isFreeDetailedOverview: z.boolean(),
    isFreeTheClaimWhyNow: z.boolean(),
    isFreeWhatToBuild: z.boolean(),
    isFreeExecutionPlan: z.boolean(),
    isFreeMarketGap: z.boolean(),
    isFreeCompetitiveLandscape: z.boolean(),
    isFreeRevenueModel: z.boolean(),
    isFreeExecutionValidation: z.boolean(),
    isFreeChat: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    // Update all future ideas (created after now) with new defaults
    const result = await prisma.dailyIdea.updateMany({
      where: { 
        createdAt: { gte: new Date() } 
      },
      data: input
    });
    
    return { 
      success: true, 
      updatedCount: result.count,
      message: `Updated ${result.count} future ideas with new defaults`
    };
  }),

updateIdeaFeatureVisibility: adminProcedure
  .input(z.object({
    ideaId: z.string(),
    settings: z.object({
      isFreeQuickOverview: z.boolean(),
      isFreeWhyThisMatters: z.boolean(),
      isFreeDetailedOverview: z.boolean(),
      isFreeTheClaimWhyNow: z.boolean(),
      isFreeWhatToBuild: z.boolean(),
      isFreeExecutionPlan: z.boolean(),
      isFreeMarketGap: z.boolean(),
      isFreeCompetitiveLandscape: z.boolean(),
      isFreeRevenueModel: z.boolean(),
      isFreeExecutionValidation: z.boolean(),
      isFreeChat: z.boolean(),
    })
  }))
  .mutation(async ({ input }) => {
    return await prisma.dailyIdea.update({
      where: { id: input.ideaId },
      data: input.settings
    });
  }),
```

### 3.3 Frontend Implementation

#### Feature Visibility Management Page
**File:** `apps/web/src/app/admin/feature-visibility/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

const featureComponents = [
  { 
    key: 'isFreeQuickOverview', 
    label: 'Quick Overview', 
    description: 'Problem and solution summary with key metrics',
    defaultFree: true
  },
  { 
    key: 'isFreeWhyThisMatters', 
    label: 'Why This Matters', 
    description: 'Revenue potential, timing, and market opportunity',
    defaultFree: true
  },
  { 
    key: 'isFreeDetailedOverview', 
    label: 'Detailed Overview', 
    description: 'Complete idea description and context',
    defaultFree: true
  },
  { 
    key: 'isFreeTheClaimWhyNow', 
    label: 'The Claim (Why Now)', 
    description: 'Market timing, trends, and supporting evidence',
    defaultFree: false
  },
  { 
    key: 'isFreeWhatToBuild', 
    label: 'What to Build', 
    description: 'Technical implementation guide and architecture',
    defaultFree: false
  },
  { 
    key: 'isFreeExecutionPlan', 
    label: 'Execution Plan', 
    description: 'Step-by-step roadmap and timeline',
    defaultFree: false
  },
  { 
    key: 'isFreeMarketGap', 
    label: 'Market Gap', 
    description: 'Detailed market opportunity and positioning',
    defaultFree: false
  },
  { 
    key: 'isFreeCompetitiveLandscape', 
    label: 'Competitive Landscape', 
    description: 'Competition analysis and differentiation',
    defaultFree: false
  },
  { 
    key: 'isFreeRevenueModel', 
    label: 'Revenue Model', 
    description: 'Monetization strategy and financial projections',
    defaultFree: false
  },
  { 
    key: 'isFreeExecutionValidation', 
    label: 'Execution & Validation', 
    description: 'Validation framework and traction signals',
    defaultFree: false
  },
  { 
    key: 'isFreeChat', 
    label: 'AI Chat Interface', 
    description: 'Interactive chat with the Prospector AI',
    defaultFree: false
  },
];

type FeatureSettings = Record<string, boolean>;

export default function FeatureVisibilityPage() {
  const [settings, setSettings] = useState<FeatureSettings>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Queries
  const { data: defaults, isLoading } = trpc.admin.getFeatureVisibilityDefaults.useQuery();

  // Mutations
  const updateMutation = trpc.admin.updateFeatureVisibilityDefaults.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  // Initialize settings when defaults load
  useEffect(() => {
    if (defaults) {
      setSettings(defaults);
    }
  }, [defaults]);

  const handleToggle = (key: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleReset = () => {
    if (defaults) {
      setSettings(defaults);
      setHasChanges(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = featureComponents.reduce((acc, component) => {
      acc[component.key] = component.defaultFree;
      return acc;
    }, {} as FeatureSettings);
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading feature settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Visibility</h1>
          <p className="text-muted-foreground">
            Control which components are visible to free vs paid users
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Reset Changes
            </Button>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || !hasChanges}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Component Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Component Visibility for Free Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                These settings apply to all future ideas. Paid users can always see all components.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {featureComponents.map((component) => (
                <div key={component.key} className="flex items-start justify-between space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={component.key} className="font-medium">
                        {component.label}
                      </Label>
                      <Badge variant={component.defaultFree ? "secondary" : "outline"}>
                        {component.defaultFree ? "Free by default" : "Paid by default"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  </div>
                  <Switch
                    id={component.key}
                    checked={settings[component.key] ?? false}
                    onCheckedChange={(checked) => handleToggle(component.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free User View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featureComponents.map((component) => (
                    <div key={component.key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{component.label}</span>
                      <Badge variant={settings[component.key] ? "default" : "secondary"}>
                        {settings[component.key] ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paid User View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featureComponents.map((component) => (
                    <div key={component.key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{component.label}</span>
                      <Badge variant="default">Visible</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3.4 Update IdeaDetailsView Component

#### Create Subscription Hook
**File:** `apps/web/src/hooks/useSubscription.ts`

```typescript
import { useBetterAuthSubscription } from "./useBetterAuthSubscription";

export function useSubscription() {
  const { subscriptionStatus } = useBetterAuthSubscription();
  
  return {
    isPaying: subscriptionStatus?.isPaying ?? false,
    isActive: subscriptionStatus?.isActive ?? false,
    planName: subscriptionStatus?.planName ?? 'Free'
  };
}
```

#### Update Component Visibility Logic
**File:** `apps/web/src/components/IdeaDetailsView.tsx`

```typescript
import { useSubscription } from "@/hooks/useSubscription";

// Add this helper component for upgrade prompts
const UpgradePrompt: React.FC<{ componentName: string }> = ({ componentName }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
    <div className="mb-4">
      <h3 className="font-semibold text-lg">Upgrade Required</h3>
      <p className="text-muted-foreground">
        {componentName} is available for premium users
      </p>
    </div>
    <Button asChild>
      <Link href="/pricing">
        Upgrade to Premium
      </Link>
    </Button>
  </div>
);

// Update each component with visibility logic
const QuickOverview: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeQuickOverview) {
    return <UpgradePrompt componentName="Quick Overview" />;
  }
  
  // ... existing component code ...
};

const WhyThisMatters: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeWhyThisMatters) {
    return <UpgradePrompt componentName="Why This Matters" />;
  }
  
  // ... existing component code ...
};

const DetailedOverview: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeDetailedOverview) {
    return <UpgradePrompt componentName="Detailed Overview" />;
  }
  
  // ... existing component code ...
};

const TheClaimWhyNow: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeTheClaimWhyNow) {
    return <UpgradePrompt componentName="The Claim (Why Now)" />;
  }
  
  // ... existing component code ...
};

const WhatToBuild: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeWhatToBuild) {
    return <UpgradePrompt componentName="What to Build" />;
  }
  
  // ... existing component code ...
};

const ExecutionPlan: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeExecutionPlan) {
    return <UpgradePrompt componentName="Execution Plan" />;
  }
  
  // ... existing component code ...
};

const MarketGap: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeMarketGap) {
    return <UpgradePrompt componentName="Market Gap" />;
  }
  
  // ... existing component code ...
};

const CompetitiveLandscape: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeCompetitiveLandscape) {
    return <UpgradePrompt componentName="Competitive Landscape" />;
  }
  
  // ... existing component code ...
};

const RevenueModel: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeRevenueModel) {
    return <UpgradePrompt componentName="Revenue Model" />;
  }
  
  // ... existing component code ...
};

const ExecutionValidation: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeExecutionValidation) {
    return <UpgradePrompt componentName="Execution & Validation" />;
  }
  
  // ... existing component code ...
};

const ChatSection: React.FC<{ idea: IdeaDetailsViewProps["idea"] }> = ({ idea }) => {
  const { isPaying } = useSubscription();
  
  if (!isPaying && !idea.isFreeChat) {
    return <UpgradePrompt componentName="AI Chat" />;
  }
  
  // ... existing component code ...
};
```

### Phase 3 Checklist
- [ ] Add feature visibility flags to DailyIdea model
- [ ] Run migration and generate types
- [ ] Add feature visibility endpoints to admin router
- [ ] Create feature visibility management page
- [ ] Create useSubscription hook
- [ ] Update all IdeaDetailsView components with visibility logic
- [ ] Create UpgradePrompt component
- [ ] Test free vs paid user experience

---

## Phase 4: Dynamic Prompt Management

### 4.1 Database Schema

#### Admin Prompts Model
**File:** `apps/server/prisma/schema.prisma`

```prisma
model AdminPrompts {
  id            String   @id @default(uuid())
  agentName     String
  promptKey     String
  promptContent String   @db.Text
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  updatedBy     String
  updater       User     @relation(fields: [updatedBy], references: [id])
  
  @@unique([agentName, promptKey])
}

// Update User model to include the relation
model User {
  // ... existing fields ...
  promptUpdates AdminPrompts[]
  // ... existing relations ...
}
```

#### Run Migration
```bash
cd apps/server
bun db:migrate --name add_admin_prompts
bun db:generate
```

### 4.2 Seed Default Prompts

#### Create Seed Script
**File:** `apps/server/prisma/seed-prompts.ts`

```typescript
import { PrismaClient } from './generated';

const prisma = new PrismaClient();

const defaultPrompts = [
  {
    agentName: 'IdeaSynthesisAgent',
    promptKey: 'trendArchitectPrompt',
    promptContent: `You are the Trend Architect - a world-class startup idea synthesizer who transforms market research into compelling, immediately actionable business opportunities. Your expertise lies in combining trend analysis, problem identification, and competitive intelligence into cohesive startup concepts that feel inevitable and urgent.

**CRITICAL LANGUAGE REQUIREMENTS:**
- Global applicability: NO geographic locations or country names (US, India, Southeast Asia, etc.)
- Use simple, direct language that anyone can understand
- COMPLETELY AVOID these technical terms: "AI-Powered", "Automated", "Agent", "Agentic", "Real-Time", "Composable", "Orchestration"
- Avoid fluff and unnecessary buzzwords; be specific and concrete
- Write clearly and directly; do not invent startup/product names
- Focus on what the tool DOES, not the technology behind it

**CONSUMER-FIRST APPROACH:**
- Target individual consumers, families, students, and everyday people
- Focus on personal daily life problems, not business workflow issues
- Use language that regular people use in conversation
- Think about problems that affect personal time, money, relationships, health, learning
- Solutions should feel approachable and easy for anyone to understand and use`
  },
  {
    agentName: 'ProblemGapAgent',
    promptKey: 'systemPrompt',
    promptContent: `You are an elite problem identifier with deep expertise in discovering everyday frustrations that people worldwide face and can be solved with simple software.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Focus on UNIVERSAL problems that people face everywhere
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Target global human behaviors and frustrations
- Solutions should work for people worldwide

**Enhanced Analysis Framework:**

**Problem Identification Criteria:**
1. **Real & Daily**: Problems happening every day, wasting people's time and money
2. **Relatable**: Focus on problems that many people can relate to worldwide
3. **Software-Solvable**: Problems that can be fixed with simple apps, websites, or online tools
4. **Trend-Connected**: Problems that are made worse or newly created by current trends
5. **Clear Impact**: Problems with obvious costs (lost time, wasted money, missed opportunities)`
  },
  {
    agentName: 'WhatToBuildAgent',
    promptKey: 'systemPrompt',
    promptContent: `You are a product strategist focused on helping people build a simple consumer app quickly and affordably. Your job is to provide a clear, easy-to-understand guide of "what to build" for a consumer-focused idea.

**CRITICAL LANGUAGE & SCOPE REQUIREMENTS:**
- Use simple, everyday language that anyone can understand
- NO geographic locations, country names, or regional specificity
- Avoid technical jargon, buzzwords, and complex terms
- Focus on globally applicable solutions that work everywhere
- Create recommendations that work for people worldwide
- Keep everything simple and accessible

**Your mission:** Turn the consumer app idea into specific, doable steps that focus on simple mobile apps and websites that are easy to understand and quick to build. Focus only on the most important features for a working consumer product.`
  }
];

async function seedPrompts() {
  console.log('Seeding default prompts...');
  
  for (const prompt of defaultPrompts) {
    await prisma.adminPrompts.upsert({
      where: {
        agentName_promptKey: {
          agentName: prompt.agentName,
          promptKey: prompt.promptKey
        }
      },
      update: {},
      create: {
        ...prompt,
        updatedBy: 'system', // This should be replaced with actual admin user ID
      }
    });
  }
  
  console.log('Prompts seeded successfully');
}

seedPrompts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 4.3 Backend API Updates

#### Add Prompt Management Endpoints
**File:** `apps/server/src/routers/admin.ts`

```typescript
// Add these endpoints to the existing admin router

// Prompt Management
getPrompts: adminProcedure.query(async () => {
  return await prisma.adminPrompts.findMany({
    where: { isActive: true },
    include: {
      updater: {
        select: { name: true, email: true }
      }
    },
    orderBy: [
      { agentName: 'asc' },
      { promptKey: 'asc' }
    ]
  });
}),

getPromptsByAgent: adminProcedure
  .input(z.object({
    agentName: z.string()
  }))
  .query(async ({ input }) => {
    return await prisma.adminPrompts.findMany({
      where: { 
        agentName: input.agentName,
        isActive: true 
      },
      include: {
        updater: {
          select: { name: true, email: true }
        }
      },
      orderBy: { promptKey: 'asc' }
    });
  }),

updatePrompt: adminProcedure
  .input(z.object({
    id: z.string(),
    promptContent: z.string().min(10, "Prompt must be at least 10 characters")
  }))
  .mutation(async ({ input, ctx }) => {
    return await prisma.adminPrompts.update({
      where: { id: input.id },
      data: { 
        promptContent: input.promptContent,
        updatedBy: ctx.session.user.id,
        updatedAt: new Date()
      }
    });
  }),

createPrompt: adminProcedure
  .input(z.object({
    agentName: z.string(),
    promptKey: z.string(),
    promptContent: z.string().min(10)
  }))
  .mutation(async ({ input, ctx }) => {
    return await prisma.adminPrompts.create({
      data: {
        ...input,
        updatedBy: ctx.session.user.id
      }
    });
  }),

deletePrompt: adminProcedure
  .input(z.object({
    id: z.string()
  }))
  .mutation(async ({ input }) => {
    return await prisma.adminPrompts.update({
      where: { id: input.id },
      data: { isActive: false }
    });
  }),
```

### 4.4 Frontend Implementation

#### Prompts Management Page
**File:** `apps/web/src/app/admin/prompts/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Save, RotateCcw } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function PromptsPage() {
  const [editingPrompts, setEditingPrompts] = useState<Record<string, string>>({});
  const [newPrompt, setNewPrompt] = useState({
    agentName: '',
    promptKey: '',
    promptContent: ''
  });

  // Queries
  const { data: prompts, refetch } = trpc.admin.getPrompts.useQuery();

  // Mutations
  const updateMutation = trpc.admin.updatePrompt.useMutation({
    onSuccess: () => {
      toast.success('Prompt updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update prompt: ${error.message}`);
    }
  });

  const createMutation = trpc.admin.createPrompt.useMutation({
    onSuccess: () => {
      toast.success('Prompt created successfully');
      setNewPrompt({ agentName: '', promptKey: '', promptContent: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create prompt: ${error.message}`);
    }
  });

  const deleteMutation = trpc.admin.deletePrompt.useMutation({
    onSuccess: () => {
      toast.success('Prompt deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete prompt: ${error.message}`);
    }
  });

  // Group prompts by agent
  const groupedPrompts = prompts?.reduce((acc, prompt) => {
    if (!acc[prompt.agentName]) {
      acc[prompt.agentName] = [];
    }
    acc[prompt.agentName].push(prompt);
    return acc;
  }, {} as Record<string, typeof prompts>) || {};

  const handleEdit = (promptId: string, content: string) => {
    setEditingPrompts(prev => ({ ...prev, [promptId]: content }));
  };

  const handleSave = (promptId: string) => {
    const content = editingPrompts[promptId];
    if (content) {
      updateMutation.mutate({ id: promptId, promptContent: content });
      setEditingPrompts(prev => {
        const { [promptId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleCancel = (promptId: string) => {
    setEditingPrompts(prev => {
      const { [promptId]: _, ...rest } = prev;
      return rest;
    });
  };

  const isEditing = (promptId: string) => promptId in editingPrompts;
  const getContent = (prompt: any) => editingPrompts[prompt.id] ?? prompt.promptContent;

  const agentNames = Object.keys(groupedPrompts);
  const defaultAgent = agentNames[0] || '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompt Management</h1>
          <p className="text-muted-foreground">
            Edit AI agent prompts to customize idea generation behavior
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={newPrompt.agentName}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, agentName: e.target.value }))}
                    placeholder="e.g., IdeaSynthesisAgent"
                  />
                </div>
                <div>
                  <Label htmlFor="promptKey">Prompt Key</Label>
                  <Input
                    id="promptKey"
                    value={newPrompt.promptKey}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, promptKey: e.target.value }))}
                    placeholder="e.g., systemPrompt"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="promptContent">Prompt Content</Label>
                <Textarea
                  id="promptContent"
                  value={newPrompt.promptContent}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, promptContent: e.target.value }))}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Enter the prompt content..."
                />
              </div>
              <Button 
                onClick={() => createMutation.mutate(newPrompt)}
                disabled={!newPrompt.agentName || !newPrompt.promptKey || !newPrompt.promptContent}
              >
                Create Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultAgent} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {agentNames.map(agentName => (
            <TabsTrigger key={agentName} value={agentName}>
              {agentName.replace('Agent', '')}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(groupedPrompts).map(([agentName, agentPrompts]) => (
          <TabsContent key={agentName} value={agentName} className="space-y-4">
            {agentPrompts?.map(prompt => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{prompt.promptKey}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{prompt.agentName}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Last updated by {prompt.updater.name} on{' '}
                          {new Date(prompt.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isEditing(prompt.id) ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(prompt.id)}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(prompt.id)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(prompt.id, prompt.promptContent)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({ id: prompt.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={getContent(prompt)}
                    onChange={(e) => handleEdit(prompt.id, e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    readOnly={!isEditing(prompt.id)}
                  />
                  {isEditing(prompt.id) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Character count: {getContent(prompt).length}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

### 4.5 Update Agent System

#### Create Prompt Helper Utility
**File:** `apps/server/src/utils/prompt-helper.ts`

```typescript
import { prisma } from "./configs/db.config";

// In-memory cache for prompts
const promptCache = new Map<string, { content: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPrompt(agentName: string, promptKey: string, fallback: string): Promise<string> {
  const cacheKey = `${agentName}:${promptKey}`;
  
  // Check cache first
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.content;
  }

  try {
    const prompt = await prisma.adminPrompts.findFirst({
      where: { 
        agentName,
        promptKey,
        isActive: true 
      }
    });
    
    const content = prompt?.promptContent || fallback;
    
    // Cache the result
    promptCache.set(cacheKey, {
      content,
      expiry: Date.now() + CACHE_TTL
    });
    
    return content;
  } catch (error) {
    console.error(`Error fetching prompt ${agentName}:${promptKey}:`, error);
    return fallback;
  }
}

// Clear cache function for testing
export function clearPromptCache() {
  promptCache.clear();
}
```

#### Update IdeaSynthesisAgent
**File:** `apps/server/src/apps/idea-generation-agent/agents/idea-synthesis-agent.ts`

```typescript
import { getPrompt } from "../../../utils/prompt-helper";

export class IdeaSynthesisAgent {
  static async execute(
    context: AgentContext,
    refinementPrompt?: string,
  ): Promise<SynthesizedIdea | null> {
    try {
      console.log("🧠 Step 7: Enhanced Idea Synthesis with Trend Architect Logic");

      // Get dynamic prompt
      const trendArchitectPrompt = await getPrompt(
        'IdeaSynthesisAgent',
        'trendArchitectPrompt',
        // Fallback to original hardcoded prompt
        `You are the Trend Architect - a world-class startup idea synthesizer...`
      );

      // ... rest of existing logic using trendArchitectPrompt
    } catch (error) {
      // ... existing error handling
    }
  }
}
```

#### Update Other Agents Similarly
Apply the same pattern to:
- `problem-gap-agent.ts`
- `what-to-build-agent.ts`
- `monetization-agent.ts`
- `competitive-intelligence-agent.ts`
- All other agents that use hardcoded prompts

### Phase 4 Checklist
- [ ] Add AdminPrompts model to Prisma schema
- [ ] Run migration and generate types
- [ ] Create and run prompt seeding script
- [ ] Add prompt management endpoints to admin router
- [ ] Create prompt helper utility with caching
- [ ] Create prompts management page with full CRUD
- [ ] Update all agent classes to use dynamic prompts
- [ ] Test prompt editing and agent behavior changes

---

## Final Testing & Deployment

### Testing Checklist
- [ ] Admin authentication works correctly
- [ ] Non-admin users cannot access admin routes
- [ ] Featured nuggets scheduling works with calendar
- [ ] Featured nuggets appear correctly on homepage
- [ ] Feature visibility toggles work for free/paid users
- [ ] Prompt editing updates agent behavior
- [ ] All database migrations run successfully
- [ ] No TypeScript errors in codebase

### Deployment Steps
1. Run all migrations in production
2. Seed prompts in production
3. Create first admin user manually in database
4. Deploy application
5. Test all admin features in production
6. Monitor for any issues

### Environment Variables to Add
```bash
# Add to .env
NEXT_PUBLIC_ADMIN_ENABLED=true
```

This comprehensive implementation guide provides all the necessary details to build the admin dashboard feature in phases, with complete code examples, database schemas, and testing procedures. 