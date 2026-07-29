import { PaymentMethod, ReEnrollmentStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const requiredText = (message: string) =>
  z.string().trim().min(1, { message });

const money = z.coerce
  .number({ invalid_type_error: "Captura un importe valido" })
  .min(0, "El importe no puede ser negativo");

export const reEnrollmentCreateSchema = z.object({
  studentId: requiredText("Selecciona un alumno"),
  schoolCycleId: requiredText("Selecciona un ciclo escolar"),
  academicPeriodId: optionalText,
  academicLevelId: requiredText("Selecciona un nivel"),
  modalityId: requiredText("Selecciona un programa"),
  groupId: optionalText,
  grade: optionalText,
  fourMonthPeriod: z.coerce.number().min(1).max(12).optional().or(z.literal("").transform(() => undefined)),
  amount: money.min(1, "El cargo debe ser mayor a cero"),
  dueDate: requiredText("Captura la fecha limite"),
  lateFeePercentage: money,
  status: z.nativeEnum(ReEnrollmentStatus).optional()
});

export const reEnrollmentPaymentSchema = z.object({
  reEnrollmentId: requiredText("Selecciona una reinscripcion"),
  amount: money.min(1, "El pago debe ser mayor a cero"),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  reference: optionalText,
  paidAt: optionalText
});

export type ReEnrollmentCreateInput = z.infer<typeof reEnrollmentCreateSchema>;
export type ReEnrollmentPaymentInput = z.infer<typeof reEnrollmentPaymentSchema>;
