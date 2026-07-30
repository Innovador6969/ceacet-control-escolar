import { AcademicEventStatus, EnrollmentStatus, Prisma, ReEnrollmentStatus } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";
import { schoolCycleSchema, type SchoolCycleInput } from "@/lib/validations/school-cycle";

export const schoolCycleLabelSelect = {
  id: true,
  name: true,
  code: true,
  startDate: true,
  endDate: true,
  isActive: true,
  isCurrent: true
} satisfies Prisma.SchoolCycleSelect;

const schoolCycleCounts = {
  periods: true,
  enrollments: true,
  reEnrollments: true,
  academicEvents: true
} satisfies Prisma.SchoolCycleCountOutputTypeSelect;

const schoolCycleDetailInclude = {
  createdBy: { select: { name: true, email: true } },
  updatedBy: { select: { name: true, email: true } },
  _count: { select: schoolCycleCounts }
} satisfies Prisma.SchoolCycleInclude;

const editableFields = [
  "code",
  "name",
  "description",
  "startDate",
  "endDate",
  "isActive",
  "isCurrent"
] as const;

type SchoolCycleSnapshot = {
  code?: string | null;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCurrent: boolean;
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function snapshot(cycle: SchoolCycleSnapshot) {
  return {
    code: cycle.code ?? null,
    name: cycle.name,
    description: cycle.description ?? null,
    startDate: cycle.startDate.toISOString(),
    endDate: cycle.endDate.toISOString(),
    isActive: cycle.isActive,
    isCurrent: cycle.isCurrent
  };
}

function changedFields(previousData: SchoolCycleSnapshot, newData: SchoolCycleSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveSchoolCycles = cache(async () => {
  return prisma.schoolCycle.findMany({
    where: { isActive: true },
    select: schoolCycleLabelSelect,
    orderBy: [{ startDate: "desc" }, { name: "asc" }]
  });
});

export const getCurrentSchoolCycle = cache(async () => {
  return prisma.schoolCycle.findFirst({
    where: { isCurrent: true, isActive: true },
    select: schoolCycleLabelSelect,
    orderBy: { startDate: "desc" }
  });
});

export async function getSchoolCycles() {
  return prisma.schoolCycle.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      isActive: true,
      isCurrent: true,
      updatedAt: true,
      updatedBy: { select: { name: true } },
      _count: { select: schoolCycleCounts }
    },
    orderBy: [{ startDate: "desc" }, { name: "asc" }]
  });
}

export async function getSchoolCycleById(id: string) {
  const cycle = await prisma.schoolCycle.findUnique({
    where: { id },
    include: {
      ...schoolCycleDetailInclude,
      periods: {
        select: {
          id: true,
          code: true,
          name: true,
          displayOrder: true,
          startDate: true,
          endDate: true,
          isActive: true
        },
        orderBy: [{ displayOrder: "asc" }, { startDate: "asc" }]
      }
    }
  });

  if (!cycle) return null;

  const dependencies = await getSchoolCycleDependencies(id);
  return { ...cycle, dependencies };
}

export async function getSchoolCycleDependencies(id: string) {
  return dependencyCounts(prisma, id);
}

async function dependencyCounts(tx: Prisma.TransactionClient | typeof prisma, id: string) {
  const [
    activePeriods,
    activeEnrollments,
    activeReEnrollments,
    scheduledEvents,
    activeAssignments
  ] = await Promise.all([
    tx.academicPeriod.count({ where: { schoolCycleId: id, isActive: true } }),
    tx.enrollment.count({ where: { schoolCycleId: id, status: EnrollmentStatus.ACTIVE } }),
    tx.reEnrollment.count({
      where: {
        schoolCycleId: id,
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
    tx.academicCalendarEvent.count({
      where: { schoolCycleId: id, status: AcademicEventStatus.SCHEDULED }
    }),
    tx.academicAssignment.count({
      where: { active: true, academicPeriod: { schoolCycleId: id } }
    })
  ]);

  return {
    activePeriods,
    activeEnrollments,
    activeReEnrollments,
    scheduledEvents,
    activeAssignments
  };
}

function assertDateRange(startDate: Date, endDate: Date) {
  if (endDate <= startDate) {
    throw new Error("La fecha final debe ser posterior a la fecha inicial.");
  }
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { name: string; code?: string | null },
  excludeId?: string
) {
  const activeCycles = await tx.schoolCycle.findMany({
    where: { id: excludeId ? { not: excludeId } : undefined, isActive: true },
    select: { id: true, name: true }
  });
  const normalizedName = normalizeCatalogName(data.name);

  if (activeCycles.some((cycle) => normalizeCatalogName(cycle.name) === normalizedName)) {
    throw new Error("Ya existe un ciclo escolar activo con el mismo nombre.");
  }

  if (!data.code) return;

  const duplicateCode = await tx.schoolCycle.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      isActive: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe un ciclo escolar activo con el mismo codigo.");
  }
}

async function assertPeriodsInsideCycle(
  tx: Prisma.TransactionClient,
  cycleId: string,
  startDate: Date,
  endDate: Date
) {
  const outsidePeriod = await tx.academicPeriod.findFirst({
    where: {
      schoolCycleId: cycleId,
      OR: [{ startDate: { lt: startDate } }, { endDate: { gt: endDate } }]
    },
    select: { id: true }
  });

  if (outsidePeriod) {
    throw new Error("No se pueden cambiar las fechas porque existen periodos fuera del nuevo rango.");
  }
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    cycleId: string;
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
      entity: "SchoolCycle",
      entityId: params.cycleId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-school-cycles",
        route: params.route ?? "/configuracion-academica/ciclos-escolares",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createSchoolCycle(input: SchoolCycleInput, userId: string) {
  const data = schoolCycleSchema.parse(input);
  const startDate = parseDate(data.startDate);
  const endDate = parseDate(data.endDate);
  assertDateRange(startDate, endDate);

  return prisma.$transaction(async (tx) => {
    await assertNoActiveDuplicate(tx, data);

    if (data.isCurrent) {
      await tx.schoolCycle.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
    }

    const cycle = await tx.schoolCycle.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        startDate,
        endDate,
        isActive: data.isActive ?? true,
        isCurrent: data.isCurrent ?? false,
        createdById: userId,
        updatedById: userId
      },
      include: schoolCycleDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      cycleId: cycle.id,
      action: "SCHOOL_CYCLE_CREATED",
      newData: snapshot(cycle),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return cycle;
  });
}

export async function updateSchoolCycle(id: string, input: SchoolCycleInput, userId: string) {
  const data = schoolCycleSchema.parse(input);
  const startDate = parseDate(data.startDate);
  const endDate = parseDate(data.endDate);
  assertDateRange(startDate, endDate);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.schoolCycle.findUnique({
      where: { id },
      include: schoolCycleDetailInclude
    });

    if (!existing) throw new Error("Ciclo escolar no encontrado.");

    await assertPeriodsInsideCycle(tx, id, startDate, endDate);
    await assertNoActiveDuplicate(tx, data, id);

    if (data.isCurrent) {
      await tx.schoolCycle.updateMany({
        where: { id: { not: id }, isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const updated = await tx.schoolCycle.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        startDate,
        endDate,
        isActive: data.isActive ?? existing.isActive,
        isCurrent: data.isCurrent ?? existing.isCurrent,
        updatedById: userId
      },
      include: schoolCycleDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      cycleId: updated.id,
      action: "SCHOOL_CYCLE_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: changedFields(existing, updated),
      operation: "update",
      route: `/configuracion-academica/ciclos-escolares/${id}`
    });

    return updated;
  });
}

export async function activateSchoolCycle(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.schoolCycle.findUnique({ where: { id }, include: schoolCycleDetailInclude });
    if (!existing) throw new Error("Ciclo escolar no encontrado.");

    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.schoolCycle.update({
      where: { id },
      data: { isActive: true, updatedById: userId },
      include: schoolCycleDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      cycleId: updated.id,
      action: "SCHOOL_CYCLE_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["isActive"],
      operation: "activate",
      route: `/configuracion-academica/ciclos-escolares/${id}`
    });

    return updated;
  });
}

export async function deactivateSchoolCycle(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.schoolCycle.findUnique({ where: { id }, include: schoolCycleDetailInclude });
    if (!existing) throw new Error("Ciclo escolar no encontrado.");

    const dependencies = await dependencyCounts(tx, id);
    if (
      dependencies.activePeriods > 0 ||
      dependencies.activeEnrollments > 0 ||
      dependencies.activeReEnrollments > 0 ||
      dependencies.scheduledEvents > 0 ||
      dependencies.activeAssignments > 0
    ) {
      throw new Error("No se puede desactivar el ciclo escolar porque tiene operaciones activas relacionadas.");
    }

    const updated = await tx.schoolCycle.update({
      where: { id },
      data: { isActive: false, isCurrent: false, updatedById: userId },
      include: schoolCycleDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      cycleId: updated.id,
      action: "SCHOOL_CYCLE_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["isActive", "isCurrent"],
      operation: "deactivate",
      route: `/configuracion-academica/ciclos-escolares/${id}`
    });

    return { schoolCycle: updated, dependencies };
  });
}

export async function setCurrentSchoolCycle(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.schoolCycle.findUnique({ where: { id }, include: schoolCycleDetailInclude });
    if (!existing) throw new Error("Ciclo escolar no encontrado.");
    if (!existing.isActive) throw new Error("No se puede marcar como actual un ciclo inactivo.");

    await tx.schoolCycle.updateMany({ where: { id: { not: id }, isCurrent: true }, data: { isCurrent: false } });
    const updated = await tx.schoolCycle.update({
      where: { id },
      data: { isCurrent: true, updatedById: userId },
      include: schoolCycleDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      cycleId: updated.id,
      action: "SCHOOL_CYCLE_SET_CURRENT",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["isCurrent"],
      operation: "set-current",
      route: `/configuracion-academica/ciclos-escolares/${id}`
    });

    return updated;
  });
}
