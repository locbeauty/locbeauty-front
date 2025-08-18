import { z } from "zod";
import { addressSchema } from "./address";

export const createFilialFormSchema = z
    .object({
        // CNPJ: z.string().optional(),
        email: z
            .string()
            .min(1, { message: "Email é obrigatório" })
            .email({ message: "Email inválido" }),
        cellphone: z
            .string()
            .min(15, { message: "Celular deve conter DDD e número" })
            .max(16, { message: "Celular deve conter no máximo 11 dígitos" }),
        filialName: z.string(),
        managerEmployeeId: z.string({ message: "Gerente é obrigatório." }),
        address: addressSchema,
    });

export type CreateFilialFormSchemaType = z.infer<
  typeof createFilialFormSchema
>