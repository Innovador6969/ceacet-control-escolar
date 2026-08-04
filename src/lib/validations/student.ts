import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const requiredText = (message: string) =>
  z.string().trim().min(1, { message });

const optionalNumber = z.coerce
  .number({ invalid_type_error: "Captura un numero valido" })
  .min(0, "No puede ser negativo")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const studentRegistrationSchema = z.object({
  paternalLastName: requiredText("El apellido paterno es obligatorio"),
  maternalLastName: optionalText,
  firstName: requiredText("El nombre es obligatorio"),
  birthDate: optionalText,
  curp: optionalText.refine(
    (value) =>
      !value ||
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i.test(value.toUpperCase()),
    "Captura una CURP valida"
  ),
  sex: optionalText,
  maritalStatus: optionalText,
  occupation: optionalText,
  phone: optionalText.refine(
    (value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value),
    "Captura un telefono valido"
  ),
  email: optionalText.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Captura un correo valido"
  ),
  street: optionalText,
  neighborhood: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText.refine(
    (value) => !value || /^\d{5}$/.test(value),
    "El codigo postal debe tener 5 digitos"
  ),
  academicLevelId: requiredText("El nivel es obligatorio"),
  modalityId: requiredText("La modalidad es obligatoria"),
  groupId: optionalText,
  schoolCycleId: optionalText,
  academicPeriodId: optionalText,
  grade: optionalText,
  fourMonthPeriod: optionalNumber,
  enrollmentDate: requiredText("La fecha de inscripcion es obligatoria"),
  startDate: optionalText,
  registrationFee: optionalNumber,
  weeklyFee: optionalNumber,
  lateFeePercentage: optionalNumber,
  paymentDay: optionalNumber,
  observations: optionalText,
  guardianFullName: optionalText,
  guardianRelationship: optionalText,
  guardianPrimaryPhone: optionalText.refine(
    (value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value),
    "Captura un telefono valido"
  ),
  guardianAlternatePhone: optionalText.refine(
    (value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value),
    "Captura un telefono valido"
  ),
  guardianEmail: optionalText.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Captura un correo valido"
  ),
  guardianObservations: optionalText,
  previousAcademicLevelId: optionalText,
  previousSchool: optionalText,
  lastGrade: optionalText,
  previousSchoolCycle: optionalText,
  academicBackgroundObservations: optionalText,
  documents: z
    .array(
      z.object({
        id: optionalText,
        documentTypeId: requiredText("Selecciona el tipo de documento"),
        academicLevelId: optionalText,
        grade: optionalText,
        status: z
          .enum(["PENDING", "RECEIVED", "REVIEW", "REJECTED"])
          .default("PENDING"),
        receivedAt: optionalText,
        physicalLocation: optionalText,
        fileUrl: optionalText,
        observations: optionalText
      })
    )
    .default([])
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;

export const studentUpdateSchema = studentRegistrationSchema.extend({
  enrollmentNumber: optionalText
});

export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
