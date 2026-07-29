import { AcademicEventType, Weekday } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const requiredText = (message: string) =>
  z.string().trim().min(1, { message });

export const schoolCycleSchema = z.object({
  name: requiredText("Captura el nombre del ciclo"),
  startDate: requiredText("Captura la fecha inicial"),
  endDate: requiredText("Captura la fecha final"),
  isActive: z.boolean().optional()
});

export const academicPeriodSchema = z.object({
  schoolCycleId: requiredText("Selecciona un ciclo escolar"),
  name: requiredText("Captura el nombre del periodo"),
  startDate: requiredText("Captura la fecha inicial"),
  endDate: requiredText("Captura la fecha final"),
  isActive: z.boolean().optional()
});

export const calendarEventSchema = z.object({
  title: requiredText("Captura el titulo"),
  description: optionalText,
  type: z.nativeEnum(AcademicEventType),
  startsAt: requiredText("Captura fecha y hora inicial"),
  endsAt: requiredText("Captura fecha y hora final"),
  allDay: z.boolean().optional(),
  schoolCycleId: optionalText,
  academicPeriodId: optionalText,
  academicLevelId: optionalText,
  modalityId: optionalText,
  groupId: optionalText,
  subjectId: optionalText,
  teacherId: optionalText,
  classroomId: optionalText,
  reminderAt: optionalText
});

export const academicAssignmentSchema = z.object({
  subjectId: requiredText("Selecciona una materia"),
  groupId: requiredText("Selecciona un grupo"),
  teacherId: requiredText("Selecciona un docente"),
  classroomId: optionalText,
  academicPeriodId: requiredText("Selecciona un periodo"),
  academicLevelId: requiredText("Selecciona un nivel"),
  modalityId: requiredText("Selecciona un programa"),
  rules: z
    .array(
      z.object({
        weekday: z.nativeEnum(Weekday),
        startTime: requiredText("Captura hora inicial"),
        endTime: requiredText("Captura hora final"),
        startDate: requiredText("Captura fecha inicial"),
        endDate: requiredText("Captura fecha final")
      })
    )
    .min(1, "Agrega al menos una regla de horario")
});

export type AcademicPeriodInput = z.infer<typeof academicPeriodSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type AcademicAssignmentInput = z.infer<typeof academicAssignmentSchema>;
