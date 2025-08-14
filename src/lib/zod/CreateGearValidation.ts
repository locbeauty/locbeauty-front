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
    transferable: z.boolean(),
    // outOfServiceUnits: z.number().default(0),
    // availableUnits: z.number().default(0),
    totalUnits: z.number({
        message: "Número de unidades disponíveis é obrigatório",
    }),
    acquisitionDate: z
        .date({ message: "Data de aquisição é obrigatória" })
        .refine((date) => !date || date <= new Date(), {
            message: "Data de aquisição não pode ser no futuro",
        }),
});

export type CreateGearFormSchemaType = z.infer<typeof createGearFormSchema>;