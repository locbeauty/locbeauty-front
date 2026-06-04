import { z } from "zod";
import { addressSchema } from "./address";

export const createCustomerFormSchema = z
  .object({
    fullname: z.string().trim().min(1, { message: "Nome é obrigatório." }),
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
    companyName: z.string().trim().nullable(),
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
    cellphone: z
      .string()
      .min(14, { message: "Telefone é obrigatório" })
      .nullable(),
    cellphoneDescription: z.string().trim().nullable().optional(),
    secondaryCellphone: z.string().max(20).nullable().optional(),
    secondaryCellphoneDescription: z.string().trim().nullable().optional(),
    instagram: z.string().trim().nullable(),
    filialId: z.string().cuid({ message: "Filial é obrigatória" }),
    // Outras filiais em que o cliente também atua (além da filial de origem).
    filialIds: z.array(z.string()).optional(),
    isTrainee: z.boolean().default(false).optional(),
    address: addressSchema.extend({
      stateName: z.string().optional().or(z.literal("")),
      cityName: z.string().optional().or(z.literal("")),
      streetName: z.string().optional().or(z.literal("")),
      neighborhoodName: z.string().optional().or(z.literal("")),
      buildingNumber: z.string().optional().or(z.literal("")),
      zipCode: z.string().optional().or(z.literal("")),
      addressComplement: z.string().optional().nullable().or(z.literal("")),
    }),
  })
  .superRefine((data, ctx) => {
    const hasCpf = !!data.cpf;
    const hasCnpj = !!data.cnpj;

    if (!hasCpf && !hasCnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preencha pelo menos um documento (CPF ou CNPJ).",
        path: [ "cpf" ],
      });
    }

    if (data.isTrainee) {
      if (!data.birthdate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data de nascimento é obrigatória para alunos.",
          path: [ "birthdate" ],
        });
      }
    }
  });

export type CreateCustomerFormSchemaType = z.infer<
  typeof createCustomerFormSchema
>;
