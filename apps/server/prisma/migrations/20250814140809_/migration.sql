-- CreateTable
CREATE TABLE "AdminPrompts" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "promptKey" TEXT NOT NULL,
    "promptContent" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "AdminPrompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminPrompts_agentName_promptKey_key" ON "AdminPrompts"("agentName", "promptKey");

-- AddForeignKey
ALTER TABLE "AdminPrompts" ADD CONSTRAINT "AdminPrompts_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
