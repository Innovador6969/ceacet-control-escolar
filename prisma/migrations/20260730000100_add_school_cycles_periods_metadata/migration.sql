-- School cycles and academic periods become historical catalogs.
-- Active duplicate rules are enforced by server-side transactional validation.
DROP INDEX IF EXISTS "SchoolCycle_name_key";
DROP INDEX IF EXISTS "SchoolCycle_isActive_idx";
DROP INDEX IF EXISTS "AcademicPeriod_schoolCycleId_name_key";
DROP INDEX IF EXISTS "AcademicPeriod_schoolCycleId_isActive_idx";

ALTER TABLE "SchoolCycle"
ADD COLUMN "code" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

ALTER TABLE "AcademicPeriod"
ADD COLUMN "code" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "displayOrder" INTEGER,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

WITH ordered_periods AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "schoolCycleId"
      ORDER BY "startDate", "endDate", "name", "id"
    ) AS "rowNumber"
  FROM "AcademicPeriod"
)
UPDATE "AcademicPeriod"
SET "displayOrder" = ordered_periods."rowNumber"
FROM ordered_periods
WHERE "AcademicPeriod"."id" = ordered_periods."id";

ALTER TABLE "AcademicPeriod"
ALTER COLUMN "displayOrder" SET NOT NULL,
ALTER COLUMN "displayOrder" SET DEFAULT 1;

CREATE INDEX "SchoolCycle_isActive_startDate_idx" ON "SchoolCycle"("isActive", "startDate");
CREATE INDEX "SchoolCycle_isCurrent_idx" ON "SchoolCycle"("isCurrent");
-- Garantiza que solo un ciclo escolar pueda estar marcado como actual.
CREATE UNIQUE INDEX "SchoolCycle_one_current_true_idx"
ON "SchoolCycle"("isCurrent")
WHERE "isCurrent" = true;
CREATE INDEX "SchoolCycle_isActive_code_idx" ON "SchoolCycle"("isActive", "code");
CREATE INDEX "SchoolCycle_createdById_idx" ON "SchoolCycle"("createdById");
CREATE INDEX "SchoolCycle_updatedById_idx" ON "SchoolCycle"("updatedById");

CREATE INDEX "AcademicPeriod_schoolCycleId_isActive_displayOrder_idx" ON "AcademicPeriod"("schoolCycleId", "isActive", "displayOrder");
CREATE INDEX "AcademicPeriod_schoolCycleId_isActive_code_idx" ON "AcademicPeriod"("schoolCycleId", "isActive", "code");
CREATE INDEX "AcademicPeriod_createdById_idx" ON "AcademicPeriod"("createdById");
CREATE INDEX "AcademicPeriod_updatedById_idx" ON "AcademicPeriod"("updatedById");

ALTER TABLE "SchoolCycle"
ADD CONSTRAINT "SchoolCycle_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "SchoolCycle"
ADD CONSTRAINT "SchoolCycle_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "AcademicPeriod"
ADD CONSTRAINT "AcademicPeriod_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "AcademicPeriod"
ADD CONSTRAINT "AcademicPeriod_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
