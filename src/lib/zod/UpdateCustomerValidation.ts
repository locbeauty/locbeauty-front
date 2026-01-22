import { z } from "zod";

export const updateCustomerFormSchema = z.object({
  fullname: z.string().trim().optional(),
  documentNumber: z
    .string()
    .max(18, {
      message: "Número do documento precisa ter no máximo 18 caracteres.",
    })
    .optional(),
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
  cellphone: z.string().max(20).nullable().optional(),
  cellphoneDescription: z.string().trim().nullable().optional(),
  secondaryCellphone: z.string().max(20).nullable().optional(),
  secondaryCellphoneDescription: z.string().trim().nullable().optional(),
  instagram: z.string().trim().nullable().optional(),
  customerStatus: z
    .enum([ "Ativo", "Inativo", "Inadimplente", "Bloqueado" ])
    .optional(),
});

export type UpdateCustomerFormSchemaType = z.infer<
  typeof updateCustomerFormSchema
>;
