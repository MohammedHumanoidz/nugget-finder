# API Reference

Complete reference for all tRPC endpoints, types, and procedures available in the Nugget Finder API.

## Overview

The Nugget Finder API is built using tRPC, providing end-to-end type safety between the client and server. All API calls are made through the tRPC client with automatic type inference.

### Base Configuration

```typescript
// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// tRPC Client Setup
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../apps/server/src/routers';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${API_BASE_URL}/api/trpc`,
          headers() {
            return {
              authorization: `Bearer ${getAuthToken()}`,
            };
          },
        }),
      ],
    };
  },
});
```

## Authentication

### Session Management

All protected endpoints require authentication. The session is managed through Better Auth.

```typescript
// Check authentication status
const { data: session, isLoading } = trpc.auth.getSession.useQuery();

// Sign in
const signIn = trpc.auth.signIn.useMutation({
  onSuccess: (data) => {
    // Handle successful sign in
    router.push('/dashboard');
  },
});

// Sign out
const signOut = trpc.auth.signOut.useMutation({
  onSuccess: () => {
    router.push('/');
  },
});
```

## Core API Endpoints

### User Management

#### Get Current User
```typescript
// Endpoint: user.me
const { data: user } = trpc.user.me.useQuery();

// Response Type
interface UserMeResponse {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  claimLimit: number;
  claimsUsed: number;
  saveLimit: number;
  savesUsed: number;
  viewLimit: number;
  viewsUsed: number;
  lastViewReset: Date;
  stripeCustomerId: string | null;
  subscription: Subscription | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Update User Profile
```typescript
// Endpoint: user.updateProfile
const updateProfile = trpc.user.updateProfile.useMutation();

// Input Type
interface UpdateProfileInput {
  name?: string;
  email?: string;
}

// Usage
updateProfile.mutate({
  name: "John Doe",
  email: "john@example.com"
});
```

#### Get User Usage Statistics
```typescript
// Endpoint: user.getUsage
const { data: usage } = trpc.user.getUsage.useQuery();

// Response Type
interface UserUsageResponse {
  claimLimit: number;
  claimsUsed: number;
  saveLimit: number;
  savesUsed: number;
  viewLimit: number;
  viewsUsed: number;
  lastViewReset: Date;
  subscription: {
    plan: string;
    status: string;
    periodEnd: Date;
  } | null;
}
```

### Idea Management

#### Get Daily Ideas
```typescript
// Endpoint: ideas.getDaily
const { data: dailyIdeas } = trpc.ideas.getDaily.useQuery({
  limit: 10,
  offset: 0,
  tags: ['AI', 'healthcare'],
  minConfidenceScore: 7,
});

// Input Type
interface GetDailyIdeasInput {
  limit?: number;
  offset?: number;
  tags?: string[];
  minConfidenceScore?: number;
  sortBy?: 'createdAt' | 'confidenceScore' | 'urgencyLevel';
  sortOrder?: 'asc' | 'desc';
}

// Response Type
interface DailyIdea {
  id: string;
  title: string;
  description: string;
  executiveSummary: string | null;
  problemSolution: string | null;
  problemStatement: string | null;
  innovationLevel: number | null;
  timeToMarket: number | null;
  confidenceScore: number | null;
  narrativeHook: string | null;
  targetKeywords: string[];
  urgencyLevel: number | null;
  executionComplexity: number | null;
  tags: string[];
  
  // Feature access flags
  isFreeQuickOverview: boolean;
  isFreeWhyThisMatters: boolean;
  isFreeDetailedOverview: boolean;
  isFreeTheClaimWhyNow: boolean;
  isFreeWhatToBuild: boolean;
  isFreeExecutionPlan: boolean;
  isFreeMarketGap: boolean;
  isFreeCompetitiveLandscape: boolean;
  isFreeRevenueModel: boolean;
  isFreeExecutionValidation: boolean;
  isFreeChat: boolean;
  
  // Related data
  score: IdeaScore | null;
  marketOpportunity: MarketOpportunity | null;
  monetizationStrategy: MonetizationStrategy | null;
  whyNow: WhyNow | null;
  whatToBuild: WhatToBuild | null;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Get Idea by ID
```typescript
// Endpoint: ideas.getById
const { data: idea } = trpc.ideas.getById.useQuery({ id: "idea-id" });

// Input Type
interface GetIdeaByIdInput {
  id: string;
}

// Response Type: Same as DailyIdea
```

#### Get Featured Ideas
```typescript
// Endpoint: ideas.getFeatured
const { data: featuredIdeas } = trpc.ideas.getFeatured.useQuery({
  date: new Date(),
});

// Input Type
interface GetFeaturedIdeasInput {
  date?: Date; // Defaults to today
}

// Response Type: DailyIdea[]
```

#### Search Ideas
```typescript
// Endpoint: ideas.search
const { data: searchResults } = trpc.ideas.search.useQuery({
  query: "AI healthcare solutions",
  tags: ['AI', 'healthcare'],
  limit: 20,
});

// Input Type
interface SearchIdeasInput {
  query: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  minConfidenceScore?: number;
}

// Response Type
interface SearchResult {
  ideas: DailyIdea[];
  totalCount: number;
  hasMore: boolean;
}
```

### User Interactions

#### Save Idea
```typescript
// Endpoint: interactions.saveIdea
const saveIdea = trpc.interactions.saveIdea.useMutation();

// Input Type
interface SaveIdeaInput {
  ideaId: string;
}

// Usage
saveIdea.mutate({ ideaId: "idea-id" });
```

#### Unsave Idea
```typescript
// Endpoint: interactions.unsaveIdea
const unsaveIdea = trpc.interactions.unsaveIdea.useMutation();

// Input Type
interface UnsaveIdeaInput {
  ideaId: string;
}
```

#### Claim Idea
```typescript
// Endpoint: interactions.claimIdea
const claimIdea = trpc.interactions.claimIdea.useMutation();

// Input Type
interface ClaimIdeaInput {
  ideaId: string;
}

// Note: Can only claim one idea total for FREE users
```

#### Mark Idea as Viewed
```typescript
// Endpoint: interactions.markViewed
const markViewed = trpc.interactions.markViewed.useMutation();

// Input Type
interface MarkViewedInput {
  ideaId: string;
}
```

#### Get Saved Ideas
```typescript
// Endpoint: interactions.getSaved
const { data: savedIdeas } = trpc.interactions.getSaved.useQuery({
  limit: 20,
  offset: 0,
});

// Response Type
interface SavedIdeasResponse {
  ideas: DailyIdea[];
  totalCount: number;
}
```

#### Get Claimed Ideas
```typescript
// Endpoint: interactions.getClaimed
const { data: claimedIdeas } = trpc.interactions.getClaimed.useQuery();

// Response Type: DailyIdea[]
```

### Custom Idea Generation

#### Generate Custom Idea
```typescript
// Endpoint: agents.generateCustomIdea
const generateIdea = trpc.agents.generateCustomIdea.useMutation();

// Input Type
interface GenerateCustomIdeaInput {
  prompt: string;
  personalizationData?: {
    industry?: string;
    experience?: string;
    interests?: string[];
  };
}

// Usage
generateIdea.mutate({
  prompt: "AI-powered solutions for small businesses",
  personalizationData: {
    industry: "SaaS",
    experience: "5+ years",
    interests: ["automation", "productivity"]
  }
});

// Response Type
interface GeneratedIdeaResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  currentStep?: string;
  progressMessage?: string;
  imageState: 'confused' | 'digging' | 'happy' | 'found';
  estimatedCompletion?: Date;
}
```

#### Get Generation Status
```typescript
// Endpoint: agents.getGenerationStatus
const { data: status } = trpc.agents.getGenerationStatus.useQuery({
  requestId: "generation-request-id",
});

// Response Type
interface GenerationStatus {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  currentStep: string;
  progressMessage: string;
  imageState: 'confused' | 'digging' | 'happy' | 'found';
  progress: number; // 0-100
  generatedIdeaIds: string[];
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Get Generated Ideas
```typescript
// Endpoint: agents.getGeneratedIdeas
const { data: generatedIdeas } = trpc.agents.getGeneratedIdeas.useQuery({
  userId: "user-id", // Optional, defaults to current user
  limit: 10,
});

// Response Type
interface UserGeneratedIdea {
  id: string;
  prompt: string;
  title: string;
  description: string;
  executiveSummary: string;
  problemStatement: string;
  narrativeHook: string;
  tags: string[];
  confidenceScore: number;
  fullIdeaDataJson: string; // Complete generated data
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription Management

#### Get Current Subscription
```typescript
// Endpoint: subscription.getCurrent
const { data: subscription } = trpc.subscription.getCurrent.useQuery();

// Response Type
interface Subscription {
  id: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  periodStart: Date;
  periodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}
```

#### Create Checkout Session
```typescript
// Endpoint: subscription.createCheckoutSession
const createCheckout = trpc.subscription.createCheckoutSession.useMutation();

// Input Type
interface CreateCheckoutSessionInput {
  priceId: string; // Stripe price ID
  successUrl: string;
  cancelUrl: string;
}

// Usage
createCheckout.mutate({
  priceId: "price_basic_monthly",
  successUrl: "https://yourdomain.com/success",
  cancelUrl: "https://yourdomain.com/pricing",
});

// Response: Stripe checkout session URL
```

#### Cancel Subscription
```typescript
// Endpoint: subscription.cancel
const cancelSubscription = trpc.subscription.cancel.useMutation();

// Cancels at end of current billing period
cancelSubscription.mutate();
```

#### Get Usage Statistics
```typescript
// Endpoint: subscription.getUsage
const { data: usage } = trpc.subscription.getUsage.useQuery();

// Response Type
interface UsageStatistics {
  claims: {
    used: number;
    limit: number; // -1 for unlimited
    resetDate?: Date;
  };
  saves: {
    used: number;
    limit: number;
    resetDate?: Date;
  };
  views: {
    used: number;
    limit: number;
    resetDate: Date; // Daily reset
  };
  customGenerations: {
    used: number;
    limit: number;
    resetDate: Date; // Monthly reset
  };
}
```

## Admin API Endpoints

**Note:** All admin endpoints require `ADMIN` role.

### Featured Nuggets Management

#### Schedule Featured Nuggets
```typescript
// Endpoint: admin.scheduleFeaturedNuggets
const scheduleNuggets = trpc.admin.scheduleFeaturedNuggets.useMutation();

// Input Type
interface ScheduleFeaturedNuggetsInput {
  date: Date;
  ideaIds: string[];
}

scheduleNuggets.mutate({
  date: new Date('2024-12-25'),
  ideaIds: ['idea-1', 'idea-2', 'idea-3'],
});
```

#### Get Featured Schedule
```typescript
// Endpoint: admin.getFeaturedSchedule
const { data: schedule } = trpc.admin.getFeaturedSchedule.useQuery({
  date: new Date(),
});

// Response Type
interface FeaturedSchedule {
  id: string;
  date: Date;
  ideaIds: string[];
  ideas: DailyIdea[];
  isActive: boolean;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Prompt Management

#### Update Agent Prompt
```typescript
// Endpoint: admin.updatePrompt
const updatePrompt = trpc.admin.updatePrompt.useMutation();

// Input Type
interface UpdatePromptInput {
  agentName: string;
  promptKey: string;
  promptContent: string;
}

updatePrompt.mutate({
  agentName: "TrendResearchAgent",
  promptKey: "main_prompt",
  promptContent: "You are a trend research specialist...",
});
```

#### Get All Prompts
```typescript
// Endpoint: admin.getAllPrompts
const { data: prompts } = trpc.admin.getAllPrompts.useQuery();

// Response Type
interface AdminPrompt {
  id: string;
  agentName: string;
  promptKey: string;
  promptContent: string;
  isActive: boolean;
  updatedBy: string;
  updater: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Analytics

#### Get User Statistics
```typescript
// Endpoint: admin.getUserStats
const { data: userStats } = trpc.admin.getUserStats.useQuery();

// Response Type
interface UserStatistics {
  totalUsers: number;
  activeUsers: number; // Last 30 days
  newUsers: number; // Last 30 days
  paidUsers: number;
  conversionRate: number;
  churnRate: number;
}
```

#### Get Revenue Dashboard
```typescript
// Endpoint: admin.getRevenueDashboard
const { data: revenue } = trpc.admin.getRevenueDashboard.useQuery();

// Response Type
interface RevenueDashboard {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  monthlyGrowthRate: number;
  subscriptionBreakdown: {
    [plan: string]: {
      count: number;
      revenue: number;
    };
  };
  revenueHistory: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>;
}
```

## Error Handling

### Error Types

```typescript
// Standard tRPC Error Codes
type TRPCErrorCode =
  | 'PARSE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_SUPPORTED'
  | 'TIMEOUT'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNPROCESSABLE_CONTENT'
  | 'TOO_MANY_REQUESTS'
  | 'CLIENT_CLOSED_REQUEST';

// Custom Error Format
interface APIError {
  code: TRPCErrorCode;
  message: string;
  data?: {
    code?: string;
    httpStatus?: number;
    path?: string;
    stack?: string;
  };
}
```

### Common Error Scenarios

#### Authentication Errors
```typescript
// 401 Unauthorized
{
  code: 'UNAUTHORIZED',
  message: 'You must be logged in to access this resource'
}

// 403 Forbidden
{
  code: 'FORBIDDEN',
  message: 'Admin access required'
}
```

#### Usage Limit Errors
```typescript
// Rate limiting
{
  code: 'TOO_MANY_REQUESTS',
  message: 'Rate limit exceeded. Please try again later.',
  data: {
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60 // seconds
  }
}

// Usage limits
{
  code: 'FORBIDDEN',
  message: 'Claim limit exceeded. Upgrade your plan for unlimited access.',
  data: {
    code: 'USAGE_LIMIT_EXCEEDED',
    limitType: 'claims',
    currentUsage: 3,
    limit: 3
  }
}
```

#### Validation Errors
```typescript
// Input validation
{
  code: 'BAD_REQUEST',
  message: 'Validation failed',
  data: {
    code: 'VALIDATION_ERROR',
    fieldErrors: {
      email: 'Invalid email format',
      prompt: 'Prompt must be at least 10 characters'
    }
  }
}
```

## Type Definitions

### Core Types

```typescript
// User types
interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  claimLimit: number;
  claimsUsed: number;
  saveLimit: number;
  savesUsed: number;
  viewLimit: number;
  viewsUsed: number;
  lastViewReset: Date;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Idea types
interface DailyIdea {
  id: string;
  title: string;
  description: string;
  executiveSummary: string | null;
  problemSolution: string | null;
  problemStatement: string | null;
  innovationLevel: number | null;
  timeToMarket: number | null;
  confidenceScore: number | null;
  narrativeHook: string | null;
  targetKeywords: string[];
  urgencyLevel: number | null;
  executionComplexity: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IdeaScore {
  id: string;
  totalScore: number;
  problemSeverity: number | null;
  founderMarketFit: number | null;
  technicalFeasibility: number | null;
  monetizationPotential: number | null;
  urgencyScore: number | null;
  marketTimingScore: number | null;
  executionDifficulty: number | null;
  moatStrength: number | null;
  regulatoryRisk: number | null;
}

// Subscription types
interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  periodStart: Date;
  periodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete'
}
```

## Rate Limits

### Default Rate Limits

| Endpoint Type | Requests per Minute | Requests per Hour |
|---------------|---------------------|-------------------|
| Authentication | 10 | 100 |
| User Profile | 30 | 300 |
| Idea Browsing | 100 | 1000 |
| Idea Generation | 5 | 20 |
| Admin Endpoints | 50 | 500 |

### Plan-Specific Limits

| Feature | FREE | BASIC | PRO | ENTERPRISE |
|---------|------|-------|-----|------------|
| API Calls/Hour | 100 | 1000 | 5000 | Unlimited |
| Idea Generation/Month | 0 | 10 | 50 | Unlimited |
| Claims Total | 3 | Unlimited | Unlimited | Unlimited |
| Saves Total | 50 | Unlimited | Unlimited | Unlimited |
| Daily Views | 100 | Unlimited | Unlimited | Unlimited |

## SDK Usage Examples

### React Query Integration

```typescript
// Custom hook for idea browsing
export function useIdeas(filters: GetDailyIdeasInput = {}) {
  return trpc.ideas.getDaily.useInfiniteQuery(
    filters,
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === filters.limit
          ? pages.length * (filters.limit || 10)
          : undefined;
      },
    }
  );
}

// Usage in component
function IdeasPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIdeas({ limit: 10, minConfidenceScore: 7 });

  const ideas = data?.pages.flat() || [];

  return (
    <div>
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
      
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          Load More
        </Button>
      )}
    </div>
  );
}
```

### Optimistic Updates

```typescript
// Optimistic save/unsave
export function useOptimisticSave() {
  const utils = trpc.useContext();
  
  const saveIdea = trpc.interactions.saveIdea.useMutation({
    onMutate: async ({ ideaId }) => {
      // Cancel outgoing refetches
      await utils.interactions.getSaved.cancel();
      
      // Snapshot previous value
      const previousSaved = utils.interactions.getSaved.getData();
      
      // Optimistically update
      utils.interactions.getSaved.setData(
        undefined,
        (old) => old ? {
          ...old,
          ideas: [...old.ideas, { id: ideaId } as any]
        } : old
      );
      
      return { previousSaved };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSaved) {
        utils.interactions.getSaved.setData(
          undefined,
          context.previousSaved
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.interactions.getSaved.invalidate();
    },
  });
  
  return saveIdea;
}
```

This API reference provides comprehensive documentation for all available endpoints, types, and usage patterns in the Nugget Finder platform.