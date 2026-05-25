import { z } from "zod";

export const updateFilialFormSchema = z.object({
  CNPJ: z.string().optional(),
  cellphone: z
    .string()
    .min(14, { message: "Celular deve conter DDD e números" })
    .max(17, { message: "Celular deve conter no máximo 11 dígitos" })
    .optional(),
  filialName: z.string().optional(),
  managerEmployeeId: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido (use 00000-000)").optional(),
  street: z.string().optional(),
  buildingNumber: z.string().optional(),
  addressComplement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type UpdateFilialFormSchemaType = z.infer<typeof updateFilialFormSchema>;
