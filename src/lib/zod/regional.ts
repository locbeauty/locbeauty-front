import { z } from "zod";

// Schema para Filial
export const filialSchema = z.object({
    filialId: z.string().min(1, { message: "ID da filial é obrigatório" }),
    title: z
        .string()
        .trim()
        .min(1, { message: "Nome da filial é obrigatório" })
        .max(100, { message: "Nome da filial deve ter no máximo 100 caracteres" }),
    CNPJ: z
        .string()
        .min(1, { message: "CNPJ é obrigatório" }),
    statename: z.string()
});