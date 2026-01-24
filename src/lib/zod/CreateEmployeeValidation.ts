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
  username: z
    .string({ message: "Username é obrigatório" })
    .min(1, { message: "Username é obrigatório" }),
  role: z.string({ message: "Função é obrigatória" }),
  cellphone: z
    .string()
    .min(14, { message: "Telefone é obrigatório" })
    .nullable()
    .optional(),
  sourceFilialId: z.string(),
  email: z
    .string()
    .email({ message: "Email inválido" })
    .max(100, { message: "Email deve ter no máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  // address: addressSchema,
  birthdate: z
    .date()
    .refine((date) => date < new Date(), {
      message: "Data de nascimento deve ser no passado",
    })
    .nullable()
    .optional(),
  password: z.string({ message: "Senha é obrigatória." }),
});

export type CreateEmployeeFormSchemaType = z.infer<
  typeof createEmployeeFormSchema
>;

export const updateEmployeeFormSchema = createEmployeeFormSchema.partial();

export type UpdateEmployeeFormSchemaType = z.infer<
  typeof updateEmployeeFormSchema
>;
