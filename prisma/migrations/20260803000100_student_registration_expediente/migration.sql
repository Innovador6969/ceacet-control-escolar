-- Mejora de expediente: tutor, antecedente academico y documentos por nivel/grado.

CREATE TABLE "StudentGuardian" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "primaryPhone" TEXT NOT NULL,
  "alternatePhone" TEXT,
  "email" TEXT,
  "observations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentAcademicBackground" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "previousAcademicLevelId" TEXT,
  "previousSchool" TEXT,
  "lastGrade" TEXT,
  "previousSchoolCycle" TEXT,
  "observations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentAcademicBackground_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StudentDocument"
ADD COLUMN "academicLevelId" TEXT,
ADD COLUMN "grade" TEXT;

DROP INDEX IF EXISTS "StudentDocument_studentId_documentTypeId_key";

CREATE UNIQUE INDEX "StudentGuardian_studentId_key" ON "StudentGuardian"("studentId");

CREATE UNIQUE INDEX "StudentAcademicBackground_studentId_key" ON "StudentAcademicBackground"("studentId");
CREATE INDEX "StudentAcademicBackground_previousAcademicLevelId_idx" ON "StudentAcademicBackground"("previousAcademicLevelId");

CREATE INDEX "StudentDocument_studentId_documentTypeId_academicLevelId_grade_idx"
ON "StudentDocument"("studentId", "documentTypeId", "academicLevelId", "grade");

CREATE UNIQUE INDEX "StudentDocument_unique_document_level_grade_key"
ON "StudentDocument"("studentId", "documentTypeId", COALESCE("academicLevelId", ''), COALESCE("grade", ''));

CREATE INDEX "StudentDocument_academicLevelId_idx" ON "StudentDocument"("academicLevelId");

ALTER TABLE "StudentGuardian"
ADD CONSTRAINT "StudentGuardian_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "Student"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "StudentAcademicBackground"
ADD CONSTRAINT "StudentAcademicBackground_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "Student"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "StudentAcademicBackground"
ADD CONSTRAINT "StudentAcademicBackground_previousAcademicLevelId_fkey"
FOREIGN KEY ("previousAcademicLevelId")
REFERENCES "AcademicLevel"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "StudentDocument"
ADD CONSTRAINT "StudentDocument_academicLevelId_fkey"
FOREIGN KEY ("academicLevelId")
REFERENCES "AcademicLevel"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
