ALTER TABLE "user" ALTER COLUMN "viewLimit" SET DEFAULT 1000;

UPDATE "user"
SET "viewLimit" = 1000
WHERE "viewLimit" = 1; 