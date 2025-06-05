import { z } from "zod";

// Schema para Regional
export const regionalSchema = z.object({
    regionalId: z.string().min(1, { message: "ID da regional é obrigatório" }),
    title: z
        .string()
        .trim()
        .min(1, { message: "Nome da regional é obrigatório" })
        .max(100, { message: "Nome da regional deve ter no máximo 100 caracteres" }),
    CNPJ: z
        .string()
        .min(1, { message: "CNPJ é obrigatório" }),
    state: z.object({
        UF: z.string().length(2, { message: "UF deve ter 2 caracteres" }),
        title: z.string().min(1, { message: "Nome do estado é obrigatório" })
    })
});