-- AlterTable
ALTER TABLE "DailyIdea" ADD COLUMN     "isFreeChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeCompetitiveLandscape" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeDetailedOverview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFreeExecutionPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeExecutionValidation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeMarketGap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeQuickOverview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFreeRevenueModel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeTheClaimWhyNow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeWhatToBuild" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFreeWhyThisMatters" BOOLEAN NOT NULL DEFAULT true;
