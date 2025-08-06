-- CreateEnum
CREATE TYPE "IdeaGenerationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "IdeaGenerationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "IdeaGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" TEXT,
    "progressMessage" TEXT,
    "imageState" TEXT,
    "generatedIdeaIds" TEXT[],
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaGenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaGenerationRequest_userId_idx" ON "IdeaGenerationRequest"("userId");

-- CreateIndex
CREATE INDEX "IdeaGenerationRequest_status_idx" ON "IdeaGenerationRequest"("status");

-- AddForeignKey
ALTER TABLE "IdeaGenerationRequest" ADD CONSTRAINT "IdeaGenerationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
