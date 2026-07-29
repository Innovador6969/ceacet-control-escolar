ALTER TYPE "ChargeStatus" ADD VALUE IF NOT EXISTS 'WAIVED';

CREATE TYPE "ReEnrollmentStatus" AS ENUM ('DRAFT', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED');
CREATE TYPE "AcademicEventType" AS ENUM ('EXAM', 'COURSE_START', 'COURSE_END', 'CLASS_SESSION', 'HOLIDAY', 'SUSPENSION', 'GRADE_DEADLINE', 'INSTITUTIONAL', 'OTHER');
CREATE TYPE "AcademicEventStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

ALTER TABLE "Enrollment" ADD COLUMN "schoolCycleId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "academicPeriodId" TEXT;

CREATE TABLE "SchoolCycle" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolCycle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicPeriod" (
  "id" TEXT NOT NULL,
  "schoolCycleId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicPeriod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReEnrollment" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "schoolCycleId" TEXT NOT NULL,
  "academicPeriodId" TEXT,
  "academicLevelId" TEXT NOT NULL,
  "modalityId" TEXT NOT NULL,
  "groupId" TEXT,
  "chargeId" TEXT NOT NULL,
  "resultingEnrollmentId" TEXT,
  "status" "ReEnrollmentStatus" NOT NULL DEFAULT 'DRAFT',
  "dueDate" TIMESTAMP(3) NOT NULL,
  "lateFeePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subject" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "academicLevelId" TEXT NOT NULL,
  "modalityId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Teacher" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Classroom" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "capacity" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicAssignment" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "classroomId" TEXT,
  "academicPeriodId" TEXT NOT NULL,
  "academicLevelId" TEXT NOT NULL,
  "modalityId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScheduleRule" (
  "id" TEXT NOT NULL,
  "academicAssignmentId" TEXT NOT NULL,
  "weekday" "Weekday" NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduleRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicCalendarEvent" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" "AcademicEventType" NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "schoolCycleId" TEXT,
  "academicPeriodId" TEXT,
  "academicLevelId" TEXT,
  "modalityId" TEXT,
  "groupId" TEXT,
  "subjectId" TEXT,
  "teacherId" TEXT,
  "classroomId" TEXT,
  "status" "AcademicEventStatus" NOT NULL DEFAULT 'SCHEDULED',
  "reminderAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicCalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolCycle_name_key" ON "SchoolCycle"("name");
CREATE INDEX "SchoolCycle_isActive_idx" ON "SchoolCycle"("isActive");
CREATE INDEX "SchoolCycle_startDate_endDate_idx" ON "SchoolCycle"("startDate", "endDate");
CREATE UNIQUE INDEX "AcademicPeriod_schoolCycleId_name_key" ON "AcademicPeriod"("schoolCycleId", "name");
CREATE INDEX "AcademicPeriod_schoolCycleId_isActive_idx" ON "AcademicPeriod"("schoolCycleId", "isActive");
CREATE INDEX "AcademicPeriod_startDate_endDate_idx" ON "AcademicPeriod"("startDate", "endDate");
CREATE UNIQUE INDEX "ReEnrollment_chargeId_key" ON "ReEnrollment"("chargeId");
CREATE UNIQUE INDEX "ReEnrollment_resultingEnrollmentId_key" ON "ReEnrollment"("resultingEnrollmentId");
CREATE INDEX "ReEnrollment_studentId_schoolCycleId_academicLevelId_modalityId_groupId_academicPeriodId_idx" ON "ReEnrollment"("studentId", "schoolCycleId", "academicLevelId", "modalityId", "groupId", "academicPeriodId");
CREATE INDEX "ReEnrollment_status_idx" ON "ReEnrollment"("status");
CREATE INDEX "ReEnrollment_dueDate_idx" ON "ReEnrollment"("dueDate");
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
CREATE INDEX "Subject_academicLevelId_modalityId_idx" ON "Subject"("academicLevelId", "modalityId");
CREATE INDEX "Subject_active_idx" ON "Subject"("active");
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
CREATE INDEX "Teacher_active_idx" ON "Teacher"("active");
CREATE UNIQUE INDEX "Classroom_name_key" ON "Classroom"("name");
CREATE INDEX "Classroom_active_idx" ON "Classroom"("active");
CREATE INDEX "AcademicAssignment_academicPeriodId_groupId_idx" ON "AcademicAssignment"("academicPeriodId", "groupId");
CREATE INDEX "AcademicAssignment_academicPeriodId_teacherId_idx" ON "AcademicAssignment"("academicPeriodId", "teacherId");
CREATE INDEX "AcademicAssignment_academicPeriodId_classroomId_idx" ON "AcademicAssignment"("academicPeriodId", "classroomId");
CREATE INDEX "AcademicAssignment_subjectId_idx" ON "AcademicAssignment"("subjectId");
CREATE INDEX "ScheduleRule_academicAssignmentId_idx" ON "ScheduleRule"("academicAssignmentId");
CREATE INDEX "ScheduleRule_weekday_startDate_endDate_idx" ON "ScheduleRule"("weekday", "startDate", "endDate");
CREATE INDEX "ScheduleRule_active_idx" ON "ScheduleRule"("active");
CREATE INDEX "AcademicCalendarEvent_startsAt_endsAt_idx" ON "AcademicCalendarEvent"("startsAt", "endsAt");
CREATE INDEX "AcademicCalendarEvent_type_idx" ON "AcademicCalendarEvent"("type");
CREATE INDEX "AcademicCalendarEvent_schoolCycleId_academicPeriodId_idx" ON "AcademicCalendarEvent"("schoolCycleId", "academicPeriodId");
CREATE INDEX "AcademicCalendarEvent_groupId_idx" ON "AcademicCalendarEvent"("groupId");
CREATE INDEX "AcademicCalendarEvent_teacherId_idx" ON "AcademicCalendarEvent"("teacherId");
CREATE INDEX "AcademicCalendarEvent_subjectId_idx" ON "AcademicCalendarEvent"("subjectId");
CREATE INDEX "Enrollment_schoolCycleId_academicPeriodId_idx" ON "Enrollment"("schoolCycleId", "academicPeriodId");

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_schoolCycleId_fkey" FOREIGN KEY ("schoolCycleId") REFERENCES "SchoolCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicPeriod" ADD CONSTRAINT "AcademicPeriod_schoolCycleId_fkey" FOREIGN KEY ("schoolCycleId") REFERENCES "SchoolCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_schoolCycleId_fkey" FOREIGN KEY ("schoolCycleId") REFERENCES "SchoolCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_resultingEnrollmentId_fkey" FOREIGN KEY ("resultingEnrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReEnrollment" ADD CONSTRAINT "ReEnrollment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssignment" ADD CONSTRAINT "AcademicAssignment_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScheduleRule" ADD CONSTRAINT "ScheduleRule_academicAssignmentId_fkey" FOREIGN KEY ("academicAssignmentId") REFERENCES "AcademicAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_schoolCycleId_fkey" FOREIGN KEY ("schoolCycleId") REFERENCES "SchoolCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AcademicCalendarEvent" ADD CONSTRAINT "AcademicCalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
