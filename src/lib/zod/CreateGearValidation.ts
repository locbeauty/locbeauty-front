import { z } from "zod";

export const createGearFormSchema = z.object({
  gearName: z
    .string({ message: "Nome do equipamento é obrigatório" })
    .trim()
    .min(1, { message: "Nome do equipamento é obrigatório" })
    .max(100, {
      message: "Nome do equipamento deve ter no máximo 100 caracteres",
    }),
  sourceFilialId: z
    .string({ message: "Filial é obrigatória" })
    .trim()
    .min(1, { message: "Filial é obrigatória" }),
  outOfServiceUnits: z.number().default(0),
  availableUnits: z.number().default(0),
  totalUnits: z.number({
    message: "Número de unidades disponíveis é obrigatório",
  }),
});

export type CreateGearFormSchemaType = z.infer<typeof createGearFormSchema>;
