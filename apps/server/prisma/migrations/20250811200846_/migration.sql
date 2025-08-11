-- AlterTable
ALTER TABLE "IdeaGenerationRequest" ADD COLUMN     "personalizationData" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
