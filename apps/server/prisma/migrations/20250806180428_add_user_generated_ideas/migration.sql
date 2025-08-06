-- CreateTable
CREATE TABLE "UserGeneratedIdea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "narrativeHook" TEXT NOT NULL,
    "tags" TEXT[],
    "confidenceScore" INTEGER NOT NULL,
    "fullIdeaDataJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGeneratedIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserGeneratedIdea_userId_idx" ON "UserGeneratedIdea"("userId");

-- AddForeignKey
ALTER TABLE "UserGeneratedIdea" ADD CONSTRAINT "UserGeneratedIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
