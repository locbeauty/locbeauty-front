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
  availableUnits: z
    .number({ message: "Número de unidades disponíveis é obrigatório" })
    .min(0, { message: "O número de unidades deve ser maior ou igual a 0" }),
  outOfServiceUnits: z
    .number({ message: "Número de unidades fora de serviço é obrigatório" })
    .min(0, { message: "O número de unidades deve ser maior ou igual a 0" }),
});

export type CreateGearFormSchemaType = z.infer<typeof createGearFormSchema>;
