import { z } from "zod";
import { addressSchema } from "./address";

// Schema principal do Employee
export const createEmployeeFormSchema = z.object({
    // TODO: ADD PASSWORD
    fullname: z
        .string({ message: "Nome completo é obrigatório" })
        .trim()
        .min(1, { message: "Nome completo é obrigatório" })
        .max(200, { message: "Nome completo deve ter no máximo 200 caracteres" }),
    documentNumber: z
        .string()
        .min(1, { message: "CPF é obrigatório" })
        .regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, { message: "CPF deve ter formato válido (000.000.000-00)" }),
    roleId: z.string({ message: "Função é obrigatória" }),
    cellphone: z.string().min(14, { message: "Telefone é obrigatório" }),
    sourceRegionalId: z.string(),
    email: z
        .string()
        .min(1, { message: "Email é obrigatório" })
        .email({ message: "Email inválido" })
        .max(100, { message: "Email deve ter no máximo 100 caracteres" }),
    address: addressSchema,
    birthdate: z
        .date({ message: "Data de nascimento é obrigatória" })
        .refine(date => date < new Date(), { message: "Data de nascimento deve ser no passado" }),
    password: z.string({ message: "Senha é obrigatória." })
});

export type CreateEmployeeFormSchemaType = z.infer<typeof createEmployeeFormSchema>;