import { z } from "zod";
import {
  normalizeOptionalCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = z.string().trim().max(500).transform(normalizeOptionalText).optional();
const optionalCode = z.string().trim().transform(normalizeOptionalCatalogCode).optional();

export const schoolCycleSchema = z.object({
  code: optionalCode,
  name: requiredText("Captura el nombre del ciclo escolar"),
  description: optionalText,
  startDate: requiredText("Captura la fecha inicial"),
  endDate: requiredText("Captura la fecha final"),
  isActive: z.coerce.boolean().optional(),
  isCurrent: z.coerce.boolean().optional()
});

export type SchoolCycleInput = z.infer<typeof schoolCycleSchema>;
