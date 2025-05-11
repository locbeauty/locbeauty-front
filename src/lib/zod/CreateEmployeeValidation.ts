
import { z } from "zod";

export const createEmployeeFormSchema = z
    .object({
        employeeName: z
            .string({ message: "Nome do equipamento é obrigatório" })
            .trim()
            .min(1, { message: "Nome do equipamento é obrigatório" })
            .max(100, { message: "Nome do equipamento deve ter no máximo 100 caracteres" }),
        sourceRegional: z
            .string()
            .trim()
            .min(1, { message: "Regional é obrigatória" }),
        CPF: z
            .string()
            .min(1, { message: "CPF é obrigatório" })
            .length(14, { message: "CPF precisa ter 11 caracteres." }),
        birthdate: z
            .date()
            .optional(),
        cellphone: z
            .string()
            .optional()
            .refine(val => val !== undefined && val !== "", { message: "Telefone é obrigatório" }),
        role: z
            .string()
            .trim()
            .min(1, { message: "Função é obrigatória" }),
        email: z
            .string()
            .min(1, { message: "Email é obrigatório" })
            .email({ message: "Email inválido" })
    });

export type CreateEmployeeFormSchemaType = z.infer<
  typeof createEmployeeFormSchema
>