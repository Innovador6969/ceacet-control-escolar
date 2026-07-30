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

export const modalitySchema = z.object({
  code: optionalUpperText,
  name: z.string().trim().min(1, "Captura el nombre de la modalidad"),
  description: optionalText,
  academicLevelId: z.string().trim().min(1, "Selecciona un nivel academico"),
  active: z.coerce.boolean().optional()
});

export type ModalityInput = z.infer<typeof modalitySchema>;
