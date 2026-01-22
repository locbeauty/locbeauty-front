import { z } from "zod";
import { addressSchema } from "./address";

export const updateFilialFormSchema = z
  .object({
    CNPJ: z.string().optional(),
    email: z
      .string()
      .min(1, { message: "Email é obrigatório" })
      .email({ message: "Email inválido" })
      .optional(),
    cellphone: z
      .string()
      .min(16, { message: "Celular deve conter DDD e números" })
      .max(17, { message: "Celular deve conter no máximo 11 dígitos" })
      .optional(),
    filialName: z.string().optional(),
    managerEmployeeId: z.string().optional(),
    address: addressSchema.optional(),
  });

export type UpdateFilialFormSchemaType = z.infer<
  typeof updateFilialFormSchema
>;
