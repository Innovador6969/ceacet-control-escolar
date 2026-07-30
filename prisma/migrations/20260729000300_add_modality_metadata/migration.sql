-- Add metadata fields and audit user links for academic modalities.
-- Existing modality records are preserved. New user references remain nullable.
DROP INDEX IF EXISTS "Modality_code_key";

ALTER TABLE "Modality"
ALTER COLUMN "code" DROP NOT NULL,
ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Modality_active_academicLevelId_idx" ON "Modality"("active", "academicLevelId");
CREATE INDEX "Modality_active_code_idx" ON "Modality"("active", "code");
CREATE INDEX "Modality_createdById_idx" ON "Modality"("createdById");
CREATE INDEX "Modality_updatedById_idx" ON "Modality"("updatedById");

ALTER TABLE "Modality"
ADD CONSTRAINT "Modality_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Modality"
ADD CONSTRAINT "Modality_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
