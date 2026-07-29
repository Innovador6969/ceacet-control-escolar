import { AcademicEventType, Prisma, Weekday } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatGroupLabel } from "@/lib/labels";
import { getActiveGroups, groupLabelSelect } from "@/lib/services/groups";
import {
  academicAssignmentSchema,
  academicPeriodSchema,
  calendarEventSchema,
  type AcademicAssignmentInput,
  type AcademicPeriodInput,
  type CalendarEventInput
} from "@/lib/validations/academic-calendar";

type TimeWindow = {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function parseDateTime(value: string) {
  return new Date(value);
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && endA > startB;
}

async function validatePeriodInsideCycle(
  tx: Prisma.TransactionClient,
  input: AcademicPeriodInput
) {
  const cycle = await tx.schoolCycle.findUniqueOrThrow({
    where: { id: input.schoolCycleId }
  });
  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);

  if (endDate < startDate) {
    throw new Error("La fecha final del periodo no puede ser anterior a la inicial.");
  }

  if (startDate < cycle.startDate || endDate > cycle.endDate) {
    throw new Error("El periodo debe estar contenido dentro del ciclo escolar.");
  }

  return { startDate, endDate };
}

export async function createAcademicPeriod(input: AcademicPeriodInput) {
  const data = academicPeriodSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const { startDate, endDate } = await validatePeriodInsideCycle(tx, data);

    return tx.academicPeriod.create({
      data: {
        schoolCycleId: data.schoolCycleId,
        name: data.name,
        startDate,
        endDate,
        isActive: data.isActive ?? true
      }
    });
  });
}

export async function getCalendarModuleData() {
  const [
    schoolCycles,
    academicPeriods,
    academicLevels,
    modalities,
    groups,
    subjects,
    teachers,
    classrooms,
    events,
    assignments
  ] = await Promise.all([
    prisma.schoolCycle.findMany({ orderBy: { startDate: "desc" } }),
    prisma.academicPeriod.findMany({ include: { schoolCycle: true }, orderBy: { startDate: "desc" } }),
    prisma.academicLevel.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.modality.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getActiveGroups(),
    prisma.subject.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.classroom.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.academicCalendarEvent.findMany({
      include: {
        schoolCycle: true,
        academicPeriod: { include: { schoolCycle: true } },
        group: { select: groupLabelSelect },
        subject: true,
        teacher: true,
        classroom: true
      },
      orderBy: { startsAt: "asc" },
      take: 100
    }),
    prisma.academicAssignment.findMany({
      include: {
        subject: true,
        group: { select: groupLabelSelect },
        teacher: true,
        classroom: true,
        academicPeriod: { include: { schoolCycle: true } },
        scheduleRules: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    schoolCycles,
    academicPeriods,
    academicLevels,
    modalities,
    groups,
    subjects,
    teachers,
    classrooms,
    events,
    assignments,
    occurrences: buildScheduleOccurrences(assignments)
  };
}

export function buildScheduleOccurrences(
  assignments: Array<{
    id: string;
    subject: { name: string };
    group: {
      id: string;
      name: string;
      academicLevel: { id: string; name: string };
      modality: { id: string; name: string };
    };
    teacher: { name: string };
    classroom: { name: string } | null;
    academicPeriod: { schoolCycle: { name: string } };
    scheduleRules: Array<{
      id: string;
      weekday: Weekday;
      startTime: string;
      endTime: string;
      startDate: Date;
      endDate: Date;
      active: boolean;
    }>;
  }>,
  daysAhead = 45
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until = new Date(today);
  until.setDate(until.getDate() + daysAhead);
  const weekdays = Object.values(Weekday);

  return assignments.flatMap((assignment) =>
    assignment.scheduleRules.flatMap((rule) => {
      if (!rule.active) return [];
      const start = rule.startDate > today ? new Date(rule.startDate) : new Date(today);
      const end = rule.endDate < until ? new Date(rule.endDate) : new Date(until);
      const occurrences = [];

      for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
        const weekday = weekdays[(cursor.getDay() + 6) % 7];
        if (weekday !== rule.weekday) continue;
        occurrences.push({
          id: `${rule.id}-${cursor.toISOString().slice(0, 10)}`,
          assignmentId: assignment.id,
          title: assignment.subject.name,
          groupId: assignment.group.id,
          group: formatGroupLabel(assignment.group),
          teacher: assignment.teacher.name,
          classroom: assignment.classroom?.name ?? "Sin aula",
          schoolCycle: assignment.academicPeriod.schoolCycle.name,
          type: AcademicEventType.CLASS_SESSION,
          date: cursor.toISOString().slice(0, 10),
          startTime: rule.startTime,
          endTime: rule.endTime
        });
      }

      return occurrences;
    })
  );
}

async function assertNoScheduleConflicts(
  tx: Prisma.TransactionClient,
  assignment: {
    groupId: string;
    teacherId: string;
    classroomId?: string;
    academicPeriodId: string;
  },
  rules: TimeWindow[]
) {
  for (const rule of rules) {
    if (rule.endTime <= rule.startTime) {
      throw new Error("La hora final debe ser posterior a la hora inicial.");
    }

    if (rule.endDate < rule.startDate) {
      throw new Error("La fecha final de la regla no puede ser anterior a la inicial.");
    }

    const existingRules = await tx.scheduleRule.findMany({
      where: {
        active: true,
        weekday: rule.weekday,
        startDate: { lt: rule.endDate },
        endDate: { gt: rule.startDate },
        academicAssignment: {
          academicPeriodId: assignment.academicPeriodId,
          OR: [
            { teacherId: assignment.teacherId },
            { groupId: assignment.groupId },
            ...(assignment.classroomId ? [{ classroomId: assignment.classroomId }] : [])
          ]
        }
      },
      include: { academicAssignment: true }
    });

    const conflict = existingRules.find(
      (existing) =>
        rangesOverlap(rule.startDate, rule.endDate, existing.startDate, existing.endDate) &&
        timesOverlap(rule.startTime, rule.endTime, existing.startTime, existing.endTime)
    );

    if (conflict) {
      const sameTeacher = conflict.academicAssignment.teacherId === assignment.teacherId;
      const sameGroup = conflict.academicAssignment.groupId === assignment.groupId;
      const sameClassroom =
        assignment.classroomId &&
        conflict.academicAssignment.classroomId === assignment.classroomId;
      const reason = sameTeacher
        ? "docente"
        : sameGroup
          ? "grupo"
          : sameClassroom
            ? "aula"
            : "horario";
      throw new Error(`Existe un conflicto de ${reason} en el horario seleccionado.`);
    }
  }
}

export async function createAcademicAssignment(input: AcademicAssignmentInput) {
  const data = academicAssignmentSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const period = await tx.academicPeriod.findUniqueOrThrow({
      where: { id: data.academicPeriodId },
      include: { schoolCycle: true }
    });
    const rules = data.rules.map((rule) => ({
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      startDate: parseDate(rule.startDate),
      endDate: parseDate(rule.endDate)
    }));

    for (const rule of rules) {
      if (rule.startDate < period.startDate || rule.endDate > period.endDate) {
        throw new Error("Las reglas de horario deben estar contenidas dentro del periodo academico.");
      }
    }

    await assertNoScheduleConflicts(tx, data, rules);

    return tx.academicAssignment.create({
      data: {
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        academicPeriodId: data.academicPeriodId,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        scheduleRules: {
          create: rules
        }
      },
      include: { scheduleRules: true }
    });
  });
}

export async function createCalendarEvent(
  input: CalendarEventInput,
  createdById?: string
) {
  const data = calendarEventSchema.parse(input);
  const startsAt = parseDateTime(data.startsAt);
  const endsAt = parseDateTime(data.endsAt);

  if (endsAt <= startsAt) {
    throw new Error("La fecha final del evento debe ser posterior a la inicial.");
  }

  return prisma.academicCalendarEvent.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      startsAt,
      endsAt,
      allDay: data.allDay ?? false,
      schoolCycleId: data.schoolCycleId,
      academicPeriodId: data.academicPeriodId,
      academicLevelId: data.academicLevelId,
      modalityId: data.modalityId,
      groupId: data.groupId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      reminderAt: data.reminderAt ? parseDateTime(data.reminderAt) : undefined,
      createdById
    }
  });
}
