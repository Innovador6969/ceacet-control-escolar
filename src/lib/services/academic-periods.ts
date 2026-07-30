import { AcademicEventStatus, EnrollmentStatus, Prisma, ReEnrollmentStatus } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";
import {
  academicPeriodSchema,
  type AcademicPeriodInput
} from "@/lib/validations/academic-period";
import { getActiveSchoolCycles, schoolCycleLabelSelect } from "@/lib/services/school-cycles";

export const academicPeriodLabelSelect = {
  id: true,
  schoolCycleId: true,
  name: true,
  code: true,
  displayOrder: true,
  startDate: true,
  endDate: true,
  isActive: true,
  schoolCycle: { select: schoolCycleLabelSelect }
} satisfies Prisma.AcademicPeriodSelect;

const academicPeriodCounts = {
  enrollments: true,
  reEnrollments: true,
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.AcademicPeriodCountOutputTypeSelect;

const academicPeriodDetailInclude = {
  schoolCycle: { select: schoolCycleLabelSelect },
  createdBy: { select: { name: true, email: true } },
  updatedBy: { select: { name: true, email: true } },
  _count: { select: academicPeriodCounts }
} satisfies Prisma.AcademicPeriodInclude;

const editableFields = [
  "code",
  "name",
  "description",
  "schoolCycleId",
  "displayOrder",
  "startDate",
  "endDate",
  "isActive"
] as const;

type AcademicPeriodSnapshot = {
  code?: string | null;
  name: string;
  description?: string | null;
  schoolCycleId: string;
  displayOrder: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function snapshot(period: AcademicPeriodSnapshot) {
  return {
    code: period.code ?? null,
    name: period.name,
    description: period.description ?? null,
    schoolCycleId: period.schoolCycleId,
    displayOrder: period.displayOrder,
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    isActive: period.isActive
  };
}

function changedFields(previousData: AcademicPeriodSnapshot, newData: AcademicPeriodSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveAcademicPeriods = cache(async () => {
  return prisma.academicPeriod.findMany({
    where: { isActive: true, schoolCycle: { isActive: true } },
    select: academicPeriodLabelSelect,
    orderBy: [
      { schoolCycle: { startDate: "desc" } },
      { displayOrder: "asc" },
      { startDate: "asc" }
    ]
  });
});

export async function getAcademicPeriodsByCycle(schoolCycleId: string) {
  return prisma.academicPeriod.findMany({
    where: { schoolCycleId, isActive: true },
    select: academicPeriodLabelSelect,
    orderBy: [{ displayOrder: "asc" }, { startDate: "asc" }]
  });
}

export async function getAcademicPeriods() {
  return prisma.academicPeriod.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      schoolCycleId: true,
      displayOrder: true,
      startDate: true,
      endDate: true,
      isActive: true,
      schoolCycle: { select: { id: true, name: true } },
      updatedAt: true,
      updatedBy: { select: { name: true } },
      _count: { select: academicPeriodCounts }
    },
    orderBy: [
      { schoolCycle: { startDate: "desc" } },
      { displayOrder: "asc" },
      { startDate: "asc" }
    ]
  });
}

export async function getAcademicPeriodById(id: string) {
  const period = await prisma.academicPeriod.findUnique({
    where: { id },
    include: academicPeriodDetailInclude
  });

  if (!period) return null;

  const dependencies = await getAcademicPeriodDependencies(id);
  return { ...period, dependencies };
}

export async function getAcademicPeriodFormCatalogs(currentSchoolCycleId?: string) {
  const activeCycles = await getActiveSchoolCycles();
  const hasCurrent =
    currentSchoolCycleId && activeCycles.some((cycle) => cycle.id === currentSchoolCycleId);
  const currentCycle =
    currentSchoolCycleId && !hasCurrent
      ? await prisma.schoolCycle.findUnique({
          where: { id: currentSchoolCycleId },
          select: schoolCycleLabelSelect
        })
      : null;

  return { schoolCycles: currentCycle ? [...activeCycles, currentCycle] : activeCycles };
}

export async function getAcademicPeriodDependencies(id: string) {
  const [activeEnrollments, activeReEnrollments, activeAssignments, scheduledEvents] =
    await Promise.all([
      prisma.enrollment.count({ where: { academicPeriodId: id, status: EnrollmentStatus.ACTIVE } }),
      prisma.reEnrollment.count({
        where: {
          academicPeriodId: id,
          status: {
            in: [
              ReEnrollmentStatus.DRAFT,
              ReEnrollmentStatus.PENDING,
              ReEnrollmentStatus.PARTIAL,
              ReEnrollmentStatus.OVERDUE
            ]
          }
        }
      }),
      prisma.academicAssignment.count({ where: { academicPeriodId: id, active: true } }),
      prisma.academicCalendarEvent.count({
        where: { academicPeriodId: id, status: AcademicEventStatus.SCHEDULED }
      })
    ]);

  return { activeEnrollments, activeReEnrollments, activeAssignments, scheduledEvents };
}

function assertDateRange(startDate: Date, endDate: Date) {
  if (endDate <= startDate) {
    throw new Error("La fecha final debe ser posterior a la fecha inicial.");
  }
}

async function validateCycleAndDates(
  tx: Prisma.TransactionClient,
  schoolCycleId: string,
  startDate: Date,
  endDate: Date
) {
  const cycle = await tx.schoolCycle.findUniqueOrThrow({
    where: { id: schoolCycleId },
    select: { id: true, isActive: true, startDate: true, endDate: true }
  });

  if (!cycle.isActive) {
    throw new Error("El ciclo escolar seleccionado esta inactivo.");
  }

  if (startDate < cycle.startDate || endDate > cycle.endDate) {
    throw new Error("El periodo debe estar contenido dentro del ciclo escolar.");
  }
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { schoolCycleId: string; name: string; code?: string | null; displayOrder: number },
  excludeId?: string
) {
  const activePeriods = await tx.academicPeriod.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      schoolCycleId: data.schoolCycleId,
      isActive: true
    },
    select: { id: true, name: true, displayOrder: true }
  });
  const normalizedName = normalizeCatalogName(data.name);

  if (activePeriods.some((period) => normalizeCatalogName(period.name) === normalizedName)) {
    throw new Error("Ya existe un periodo activo con el mismo nombre dentro del ciclo.");
  }

  if (activePeriods.some((period) => period.displayOrder === data.displayOrder)) {
    throw new Error("Ya existe un periodo activo con el mismo orden dentro del ciclo.");
  }

  if (!data.code) return;

  const duplicateCode = await tx.academicPeriod.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      schoolCycleId: data.schoolCycleId,
      isActive: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe un periodo activo con el mismo codigo dentro del ciclo.");
  }
}

async function dependencyCounts(tx: Prisma.TransactionClient, academicPeriodId: string) {
  const [activeEnrollments, activeReEnrollments, activeAssignments, scheduledEvents] =
    await Promise.all([
      tx.enrollment.count({ where: { academicPeriodId, status: EnrollmentStatus.ACTIVE } }),
      tx.reEnrollment.count({
        where: {
          academicPeriodId,
          status: {
            in: [
              ReEnrollmentStatus.DRAFT,
              ReEnrollmentStatus.PENDING,
              ReEnrollmentStatus.PARTIAL,
              ReEnrollmentStatus.OVERDUE
            ]
          }
        }
      }),
      tx.academicAssignment.count({ where: { academicPeriodId, active: true } }),
      tx.academicCalendarEvent.count({
        where: { academicPeriodId, status: AcademicEventStatus.SCHEDULED }
      })
    ]);

  return { activeEnrollments, activeReEnrollments, activeAssignments, scheduledEvents };
}

function hasDependencies(counts: Awaited<ReturnType<typeof dependencyCounts>>) {
  return Object.values(counts).some((count) => count > 0);
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    periodId: string;
    action: string;
    previousData?: Prisma.InputJsonValue;
    newData?: Prisma.InputJsonValue;
    changedFields?: string[];
    route?: string;
    operation: string;
  }
) {
  await tx.auditLog.create({
    data: {
      userId: params.userId,
      entity: "AcademicPeriod",
      entityId: params.periodId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-academic-periods",
        route: params.route ?? "/configuracion-academica/periodos-academicos",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createAcademicPeriod(input: AcademicPeriodInput, userId: string) {
  const data = academicPeriodSchema.parse(input);
  const startDate = parseDate(data.startDate);
  const endDate = parseDate(data.endDate);
  assertDateRange(startDate, endDate);

  return prisma.$transaction(async (tx) => {
    await validateCycleAndDates(tx, data.schoolCycleId, startDate, endDate);
    await assertNoActiveDuplicate(tx, data);

    const period = await tx.academicPeriod.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        schoolCycleId: data.schoolCycleId,
        displayOrder: data.displayOrder,
        startDate,
        endDate,
        isActive: data.isActive ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: academicPeriodDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      periodId: period.id,
      action: "ACADEMIC_PERIOD_CREATED",
      newData: snapshot(period),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return period;
  });
}

export async function updateAcademicPeriod(id: string, input: AcademicPeriodInput, userId: string) {
  const data = academicPeriodSchema.parse(input);
  const startDate = parseDate(data.startDate);
  const endDate = parseDate(data.endDate);
  assertDateRange(startDate, endDate);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicPeriod.findUnique({
      where: { id },
      include: academicPeriodDetailInclude
    });
    if (!existing) throw new Error("Periodo academico no encontrado.");

    if (existing.schoolCycleId !== data.schoolCycleId) {
      const counts = await dependencyCounts(tx, id);
      if (hasDependencies(counts)) {
        throw new Error("No se puede cambiar el ciclo escolar porque el periodo tiene operaciones activas relacionadas.");
      }
    }

    await validateCycleAndDates(tx, data.schoolCycleId, startDate, endDate);
    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.academicPeriod.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        schoolCycleId: data.schoolCycleId,
        displayOrder: data.displayOrder,
        startDate,
        endDate,
        isActive: data.isActive ?? existing.isActive,
        updatedById: userId
      },
      include: academicPeriodDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      periodId: updated.id,
      action: "ACADEMIC_PERIOD_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: changedFields(existing, updated),
      operation: "update",
      route: `/configuracion-academica/periodos-academicos/${id}`
    });

    return updated;
  });
}

export async function activateAcademicPeriod(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicPeriod.findUnique({
      where: { id },
      include: academicPeriodDetailInclude
    });
    if (!existing) throw new Error("Periodo academico no encontrado.");

    await validateCycleAndDates(tx, existing.schoolCycleId, existing.startDate, existing.endDate);
    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.academicPeriod.update({
      where: { id },
      data: { isActive: true, updatedById: userId },
      include: academicPeriodDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      periodId: updated.id,
      action: "ACADEMIC_PERIOD_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["isActive"],
      operation: "activate",
      route: `/configuracion-academica/periodos-academicos/${id}`
    });

    return updated;
  });
}

export async function deactivateAcademicPeriod(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicPeriod.findUnique({
      where: { id },
      include: academicPeriodDetailInclude
    });
    if (!existing) throw new Error("Periodo academico no encontrado.");

    const counts = await dependencyCounts(tx, id);
    if (hasDependencies(counts)) {
      throw new Error("No se puede desactivar el periodo porque tiene operaciones activas relacionadas.");
    }

    const updated = await tx.academicPeriod.update({
      where: { id },
      data: { isActive: false, updatedById: userId },
      include: academicPeriodDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      periodId: updated.id,
      action: "ACADEMIC_PERIOD_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["isActive"],
      operation: "deactivate",
      route: `/configuracion-academica/periodos-academicos/${id}`
    });

    return { academicPeriod: updated, dependencies: counts };
  });
}
