import { z } from "zod";
import {
  normalizeOptionalCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().max(500).transform(normalizeOptionalText).optional();
const optionalCode = z.string().trim().transform(normalizeOptionalCatalogCode).optional();

export const academicPeriodSchema = z.object({
  code: optionalCode,
  name: requiredText("Captura el nombre del periodo academico"),
  description: optionalText,
  schoolCycleId: requiredText("Selecciona un ciclo escolar"),
  startDate: requiredText("Captura la fecha inicial"),
  endDate: requiredText("Captura la fecha final"),
  displayOrder: z.coerce
    .number()
    .int("El orden debe ser un numero entero")
    .min(1, "El orden debe ser mayor a cero"),
  isActive: z.coerce.boolean().optional()
});

export type AcademicPeriodInput = z.infer<typeof academicPeriodSchema>;
