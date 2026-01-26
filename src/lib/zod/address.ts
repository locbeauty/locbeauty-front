import { z } from "zod";

// Schema para Address
export const addressSchema = z.object({
  zipCode: z.string().optional(),
  stateName: z.string().min(1, { message: "Estado é obrigatório" }),
  cityName: z
    .string()
    .trim()
    .min(1, { message: "Cidade é obrigatória" })
    .max(100, { message: "Cidade deve ter no máximo 100 caracteres" }),
  neighborhoodName: z
    .string()
    .trim()
    .max(100, { message: "Bairro deve ter no máximo 100 caracteres" })
    .optional(),
  streetName: z
    .string()
    .trim()
    .max(200, { message: "Rua deve ter no máximo 200 caracteres" })
    .optional(),
  buildingNumber: z
    .string()
    .trim()
    .max(20, { message: "Número deve ter no máximo 20 caracteres" })
    .optional(),
  addressComplement: z
    .string()
    .trim()
    .max(100, { message: "Complemento deve ter no máximo 100 caracteres" })
    .optional()
    .nullable(),
});

export type AddressTypeSchema = z.infer<typeof addressSchema>;
