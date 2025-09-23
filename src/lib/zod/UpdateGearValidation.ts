import { z } from "zod";

export const updateGearFormSchema = z.object({
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
    transferable: z.boolean(),
    outOfServiceUnits: z.number(),
    availableUnits: z.number(),
    totalUnits: z.number({
        message: "Número de unidades disponíveis é obrigatório",
    }),

}).refine(
    (data) =>
        (data.outOfServiceUnits || 0) + (data.availableUnits || 0) <=
      (data.totalUnits || 0),
    {
        message:
        "A soma de unidades defeituosas e disponíveis não pode ultrapassar o total de unidades",
        path: [ "outOfServiceUnits" ], // ou ["availableUnits"], escolhe qual campo exibir o erro
    }
);;

export type UpdateGearFormSchemaType = z.infer<typeof updateGearFormSchema>;