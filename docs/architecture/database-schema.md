# Database Schema Documentation

## 🗄️ Overview

The Nugget Finder platform uses PostgreSQL as its primary database with Prisma as the ORM. The schema is designed to support the multi-agent AI system, user management, subscription handling, and content management features.

## 📊 Complete Entity Relationship Diagram

```mermaid
erDiagram
    %% Core User Management
    User {
        string id PK "Better Auth compatible ID"
        string name "User's display name"
        string email UK "Unique email address"
        boolean emailVerified "Email verification status"
        string image "Profile image URL"
        string role "user, admin"
        int claimLimit "Number of claims allowed"
        int claimsUsed "Number of claims used"
        int saveLimit "Number of saves allowed (-1 for unlimited)"
        int savesUsed "Number of saves used"
        int viewLimit "Number of views per day (-1 for unlimited)"
        int viewsUsed "Number of views used today"
        datetime lastViewReset "Last time view count was reset"
        string stripeCustomerId "Stripe customer ID"
        datetime createdAt "Account creation timestamp"
        datetime updatedAt "Last update timestamp"
    }
    
    Session {
        string id PK "Session identifier"
        datetime expiresAt "Session expiration"
        string token UK "Unique session token"
        datetime createdAt "Session creation"
        datetime updatedAt "Last session update"
        string ipAddress "Client IP address"
        string userAgent "Client user agent"
        string userId FK "Associated user"
    }
    
    Account {
        string id PK "Account identifier"
        string accountId "Provider account ID"
        string providerId "OAuth provider"
        string userId FK "Associated user"
        string accessToken "OAuth access token"
        string refreshToken "OAuth refresh token"
        string idToken "OAuth ID token"
        datetime accessTokenExpiresAt "Token expiration"
        datetime refreshTokenExpiresAt "Refresh token expiration"
        string scope "OAuth scope"
        string password "Hashed password"
        datetime createdAt "Account creation"
        datetime updatedAt "Last update"
    }
    
    Verification {
        string id PK "Verification identifier"
        string identifier "Email/phone to verify"
        string value "Verification code"
        datetime expiresAt "Code expiration"
        datetime createdAt "Code creation"
        datetime updatedAt "Last update"
    }
    
    %% Subscription & Payment
    Subscription {
        string id PK "Subscription identifier"
        string plan "Subscription plan name"
        string referenceId UK "Better Auth user ID"
        string stripeCustomerId "Stripe customer ID"
        string stripeSubscriptionId "Stripe subscription ID"
        string status "incomplete, active, past_due, canceled"
        datetime periodStart "Billing period start"
        datetime periodEnd "Billing period end"
        boolean cancelAtPeriodEnd "Cancel at period end flag"
        int seats "Number of seats (for team plans)"
        datetime trialStart "Trial period start"
        datetime trialEnd "Trial period end"
        datetime createdAt "Subscription creation"
        datetime updatedAt "Last update"
    }
    
    PaymentVerification {
        string id PK "Payment verification ID"
        string userId UK "User who made payment"
        string transactionNumber UK "Unique transaction number"
        decimal amount "Payment amount"
        string currency "Payment currency"
        string status "pending, completed, failed"
        datetime createdAt "Payment creation"
        datetime updatedAt "Last update"
    }
    
    %% Core Business Logic - Ideas
    DailyIdea {
        string id PK "Unique idea identifier"
        string title "Idea title"
        string description "Detailed description"
        string executiveSummary "Executive summary"
        string problemSolution "Problem and solution"
        string problemStatement "Problem statement"
        int innovationLevel "Innovation level (1-10)"
        int timeToMarket "Time to market in months"
        int confidenceScore "Confidence score (1-10)"
        string narrativeHook "SEO-friendly story angle"
        string[] targetKeywords "SEO keywords"
        int urgencyLevel "Urgency level (1-10)"
        int executionComplexity "Execution complexity (1-10)"
        string[] tags "Idea tags"
        
        %% Feature visibility flags
        boolean isFreeQuickOverview "Free access to quick overview"
        boolean isFreeWhyThisMatters "Free access to why this matters"
        boolean isFreeDetailedOverview "Free access to detailed overview"
        boolean isFreeTheClaimWhyNow "Free access to why now"
        boolean isFreeWhatToBuild "Free access to what to build"
        boolean isFreeExecutionPlan "Free access to execution plan"
        boolean isFreeMarketGap "Free access to market gap"
        boolean isFreeCompetitiveLandscape "Free access to competitive landscape"
        boolean isFreeRevenueModel "Free access to revenue model"
        boolean isFreeExecutionValidation "Free access to execution validation"
        boolean isFreeChat "Free access to AI chat"
        
        %% Foreign keys
        string ideaScoreId FK "Associated idea score"
        string marketOpportunityId FK "Associated market opportunity"
        string monetizationStrategyId FK "Associated monetization strategy"
        string whyNowId FK "Associated why now data"
        string whatToBuildId FK "Associated what to build data"
        
        datetime createdAt "Idea creation"
        datetime updatedAt "Last update"
    }
    
    %% AI Agent Outputs
    WhyNow {
        string id PK "Why now identifier"
        string title "Trend title"
        string description "Trend description"
        int trendStrength "Trend strength (1-10)"
        string catalystType "TECHNOLOGY_BREAKTHROUGH, REGULATORY_CHANGE, MARKET_SHIFT, SOCIAL_TREND, ECONOMIC_FACTOR"
        int timingUrgency "Timing urgency (1-10)"
        json supportingData "Array of data points"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    IdeaScore {
        string id PK "Score identifier"
        int totalScore "Overall idea score"
        int problemSeverity "Problem severity (1-10)"
        int founderMarketFit "Founder-market fit (1-10)"
        int technicalFeasibility "Technical feasibility (1-10)"
        int monetizationPotential "Monetization potential (1-10)"
        int urgencyScore "Urgency score (1-10)"
        int marketTimingScore "Market timing score (1-10)"
        int executionDifficulty "Execution difficulty (1-10)"
        int moatStrength "Moat strength (1-10)"
        int regulatoryRisk "Regulatory risk (1-10)"
        datetime createdAt "Score creation"
        datetime updatedAt "Last update"
    }
    
    MarketOpportunity {
        string id PK "Market opportunity ID"
        int marketOpportunityScore "Market opportunity score"
        int validationStrength "Validation strength"
        int totalMarketSize "Total addressable market"
        int reachableMarketSize "Reachable market size"
        int realisticMarketSize "Realistic market size"
        int growthRate "Market growth rate"
        int adoptionRate "Adoption rate"
        string marketMaturityLevel "EARLY_STAGES, GROWTH_STAGES, MATURE_STAGES"
        string marketAnalysisSummary "Market analysis summary"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    CustomerSegments {
        string id PK "Customer segment ID"
        string name "Segment name"
        string description "Segment description"
        string growthScale "SMALL, MEDIUM, LARGE"
        string growthScaleJustification "Growth scale justification"
        string marketOpportunityId FK "Associated market opportunity"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    MarketValidationSignals {
        string id PK "Validation signal ID"
        string name "Signal name"
        string description "Signal description"
        string marketOpportunityId FK "Associated market opportunity"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    MarketCompetition {
        string id PK "Competition analysis ID"
        string marketConcentrationLevel "LOW, MEDIUM, HIGH"
        string marketConcentrationJustification "Concentration justification"
        json directCompetitors "Array of competitor objects"
        json indirectCompetitors "Array of indirect competitor objects"
        string[] competitorFailurePoints "Competitor failure points"
        string[] unfairAdvantage "Unfair advantages"
        string[] moat "Competitive moats"
        int competitivePositioningScore "Positioning score"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    MarketGap {
        string id PK "Market gap ID"
        string title "Gap title"
        string description "Gap description"
        string impact "Gap impact"
        string target "Target audience"
        string opportunity "Opportunity description"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    CompetitiveAdvantage {
        string id PK "Competitive advantage ID"
        string title "Advantage title"
        string description "Advantage description"
        string sustainability "Sustainability analysis"
        string impact "Impact assessment"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    StrategicPositioning {
        string id PK "Strategic positioning ID"
        string name "Positioning name"
        string targetSegment "Target segment"
        string valueProposition "Value proposition"
        string[] keyDifferentiators "Key differentiators"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    MonetizationStrategy {
        string id PK "Monetization strategy ID"
        string primaryModel "Primary revenue model"
        string pricingStrategy "Pricing strategy"
        float businessScore "Business score"
        int confidence "Confidence level"
        string revenueModelValidation "Revenue model validation"
        string pricingSensitivity "Pricing sensitivity analysis"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    RevenueStream {
        string id PK "Revenue stream ID"
        string name "Stream name"
        string description "Stream description"
        int percentage "Revenue percentage"
        string monetizationStrategyId FK "Associated strategy"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    KeyMetrics {
        string id PK "Key metrics ID"
        int ltv "Lifetime value"
        string ltvDescription "LTV description"
        int cac "Customer acquisition cost"
        string cacDescription "CAC description"
        float ltvCacRatio "LTV/CAC ratio"
        string ltvCacRatioDescription "Ratio description"
        int paybackPeriod "Payback period in months"
        string paybackPeriodDescription "Payback description"
        int runway "Runway in months"
        string runwayDescription "Runway description"
        string breakEvenPoint "Break-even point"
        string breakEvenPointDescription "Break-even description"
        string monetizationStrategyId FK "Associated strategy"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    FinancialProjection {
        string id PK "Financial projection ID"
        int year "Projection year"
        float revenue "Projected revenue"
        float costs "Projected costs"
        float netMargin "Net margin"
        float revenueGrowth "Revenue growth rate"
        string monetizationStrategyId FK "Associated strategy"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    ExecutionPlan {
        string id PK "Execution plan ID"
        string mvpDescription "MVP description"
        json keyMilestones "Array of milestone objects"
        string resourceRequirements "Resource requirements"
        string[] teamRequirements "Team requirements"
        string[] riskFactors "Risk factors"
        string technicalRoadmap "Technical roadmap"
        string goToMarketStrategy "Go-to-market strategy"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    TractionSignals {
        string id PK "Traction signals ID"
        int waitlistCount "Waitlist count"
        int socialMentions "Social media mentions"
        int searchVolume "Search volume"
        float competitorFunding "Competitor funding amount"
        int patentActivity "Patent activity count"
        string[] regulatoryChanges "Regulatory changes"
        int mediaAttention "Media attention score"
        string[] expertEndorsements "Expert endorsements"
        string[] earlyAdopterSignals "Early adopter signals"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    FrameworkFit {
        string id PK "Framework fit ID"
        string[] jobsToBeDone "Jobs to be done"
        json blueOceanFactors "Blue ocean strategy factors"
        int leanCanvasScore "Lean canvas score"
        string designThinkingStage "Design thinking stage"
        string innovationDilemmaFit "Innovation dilemma fit"
        string crossingChasmStage "Crossing the chasm stage"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    WhatToBuild {
        string id PK "What to build ID"
        string platformDescription "Platform description"
        string[] coreFeaturesSummary "Core features"
        string[] userInterfaces "User interfaces"
        string[] keyIntegrations "Key integrations"
        string pricingStrategyBuildRecommendation "Pricing strategy"
        string dailyIdeaId FK "Associated daily idea"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    %% User Interactions
    SavedIdeas {
        string id PK "Saved idea ID"
        string userId FK "User who saved"
        string ideaId FK "Saved idea"
        datetime createdAt "Save timestamp"
        datetime updatedAt "Last update"
    }
    
    ClaimedIdeas {
        string id PK "Claimed idea ID"
        string userId FK "User who claimed"
        string ideaId FK "Claimed idea"
        datetime createdAt "Claim timestamp"
        datetime updatedAt "Last update"
    }
    
    ViewedIdeas {
        string id PK "Viewed idea ID"
        string userId FK "User who viewed"
        string ideaId FK "Viewed idea"
        datetime createdAt "View timestamp"
        datetime updatedAt "Last update"
    }
    
    %% User Generated Ideas
    UserGeneratedIdea {
        string id PK "User generated idea ID"
        string userId FK "User who generated"
        string prompt "Original user prompt"
        string title "Generated idea title"
        string description "Generated idea description"
        string executiveSummary "Executive summary"
        string problemStatement "Problem statement"
        string narrativeHook "Narrative hook"
        string[] tags "Idea tags"
        int confidenceScore "Confidence score"
        string fullIdeaDataJson "Complete idea data as JSON"
        datetime createdAt "Generation timestamp"
        datetime updatedAt "Last update"
    }
    
    IdeaGenerationRequest {
        string id PK "Generation request ID"
        string userId FK "User who requested (nullable)"
        string prompt "User prompt"
        string status "PENDING, RUNNING, COMPLETED, FAILED"
        string currentStep "Current generation step"
        string progressMessage "Progress message"
        string imageState "confused, digging, happy, found"
        string personalizationData "Personalization data JSON"
        string[] generatedIdeaIds "Generated idea IDs"
        string errorMessage "Error message if failed"
        datetime createdAt "Request timestamp"
        datetime updatedAt "Last update"
    }
    
    %% Admin Features
    FeaturedNuggetsSchedule {
        string id PK "Schedule ID"
        datetime date UK "Scheduled date"
        string[] ideaIds "Featured idea IDs"
        int order "Display order"
        boolean isActive "Schedule active status"
        string createdBy FK "Admin who created"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    AdminPrompts {
        string id PK "Admin prompt ID"
        string agentName "Agent name"
        string promptKey "Prompt key"
        string promptContent "Prompt content"
        boolean isActive "Prompt active status"
        string updatedBy FK "Admin who updated"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update"
    }
    
    %% Relationships
    User ||--o{ Session : has
    User ||--o{ Account : has
    User ||--o{ Subscription : has
    User ||--o{ PaymentVerification : has
    User ||--o{ SavedIdeas : saves
    User ||--o{ ClaimedIdeas : claims
    User ||--o{ ViewedIdeas : views
    User ||--o{ UserGeneratedIdea : generates
    User ||--o{ IdeaGenerationRequest : requests
    User ||--o{ FeaturedNuggetsSchedule : creates
    User ||--o{ AdminPrompts : updates
    
    DailyIdea ||--o| IdeaScore : scored_by
    DailyIdea ||--o| MarketOpportunity : analyzed_by
    DailyIdea ||--o| MonetizationStrategy : monetized_by
    DailyIdea ||--o| WhyNow : why_now
    DailyIdea ||--o| WhatToBuild : what_to_build
    DailyIdea ||--o| MarketCompetition : competition
    DailyIdea ||--o| MarketGap : market_gap
    DailyIdea ||--o| CompetitiveAdvantage : advantage
    DailyIdea ||--o| StrategicPositioning : positioning
    DailyIdea ||--o| ExecutionPlan : execution_plan
    DailyIdea ||--o| TractionSignals : traction
    DailyIdea ||--o| FrameworkFit : framework_fit
    DailyIdea ||--o{ SavedIdeas : saved_in
    DailyIdea ||--o{ ClaimedIdeas : claimed_in
    DailyIdea ||--o{ ViewedIdeas : viewed_in
    
    MarketOpportunity ||--o{ CustomerSegments : segments
    MarketOpportunity ||--o{ MarketValidationSignals : signals
    
    MonetizationStrategy ||--o{ RevenueStream : streams
    MonetizationStrategy ||--o| KeyMetrics : metrics
    MonetizationStrategy ||--o{ FinancialProjection : projections
```

## 📋 Database Indexes

### Performance Indexes

```sql
-- User indexes
CREATE INDEX idx_user_email ON "User"("email");
CREATE INDEX idx_user_role ON "User"("role");
CREATE INDEX idx_user_created_at ON "User"("createdAt" DESC);

-- DailyIdea indexes
CREATE INDEX idx_daily_idea_created_at ON "DailyIdea"("createdAt" DESC);
CREATE INDEX idx_daily_idea_confidence_score ON "DailyIdea"("confidenceScore" DESC);
CREATE INDEX idx_daily_idea_urgency_level ON "DailyIdea"("urgencyLevel" DESC);
CREATE INDEX idx_daily_idea_tags ON "DailyIdea" USING GIN("tags");
CREATE INDEX idx_daily_idea_target_keywords ON "DailyIdea" USING GIN("targetKeywords");

-- Subscription indexes
CREATE INDEX idx_subscription_status ON "Subscription"("status");
CREATE INDEX idx_subscription_reference_id ON "Subscription"("referenceId");
CREATE INDEX idx_subscription_stripe_customer_id ON "Subscription"("stripeCustomerId");

-- User interaction indexes
CREATE INDEX idx_saved_ideas_user_idea ON "SavedIdeas"("userId", "ideaId");
CREATE INDEX idx_claimed_ideas_user ON "ClaimedIdeas"("userId");
CREATE INDEX idx_viewed_ideas_user_idea ON "ViewedIdeas"("userId", "ideaId");
CREATE INDEX idx_viewed_ideas_created_at ON "ViewedIdeas"("createdAt" DESC);

-- Idea generation indexes
CREATE INDEX idx_user_generated_idea_user ON "UserGeneratedIdea"("userId");
CREATE INDEX idx_user_generated_idea_created_at ON "UserGeneratedIdea"("createdAt" DESC);
CREATE INDEX idx_idea_generation_request_user ON "IdeaGenerationRequest"("userId");
CREATE INDEX idx_idea_generation_request_status ON "IdeaGenerationRequest"("status");

-- Admin indexes
CREATE INDEX idx_featured_nuggets_schedule_date ON "FeaturedNuggetsSchedule"("date");
CREATE INDEX idx_admin_prompts_agent_key ON "AdminPrompts"("agentName", "promptKey");

-- Session and account indexes
CREATE INDEX idx_session_token ON "Session"("token");
CREATE INDEX idx_session_user_id ON "Session"("userId");
CREATE INDEX idx_account_user_id ON "Account"("userId");
CREATE INDEX idx_account_provider ON "Account"("providerId", "accountId");
```

## 🔄 Database Migrations

### Migration History

The database schema has evolved through several migrations:

1. **Initial Migration** (20250806161131_initial_migration)
   - Created core user and authentication tables
   - Established basic idea structure

2. **User Generated Ideas** (20250806180428_add_user_generated_ideas)
   - Added support for user-generated ideas
   - Implemented idea generation requests

3. **Idea Generation Request** (20250806214300_add_idea_generation_request)
   - Enhanced idea generation tracking
   - Added progress monitoring

4. **View Limit Default** (20250808120000_update_viewlimit_default)
   - Updated default view limits for users

5. **Feature Visibility** (20250811200846_)
   - Added feature visibility flags to ideas
   - Implemented free vs paid access control

6. **Admin Features** (20250813180217_)
   - Added admin role and permissions
   - Implemented featured nuggets scheduling

7. **Prompt Management** (20250813195013_)
   - Added dynamic prompt management
   - Created admin prompts table

### Running Migrations

```bash
# Generate a new migration
bun db:migrate --name descriptive_migration_name

# Apply migrations to database
bun db:migrate

# Reset database (development only)
bun db:migrate reset

# Deploy migrations to production
bun db:deploy
```

## 🗃️ Data Types and Constraints

### Enums

```sql
-- Catalyst types for trend analysis
CREATE TYPE "CatalystType" AS ENUM (
  'TECHNOLOGY_BREAKTHROUGH',
  'REGULATORY_CHANGE',
  'MARKET_SHIFT',
  'SOCIAL_TREND',
  'ECONOMIC_FACTOR'
);

-- Market maturity levels
CREATE TYPE "MarketMaturityLevel" AS ENUM (
  'EARLY_STAGES',
  'GROWTH_STAGES',
  'MATURE_STAGES'
);

-- Market concentration levels
CREATE TYPE "MarketConcentrationLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

-- Growth scale for customer segments
CREATE TYPE "GrowthScale" AS ENUM (
  'SMALL',
  'MEDIUM',
  'LARGE'
);

-- Idea generation status
CREATE TYPE "IdeaGenerationStatus" AS ENUM (
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED'
);
```

### Constraints

```sql
-- Unique constraints
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
ALTER TABLE "Session" ADD CONSTRAINT "Session_token_key" UNIQUE ("token");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_referenceId_key" UNIQUE ("referenceId");
ALTER TABLE "PaymentVerification" ADD CONSTRAINT "PaymentVerification_transactionNumber_key" UNIQUE ("transactionNumber");
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_ideaScoreId_key" UNIQUE ("ideaScoreId");
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_marketOpportunityId_key" UNIQUE ("marketOpportunityId");
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_monetizationStrategyId_key" UNIQUE ("monetizationStrategyId");
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_whatToBuildId_key" UNIQUE ("whatToBuildId");
ALTER TABLE "ClaimedIdeas" ADD CONSTRAINT "ClaimedIdeas_ideaId_key" UNIQUE ("ideaId");
ALTER TABLE "SavedIdeas" ADD CONSTRAINT "SavedIdeas_userId_ideaId_key" UNIQUE ("userId", "ideaId");
ALTER TABLE "ViewedIdeas" ADD CONSTRAINT "ViewedIdeas_userId_ideaId_key" UNIQUE ("userId", "ideaId");
ALTER TABLE "FeaturedNuggetsSchedule" ADD CONSTRAINT "FeaturedNuggetsSchedule_date_key" UNIQUE ("date");
ALTER TABLE "AdminPrompts" ADD CONSTRAINT "AdminPrompts_agentName_promptKey_key" UNIQUE ("agentName", "promptKey");

-- Check constraints
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_innovationLevel_check" CHECK ("innovationLevel" >= 1 AND "innovationLevel" <= 10);
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_confidenceScore_check" CHECK ("confidenceScore" >= 1 AND "confidenceScore" <= 10);
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_urgencyLevel_check" CHECK ("urgencyLevel" >= 1 AND "urgencyLevel" <= 10);
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_executionComplexity_check" CHECK ("executionComplexity" >= 1 AND "executionComplexity" <= 10);
```

## 📊 Data Relationships

### One-to-One Relationships

- `User` ↔ `PaymentVerification` (one user can have one payment verification)
- `DailyIdea` ↔ `IdeaScore` (one idea has one score)
- `DailyIdea` ↔ `MarketOpportunity` (one idea has one market opportunity)
- `DailyIdea` ↔ `MonetizationStrategy` (one idea has one monetization strategy)
- `DailyIdea` ↔ `WhatToBuild` (one idea has one what-to-build plan)
- `ClaimedIdeas` ↔ `DailyIdea` (one idea can be claimed by one user)

### One-to-Many Relationships

- `User` → `Session` (one user can have multiple sessions)
- `User` → `Account` (one user can have multiple OAuth accounts)
- `User` → `SavedIdeas` (one user can save multiple ideas)
- `User` → `ViewedIdeas` (one user can view multiple ideas)
- `User` → `UserGeneratedIdea` (one user can generate multiple ideas)
- `DailyIdea` → `SavedIdeas` (one idea can be saved by multiple users)
- `DailyIdea` → `ViewedIdeas` (one idea can be viewed by multiple users)
- `MarketOpportunity` → `CustomerSegments` (one opportunity can have multiple segments)
- `MarketOpportunity` → `MarketValidationSignals` (one opportunity can have multiple signals)
- `MonetizationStrategy` → `RevenueStream` (one strategy can have multiple revenue streams)
- `MonetizationStrategy` → `FinancialProjection` (one strategy can have multiple projections)

### Many-to-Many Relationships

- `User` ↔ `DailyIdea` (through SavedIdeas, ViewedIdeas, ClaimedIdeas)
- `User` ↔ `FeaturedNuggetsSchedule` (through createdBy relationship)

## 🔍 Query Optimization

### Common Query Patterns

1. **Get Today's Featured Ideas:**
```sql
SELECT di.* FROM "DailyIdea" di
JOIN "FeaturedNuggetsSchedule" fns ON di.id = ANY(fns."ideaIds")
WHERE fns.date = CURRENT_DATE AND fns."isActive" = true
ORDER BY fns."order";
```

2. **Get User's Saved Ideas:**
```sql
SELECT di.* FROM "DailyIdea" di
JOIN "SavedIdeas" si ON di.id = si."ideaId"
WHERE si."userId" = $1
ORDER BY si."createdAt" DESC;
```

3. **Get Ideas by Tags:**
```sql
SELECT * FROM "DailyIdea"
WHERE $1 = ANY(tags)
ORDER BY "confidenceScore" DESC, "createdAt" DESC;
```

4. **Get User's Usage Statistics:**
```sql
SELECT 
  "claimLimit", "claimsUsed", "saveLimit", "savesUsed", 
  "viewLimit", "viewsUsed", "lastViewReset"
FROM "User"
WHERE id = $1;
```

### Performance Tips

1. **Use Indexes**: Always query on indexed columns
2. **Limit Results**: Use LIMIT clauses for pagination
3. **Avoid N+1 Queries**: Use JOINs or batch queries
4. **Use JSON Functions**: Leverage PostgreSQL's JSON functions for complex data
5. **Monitor Query Performance**: Use EXPLAIN ANALYZE for slow queries

## 🔒 Data Security

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentVerification" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON "Subscription"
  FOR SELECT USING (auth.uid() = "referenceId");
```

### Data Encryption

- **At Rest**: Database encryption using PostgreSQL's built-in encryption
- **In Transit**: TLS/SSL encryption for all database connections
- **Sensitive Fields**: Hash passwords and sensitive data before storage

## 📈 Monitoring and Maintenance

### Database Monitoring

```sql
-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Maintenance Tasks

1. **Regular VACUUM**: Clean up dead tuples and update statistics
2. **ANALYZE**: Update table statistics for query planning
3. **REINDEX**: Rebuild indexes for better performance
4. **Backup**: Regular database backups with point-in-time recovery

This comprehensive database schema provides the foundation for all Nugget Finder features while maintaining performance, security, and scalability.


