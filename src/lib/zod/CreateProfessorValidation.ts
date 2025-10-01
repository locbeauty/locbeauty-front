import { z } from "zod";

export const CreateProfessorSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    documentNumber: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    cellphone: z.string().min(10, "Telefone inválido"),
});

export type CreateProfessorFormDataType = z.infer<typeof CreateProfessorSchema>;