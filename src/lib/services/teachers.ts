import { AcademicEventStatus, Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";
import { teacherSchema, type TeacherInput } from "@/lib/validations/teacher";

export const teacherLabelSelect = {
  id: true,
  code: true,
  name: true,
  email: true,
  phone: true,
  specialty: true,
  active: true
} satisfies Prisma.TeacherSelect;

const teacherCounts = {
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.TeacherCountOutputTypeSelect;

const teacherDetailInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: teacherCounts }
} satisfies Prisma.TeacherInclude;

const editableFields = ["code", "name", "email", "phone", "specialty", "description", "active"] as const;

type TeacherSnapshot = {
  code?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  specialty?: string | null;
  description?: string | null;
  active: boolean;
};

function snapshot(teacher: TeacherSnapshot) {
  return {
    code: teacher.code ?? null,
    name: teacher.name,
    email: teacher.email ?? null,
    phone: teacher.phone ?? null,
    specialty: teacher.specialty ?? null,
    description: teacher.description ?? null,
    active: teacher.active
  };
}

function changedFields(previousData: TeacherSnapshot, newData: TeacherSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveTeachers = cache(async () => {
  return prisma.teacher.findMany({
    where: { active: true },
    select: teacherLabelSelect,
    orderBy: { name: "asc" }
  });
});

export async function getTeachers() {
  return prisma.teacher.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      phone: true,
      specialty: true,
      description: true,
      active: true,
      updatedAt: true,
      updatedBy: { select: { name: true } },
      _count: { select: teacherCounts }
    },
    orderBy: { name: "asc" }
  });
}

export async function getTeacherById(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: teacherDetailInclude
  });

  if (!teacher) return null;

  const dependencies = await getTeacherDependencies(id);
  return { ...teacher, dependencies };
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { code?: string | null; name: string; email?: string | null },
  excludeId?: string
) {
  if (data.code) {
    const duplicateCode = await tx.teacher.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        active: true,
        code: data.code
      },
      select: { id: true }
    });

    if (duplicateCode) {
      throw new Error("Ya existe un docente activo con el mismo codigo.");
    }
  }

  if (data.email) {
    const duplicateEmail = await tx.teacher.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        active: true,
        email: data.email
      },
      select: { id: true }
    });

    if (duplicateEmail) {
      throw new Error("Ya existe un docente activo con el mismo correo.");
    }
  }

  if (!data.code && !data.email) {
    const activeTeachers = await tx.teacher.findMany({
      where: { id: excludeId ? { not: excludeId } : undefined, active: true },
      select: { id: true, name: true }
    });
    const normalizedName = normalizeCatalogName(data.name);

    if (activeTeachers.some((teacher) => normalizeCatalogName(teacher.name) === normalizedName)) {
      throw new Error("Ya existe un docente activo con el mismo nombre.");
    }
  }
}

async function teacherDependencyCounts(tx: Prisma.TransactionClient | typeof prisma, id: string) {
  const [academicAssignments, activeAssignments, scheduledEvents] = await Promise.all([
    tx.academicAssignment.count({ where: { teacherId: id } }),
    tx.academicAssignment.count({ where: { teacherId: id, active: true } }),
    tx.academicCalendarEvent.count({
      where: { teacherId: id, status: AcademicEventStatus.SCHEDULED }
    })
  ]);

  return { academicAssignments, activeAssignments, scheduledEvents };
}

export async function getTeacherDependencies(id: string) {
  return teacherDependencyCounts(prisma, id);
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    teacherId: string;
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
      entity: "Teacher",
      entityId: params.teacherId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-teachers",
        route: params.route ?? "/configuracion-academica/docentes",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createTeacher(input: TeacherInput, userId: string) {
  const data = teacherSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await assertNoActiveDuplicate(tx, data);

    const teacher = await tx.teacher.create({
      data: {
        code: data.code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        description: data.description,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: teacherDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      teacherId: teacher.id,
      action: "TEACHER_CREATED",
      newData: snapshot(teacher),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return teacher;
  });
}

export async function updateTeacher(id: string, input: TeacherInput, userId: string) {
  const data = teacherSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.teacher.findUnique({ where: { id }, include: teacherDetailInclude });
    if (!existing) throw new Error("Docente no encontrado.");

    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.teacher.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        description: data.description,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: teacherDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      teacherId: updated.id,
      action: "TEACHER_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: changedFields(existing, updated),
      operation: "update",
      route: `/configuracion-academica/docentes/${id}`
    });

    return updated;
  });
}

export async function activateTeacher(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.teacher.findUnique({ where: { id }, include: teacherDetailInclude });
    if (!existing) throw new Error("Docente no encontrado.");

    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.teacher.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: teacherDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      teacherId: updated.id,
      action: "TEACHER_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/docentes/${id}`
    });

    return updated;
  });
}

export async function deactivateTeacher(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.teacher.findUnique({ where: { id }, include: teacherDetailInclude });
    if (!existing) throw new Error("Docente no encontrado.");

    const activeAssignments = await tx.academicAssignment.count({
      where: { teacherId: id, active: true }
    });
    if (activeAssignments > 0) {
      throw new Error(
        `No se puede desactivar el docente porque tiene ${activeAssignments} asignacion(es) activa(s).`
      );
    }

    const updated = await tx.teacher.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: teacherDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      teacherId: updated.id,
      action: "TEACHER_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/docentes/${id}`
    });

    return { teacher: updated, dependencies: await teacherDependencyCounts(tx, id) };
  });
}
