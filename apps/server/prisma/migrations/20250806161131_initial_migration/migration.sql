-- CreateEnum
CREATE TYPE "CatalystType" AS ENUM ('TECHNOLOGY_BREAKTHROUGH', 'REGULATORY_CHANGE', 'MARKET_SHIFT', 'SOCIAL_TREND', 'ECONOMIC_FACTOR');

-- CreateEnum
CREATE TYPE "MarketMaturityLevel" AS ENUM ('EARLY_STAGES', 'GROWTH_STAGES', 'MATURE_STAGES');

-- CreateEnum
CREATE TYPE "MarketConcentrationLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "GrowthScale" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateTable
CREATE TABLE "user" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "claimLimit" INTEGER NOT NULL DEFAULT 0,
    "claimsUsed" INTEGER NOT NULL DEFAULT 0,
    "saveLimit" INTEGER NOT NULL DEFAULT 0,
    "savesUsed" INTEGER NOT NULL DEFAULT 0,
    "viewLimit" INTEGER NOT NULL DEFAULT 1,
    "viewsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastViewReset" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "session" (
    "_id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "account" (
    "_id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "verification" (
    "_id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'incomplete',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "seats" INTEGER,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "paymentVerification" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paymentVerification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "WhyNow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trendStrength" INTEGER NOT NULL,
    "catalystType" "CatalystType" NOT NULL,
    "timingUrgency" INTEGER NOT NULL,
    "supportingData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyNow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaScore" (
    "id" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "problemSeverity" INTEGER NOT NULL,
    "founderMarketFit" INTEGER NOT NULL,
    "technicalFeasibility" INTEGER NOT NULL,
    "monetizationPotential" INTEGER NOT NULL,
    "urgencyScore" INTEGER NOT NULL,
    "marketTimingScore" INTEGER NOT NULL,
    "executionDifficulty" INTEGER NOT NULL,
    "moatStrength" INTEGER NOT NULL,
    "regulatoryRisk" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketOpportunity" (
    "id" TEXT NOT NULL,
    "marketOpportunityScore" INTEGER NOT NULL,
    "ValidationStrength" INTEGER NOT NULL,
    "totalMarketSize" INTEGER NOT NULL,
    "reachableMarketSize" INTEGER NOT NULL,
    "realisticMarketSize" INTEGER NOT NULL,
    "growthRate" INTEGER NOT NULL,
    "adoptionRate" INTEGER NOT NULL,
    "marketMaturityLevel" "MarketMaturityLevel" NOT NULL,
    "marketAnalysisSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketValidationSignals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marketOpportunityId" TEXT NOT NULL,

    CONSTRAINT "MarketValidationSignals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketCompetition" (
    "id" TEXT NOT NULL,
    "marketConcentrationLevel" "MarketConcentrationLevel" NOT NULL,
    "marketConcentrationJustification" TEXT NOT NULL,
    "directCompetitors" JSONB NOT NULL,
    "indirectCompetitors" JSONB NOT NULL,
    "competitorFailurePoints" TEXT[],
    "unfairAdvantage" TEXT[],
    "moat" TEXT[],
    "competitivePositioningScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "MarketCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSegments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "growthScale" "GrowthScale" NOT NULL,
    "growthScaleJustification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marketOpportunityId" TEXT NOT NULL,

    CONSTRAINT "CustomerSegments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketGap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "opportunity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "MarketGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveAdvantage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sustainability" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "CompetitiveAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicPositioning" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetSegment" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "keyDifferentiators" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "StrategicPositioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonetizationStrategy" (
    "id" TEXT NOT NULL,
    "primaryModel" TEXT NOT NULL,
    "pricingStrategy" TEXT NOT NULL,
    "businessScore" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL,
    "revenueModelValidation" TEXT NOT NULL,
    "pricingSensitivity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonetizationStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueStream" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "monetizationStrategyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyMetrics" (
    "id" TEXT NOT NULL,
    "ltv" INTEGER NOT NULL,
    "ltvDescription" TEXT NOT NULL,
    "cac" INTEGER NOT NULL,
    "cacDescription" TEXT NOT NULL,
    "ltvCacRatio" DOUBLE PRECISION NOT NULL,
    "ltvCacRatioDescription" TEXT NOT NULL,
    "paybackPeriod" INTEGER NOT NULL,
    "paybackPeriodDescription" TEXT NOT NULL,
    "runway" INTEGER NOT NULL,
    "runwayDescription" TEXT NOT NULL,
    "breakEvenPoint" TEXT NOT NULL,
    "breakEvenPointDescription" TEXT NOT NULL,
    "monetizationStrategyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProjection" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "costs" DOUBLE PRECISION NOT NULL,
    "netMargin" DOUBLE PRECISION NOT NULL,
    "revenueGrowth" DOUBLE PRECISION NOT NULL,
    "monetizationStrategyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" TEXT NOT NULL,
    "mvpDescription" TEXT NOT NULL,
    "keyMilestones" JSONB NOT NULL,
    "resourceRequirements" TEXT NOT NULL,
    "teamRequirements" TEXT[],
    "riskFactors" TEXT[],
    "technicalRoadmap" TEXT NOT NULL,
    "goToMarketStrategy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "ExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TractionSignals" (
    "id" TEXT NOT NULL,
    "waitlistCount" INTEGER,
    "socialMentions" INTEGER,
    "searchVolume" INTEGER,
    "competitorFunding" DOUBLE PRECISION,
    "patentActivity" INTEGER,
    "regulatoryChanges" TEXT[],
    "mediaAttention" INTEGER,
    "expertEndorsements" TEXT[],
    "earlyAdopterSignals" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "TractionSignals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkFit" (
    "id" TEXT NOT NULL,
    "jobsToBeDone" TEXT[],
    "blueOceanFactors" JSONB NOT NULL,
    "leanCanvasScore" INTEGER NOT NULL,
    "designThinkingStage" TEXT NOT NULL,
    "innovationDilemmaFit" TEXT NOT NULL,
    "crossingChasmStage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,

    CONSTRAINT "FrameworkFit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatToBuild" (
    "id" TEXT NOT NULL,
    "platformDescription" TEXT NOT NULL,
    "coreFeaturesSummary" TEXT[],
    "userInterfaces" TEXT[],
    "keyIntegrations" TEXT[],
    "pricingStrategyBuildRecommendation" TEXT NOT NULL,
    "dailyIdeaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatToBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "problemSolution" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "innovationLevel" INTEGER NOT NULL,
    "timeToMarket" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "narrativeHook" TEXT NOT NULL,
    "targetKeywords" TEXT[],
    "urgencyLevel" INTEGER NOT NULL,
    "executionComplexity" INTEGER NOT NULL,
    "tags" TEXT[],
    "ideaScoreId" TEXT,
    "marketOpportunityId" TEXT,
    "monetizationStrategyId" TEXT,
    "whyNowId" TEXT NOT NULL,
    "whatToBuildId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIdeas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedIdeas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimedIdeas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimedIdeas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewedIdeas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewedIdeas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_referenceId_key" ON "subscription"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "paymentVerification_userId_key" ON "paymentVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "paymentVerification_transactionNumber_key" ON "paymentVerification"("transactionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MarketCompetition_dailyIdeaId_key" ON "MarketCompetition"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketGap_dailyIdeaId_key" ON "MarketGap"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitiveAdvantage_dailyIdeaId_key" ON "CompetitiveAdvantage"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "StrategicPositioning_dailyIdeaId_key" ON "StrategicPositioning"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyMetrics_monetizationStrategyId_key" ON "KeyMetrics"("monetizationStrategyId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_dailyIdeaId_key" ON "ExecutionPlan"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "TractionSignals_dailyIdeaId_key" ON "TractionSignals"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkFit_dailyIdeaId_key" ON "FrameworkFit"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatToBuild_dailyIdeaId_key" ON "WhatToBuild"("dailyIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyIdea_ideaScoreId_key" ON "DailyIdea"("ideaScoreId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyIdea_marketOpportunityId_key" ON "DailyIdea"("marketOpportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyIdea_monetizationStrategyId_key" ON "DailyIdea"("monetizationStrategyId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyIdea_whatToBuildId_key" ON "DailyIdea"("whatToBuildId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIdeas_userId_ideaId_key" ON "SavedIdeas"("userId", "ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimedIdeas_ideaId_key" ON "ClaimedIdeas"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewedIdeas_userId_ideaId_key" ON "ViewedIdeas"("userId", "ideaId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentVerification" ADD CONSTRAINT "paymentVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketValidationSignals" ADD CONSTRAINT "MarketValidationSignals_marketOpportunityId_fkey" FOREIGN KEY ("marketOpportunityId") REFERENCES "MarketOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketCompetition" ADD CONSTRAINT "MarketCompetition_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSegments" ADD CONSTRAINT "CustomerSegments_marketOpportunityId_fkey" FOREIGN KEY ("marketOpportunityId") REFERENCES "MarketOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketGap" ADD CONSTRAINT "MarketGap_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveAdvantage" ADD CONSTRAINT "CompetitiveAdvantage_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicPositioning" ADD CONSTRAINT "StrategicPositioning_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueStream" ADD CONSTRAINT "RevenueStream_monetizationStrategyId_fkey" FOREIGN KEY ("monetizationStrategyId") REFERENCES "MonetizationStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyMetrics" ADD CONSTRAINT "KeyMetrics_monetizationStrategyId_fkey" FOREIGN KEY ("monetizationStrategyId") REFERENCES "MonetizationStrategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialProjection" ADD CONSTRAINT "FinancialProjection_monetizationStrategyId_fkey" FOREIGN KEY ("monetizationStrategyId") REFERENCES "MonetizationStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TractionSignals" ADD CONSTRAINT "TractionSignals_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkFit" ADD CONSTRAINT "FrameworkFit_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatToBuild" ADD CONSTRAINT "WhatToBuild_dailyIdeaId_fkey" FOREIGN KEY ("dailyIdeaId") REFERENCES "DailyIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_ideaScoreId_fkey" FOREIGN KEY ("ideaScoreId") REFERENCES "IdeaScore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_marketOpportunityId_fkey" FOREIGN KEY ("marketOpportunityId") REFERENCES "MarketOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_monetizationStrategyId_fkey" FOREIGN KEY ("monetizationStrategyId") REFERENCES "MonetizationStrategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyIdea" ADD CONSTRAINT "DailyIdea_whyNowId_fkey" FOREIGN KEY ("whyNowId") REFERENCES "WhyNow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdeas" ADD CONSTRAINT "SavedIdeas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdeas" ADD CONSTRAINT "SavedIdeas_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "DailyIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedIdeas" ADD CONSTRAINT "ClaimedIdeas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimedIdeas" ADD CONSTRAINT "ClaimedIdeas_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "DailyIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewedIdeas" ADD CONSTRAINT "ViewedIdeas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewedIdeas" ADD CONSTRAINT "ViewedIdeas_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "DailyIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
