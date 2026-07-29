CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGEMENT', 'CASHIER', 'SCHOOL_CONTROL', 'READ_ONLY');
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'NOT_SPECIFIED');
CREATE TYPE "AdministrativeStatus" AS ENUM ('ACTIVE', 'CURRENT', 'WITH_DEBT', 'TEMPORARY_LEAVE', 'GRADUATED');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'FINISHED', 'CANCELLED');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'RECEIVED', 'REVIEW', 'REJECTED');
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('APPLIED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'OTHER');
CREATE TYPE "FollowUpType" AS ENUM ('ACADEMIC', 'PAYMENT', 'DOCUMENT', 'ADMINISTRATIVE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'READ_ONLY',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Student" (
  "id" TEXT NOT NULL,
  "enrollmentNumber" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "paternalLastName" TEXT NOT NULL,
  "maternalLastName" TEXT,
  "birthDate" TIMESTAMP(3),
  "curp" TEXT,
  "sex" "Sex",
  "maritalStatus" TEXT,
  "occupation" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "street" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "administrativeStatus" "AdministrativeStatus" NOT NULL DEFAULT 'ACTIVE',
  "observations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "academicLevelId" TEXT NOT NULL,
  "modalityId" TEXT NOT NULL,
  "groupId" TEXT,
  "grade" TEXT,
  "fourMonthPeriod" INTEGER,
  "enrollmentDate" TIMESTAMP(3) NOT NULL,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "registrationFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "weeklyFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "lateFeePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "paymentDay" INTEGER,
  "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicLevel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "AcademicLevel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Modality" (
  "id" TEXT NOT NULL,
  "academicLevelId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Modality_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "academicLevelId" TEXT NOT NULL,
  "modalityId" TEXT NOT NULL,
  "schedule" TEXT,
  "capacity" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentDocument" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "documentTypeId" TEXT NOT NULL,
  "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  "physicalLocation" TEXT,
  "fileUrl" TEXT,
  "receivedAt" TIMESTAMP(3),
  "observations" TEXT,
  CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChargeConcept" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "defaultAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ChargeConcept_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Charge" (
  "id" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "chargeConceptId" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "baseAmount" DECIMAL(10,2) NOT NULL,
  "surchargeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "balance" DECIMAL(10,2) NOT NULL,
  "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
  "reference" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'APPLIED',
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentApplication" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "chargeId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "PaymentApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Receipt" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FollowUp" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "type" "FollowUpType" NOT NULL,
  "description" TEXT NOT NULL,
  "nextFollowUpAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "previousData" JSONB,
  "newData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE UNIQUE INDEX "Student_enrollmentNumber_key" ON "Student"("enrollmentNumber");
CREATE UNIQUE INDEX "Student_curp_key" ON "Student"("curp");
CREATE INDEX "Student_paternalLastName_maternalLastName_firstName_idx" ON "Student"("paternalLastName", "maternalLastName", "firstName");
CREATE INDEX "Student_administrativeStatus_idx" ON "Student"("administrativeStatus");
CREATE INDEX "Student_createdAt_idx" ON "Student"("createdAt");
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");
CREATE INDEX "Enrollment_academicLevelId_modalityId_groupId_idx" ON "Enrollment"("academicLevelId", "modalityId", "groupId");
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");
CREATE INDEX "Enrollment_enrollmentDate_idx" ON "Enrollment"("enrollmentDate");
CREATE UNIQUE INDEX "AcademicLevel_code_key" ON "AcademicLevel"("code");
CREATE UNIQUE INDEX "Modality_code_key" ON "Modality"("code");
CREATE INDEX "Modality_academicLevelId_idx" ON "Modality"("academicLevelId");
CREATE INDEX "Group_academicLevelId_modalityId_idx" ON "Group"("academicLevelId", "modalityId");
CREATE UNIQUE INDEX "StudentDocument_studentId_documentTypeId_key" ON "StudentDocument"("studentId", "documentTypeId");
CREATE INDEX "StudentDocument_status_idx" ON "StudentDocument"("status");
CREATE UNIQUE INDEX "ChargeConcept_code_key" ON "ChargeConcept"("code");
CREATE INDEX "Charge_enrollmentId_idx" ON "Charge"("enrollmentId");
CREATE INDEX "Charge_dueDate_status_idx" ON "Charge"("dueDate", "status");
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");
CREATE UNIQUE INDEX "PaymentApplication_paymentId_chargeId_key" ON "PaymentApplication"("paymentId", "chargeId");
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");
CREATE UNIQUE INDEX "Receipt_folio_key" ON "Receipt"("folio");
CREATE INDEX "FollowUp_studentId_type_idx" ON "FollowUp"("studentId", "type");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Modality" ADD CONSTRAINT "Modality_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_chargeConceptId_fkey" FOREIGN KEY ("chargeConceptId") REFERENCES "ChargeConcept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
