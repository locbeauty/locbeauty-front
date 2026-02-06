import { z } from "zod";

export const updateCustomerFormSchema = z.object({
  fullname: z.string().trim().optional(),
  cpf: z
    .string()
    .min(11, { message: "CPF inválido" })
    .max(14, { message: "CPF inválido" })
    .nullable()
    .optional()
    .or(z.literal("")),
  cnpj: z
    .string()
    .min(14, { message: "CNPJ inválido" })
    .max(18, { message: "CNPJ inválido" })
    .nullable()
    .optional()
    .or(z.literal("")),
  companyName: z.string().trim().nullable().optional(),
  birthdate: z
    .union([
      z.null(),
      z.date().refine((val) => val < new Date(), {
        message: "Data de nascimento inválida.",
      }),
    ])
    .optional(),
  email: z
    .string()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Email inválido",
    })
    .optional(),
  emailDescription: z.string().trim().nullable().optional(),
  secondaryEmail: z
    .string()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Email secundário inválido",
    })
    .optional(),
  secondaryEmailDescription: z.string().trim().nullable().optional(),
  cellphone: z.string().min(14, { message: "Telefone é obrigatório" }).optional(),
  cellphoneDescription: z.string().trim().nullable().optional(),
  secondaryCellphone: z.string().max(20).nullable().optional(),
  secondaryCellphoneDescription: z.string().trim().nullable().optional(),
  instagram: z.string().trim().nullable().optional(),
  customerStatus: z
    .enum([ "Ativo", "Inativo", "Inadimplente", "Bloqueado" ])
    .optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateCustomerFormSchemaType = z.infer<
  typeof updateCustomerFormSchema
>;
