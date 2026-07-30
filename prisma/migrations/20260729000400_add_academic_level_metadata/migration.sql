-- Allow inactive historical academic levels to keep repeated codes while active
-- duplicates are enforced by the application service.
DROP INDEX IF EXISTS "AcademicLevel_code_key";

ALTER TABLE "AcademicLevel"
ALTER COLUMN "code" DROP NOT NULL,
ADD COLUMN "description" TEXT,
ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "AcademicLevel_active_displayOrder_name_idx" ON "AcademicLevel"("active", "displayOrder", "name");
CREATE INDEX "AcademicLevel_active_code_idx" ON "AcademicLevel"("active", "code");
CREATE INDEX "AcademicLevel_createdById_idx" ON "AcademicLevel"("createdById");
CREATE INDEX "AcademicLevel_updatedById_idx" ON "AcademicLevel"("updatedById");

ALTER TABLE "AcademicLevel"
ADD CONSTRAINT "AcademicLevel_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "AcademicLevel"
ADD CONSTRAINT "AcademicLevel_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
