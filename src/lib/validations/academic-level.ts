import { z } from "zod";
import {
  normalizeOptionalCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const optionalText = z
  .string()
  .trim()
  .transform(normalizeOptionalText)
  .optional();

const optionalUpperText = z
  .string()
  .trim()
  .transform(normalizeOptionalCatalogCode)
  .optional();

export const academicLevelSchema = z.object({
  code: optionalUpperText,
  name: z.string().trim().min(1, "Captura el nombre del nivel academico"),
  description: optionalText,
  displayOrder: z.coerce
    .number()
    .int("El orden debe ser un numero entero")
    .min(0, "El orden no puede ser negativo")
    .default(0),
  active: z.coerce.boolean().optional()
});

export type AcademicLevelInput = z.infer<typeof academicLevelSchema>;
