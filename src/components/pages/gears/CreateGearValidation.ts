
import { z } from "zod";

export const createGearFormSchema = z
    .object({
        name: z.string({ ["required_error"]: "Nome do equipamento é obrigatório" })
            .trim()
            .min(1, { message: "Nome do equipamento é obrigatório" })
            .max(100, { message: "Nome do equipamento deve ter no máximo 100 caracteres" }),
        description: z
            .string()
            .trim().optional(),
        acquisitionDate: z.date({
            ["required_error"]: "Data de aquisição é obrigatória",
            ["invalid_type_error"]: "Formato de data inválido",
        })
            .refine((date) => !date || date <= new Date(), { message: "Data de aquisição não pode ser no futuro" }),
        sourceRegional: z.string({ ["required_error"]: "Regional é obrigatória" })
            .trim()
            .min(1, { message: "Regional é obrigatória" }),
        canBeTransferred: z.boolean(),
        availableUnits: z.number({
            ["required_error"]: "Número de unidades disponíveis é obrigatório",
            ["invalid_type_error"]: "Valor deve ser um número",
        })
            .int({ message: "Valor deve ser um número inteiro" })
            .min(1, { message: "Deve haver pelo menos 1 unidade disponível" }),
    });

export type CreateGearFormSchemaType = z.infer<
  typeof createGearFormSchema
>