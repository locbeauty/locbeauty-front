import { z } from "zod";

// Schema para Address
export const addressSchema = z.object({
  zipCode: z.string().min(1, { message: "CEP é obrigatório" }),
  state: z.object({
    UF: z.string().length(2, { message: "UF deve ter 2 caracteres" }),
    title: z.string().min(1, { message: "Nome do estado é obrigatório" }),
  }),
  city: z
    .string()
    .trim()
    .min(1, { message: "Cidade é obrigatória" })
    .max(100, { message: "Cidade deve ter no máximo 100 caracteres" }),
  neighborhood: z
    .string()
    .trim()
    .min(1, { message: "Bairro é obrigatório" })
    .max(100, { message: "Bairro deve ter no máximo 100 caracteres" }),
  street: z
    .string()
    .trim()
    .min(1, { message: "Rua é obrigatória" })
    .max(200, { message: "Rua deve ter no máximo 200 caracteres" }),
  buildingNumber: z
    .string()
    .trim()
    .min(1, { message: "Número é obrigatório" })
    .max(20, { message: "Número deve ter no máximo 20 caracteres" }),
  addressComplement: z
    .string()
    .trim()
    .max(100, { message: "Complemento deve ter no máximo 100 caracteres" })
    .optional(),
});
