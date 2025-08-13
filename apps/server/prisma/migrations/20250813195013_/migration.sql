-- CreateTable
CREATE TABLE "FeaturedNuggetsSchedule" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "ideaIds" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "FeaturedNuggetsSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedNuggetsSchedule_date_key" ON "FeaturedNuggetsSchedule"("date");

-- AddForeignKey
ALTER TABLE "FeaturedNuggetsSchedule" ADD CONSTRAINT "FeaturedNuggetsSchedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
