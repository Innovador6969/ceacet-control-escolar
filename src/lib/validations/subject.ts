import { z } from "zod";
import {
  normalizeCatalogCode,
  normalizeOptionalText
} from "@/lib/validation/catalog-normalization";

const requiredText = (message: string) => z.string().trim().min(1, message).max(160);
const optionalText = z.string().trim().max(500).transform(normalizeOptionalText).optional();

export const subjectSchema = z.object({
  code: requiredText("Captura el codigo de la materia").transform((value) =>
    normalizeCatalogCode(value)
  ),
  name: requiredText("Captura el nombre de la materia"),
  description: optionalText,
  academicLevelId: requiredText("Selecciona un nivel academico"),
  modalityId: optionalText,
  active: z.coerce.boolean().optional()
});

export type SubjectInput = z.infer<typeof subjectSchema>;
