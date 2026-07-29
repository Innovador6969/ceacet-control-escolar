import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const requiredUpperText = (message: string) =>
  z
    .string()
    .trim()
    .min(1, { message })
    .transform((value) => value.toUpperCase());

const optionalUpperText = z
  .string()
  .trim()
  .transform((value) => {
    if (value === "") return undefined;
    return value.toUpperCase();
  })
  .optional();

const optionalCapacity = z.coerce
  .number({ invalid_type_error: "Captura una capacidad valida" })
  .int("La capacidad debe ser un numero entero")
  .min(0, "La capacidad no puede ser negativa")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const groupSchema = z.object({
  code: optionalUpperText,
  name: requiredUpperText("Captura el nombre del grupo"),
  description: optionalText,
  academicLevelId: z.string().trim().min(1, "Selecciona un nivel academico"),
  modalityId: z.string().trim().min(1, "Selecciona una modalidad"),
  schedule: optionalText,
  capacity: optionalCapacity,
  active: z.coerce.boolean().optional()
});

export type GroupInput = z.infer<typeof groupSchema>;
