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
    statename: z.string()
});