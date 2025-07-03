import { z } from "zod";

export const createGearFormSchema = z.object({
    name: z
        .string({ message: "Nome do equipamento é obrigatório" })
        .trim()
        .min(1, { message: "Nome do equipamento é obrigatório" })
        .max(100, {
            message: "Nome do equipamento deve ter no máximo 100 caracteres",
        }),
    description: z.string().trim().optional(),
    acquisitionDate: z
        .date({ message: "Data de aquisição é obrigatória" })
        .refine((date) => !date || date <= new Date(), {
            message: "Data de aquisição não pode ser no futuro",
        }),
    sourceRegionalId: z
        .string({ message: "Regional é obrigatória" })
        .trim()
        .min(1, { message: "Regional é obrigatória" }),
    transferable: z.boolean(),
    availableUnits: z.number({
        message: "Número de unidades disponíveis é obrigatório",
    }),
});

export type CreateGearFormSchemaType = z.infer<typeof createGearFormSchema>;
