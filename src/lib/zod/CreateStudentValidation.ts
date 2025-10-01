import { z } from "zod";
import { addressSchema } from "./address";

export const CreateStudentSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    documentNumber: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    cellphone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    address: addressSchema
});

export type CreateStudentFormDataType = z.infer<typeof CreateStudentSchema>;
