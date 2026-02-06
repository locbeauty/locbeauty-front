import { z } from "zod";

// Schema para Address
export const addressSchema = z.object({
  zipCode: z.string().optional().nullable(),
  stateName: z.string({ message: "Estado é obrigatório" }).min(1, { message: "Estado é obrigatório" }),
  cityName: z
    .string()
    .trim()
    .min(1, { message: "Cidade é obrigatória" })
    .max(100, { message: "Cidade deve ter no máximo 100 caracteres" }),
  neighborhoodName: z
    .string()
    .trim()
    .min(1, { message: "Bairro é obrigatório" })
    .max(100, { message: "Bairro deve ter no máximo 100 caracteres" }),
  streetName: z
    .string({ message: "Rua é obrigatória" })
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
    .optional()
    .nullable(),
});

export type AddressTypeSchema = z.infer<typeof addressSchema>;
