import { z } from "zod";
import {
  normalizeOptionalCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const requiredText = (message: string) => z.string().trim().min(1, message).max(160);
const optionalText = z.string().trim().max(500).transform(normalizeOptionalText).optional();
const optionalCode = z.string().trim().max(40).transform(normalizeOptionalCatalogCode).optional();

export const classroomSchema = z.object({
  code: optionalCode,
  name: requiredText("Captura el nombre del aula"),
  location: optionalText,
  capacity: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int("La capacidad debe ser un numero entero").positive("La capacidad debe ser mayor a cero").optional()
  ),
  description: optionalText,
  active: z.coerce.boolean().optional()
});

export type ClassroomInput = z.infer<typeof classroomSchema>;
