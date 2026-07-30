import { z } from "zod";
import {
  normalizeOptionalCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const requiredText = (message: string) => z.string().trim().min(1, message).max(160);
const optionalText = z.string().trim().max(500).transform(normalizeOptionalText).optional();
const optionalCode = z.string().trim().max(40).transform(normalizeOptionalCatalogCode).optional();
const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().email("Captura un correo valido").optional())
  .optional();

export const teacherSchema = z.object({
  code: optionalCode,
  name: requiredText("Captura el nombre del docente"),
  email: optionalEmail,
  phone: optionalText,
  specialty: optionalText,
  description: optionalText,
  active: z.coerce.boolean().optional()
});

export type TeacherInput = z.infer<typeof teacherSchema>;
