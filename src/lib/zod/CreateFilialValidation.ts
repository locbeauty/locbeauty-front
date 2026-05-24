import { z } from "zod";

export const createFilialFormSchema = z.object({
  filialName: z.string().min(1, "Nome é obrigatório"),
  cellphone: z
    .string()
    .min(14, { message: "Telefone deve conter DDD e número" })
    .max(15, { message: "Telefone deve conter no máximo 15 dígitos" }),
  managerEmployeeId: z.string().nullable().optional(),
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  buildingNumber: z.string().min(1, "Número é obrigatório"),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
});

export type CreateFilialFormSchemaType = z.infer<typeof createFilialFormSchema>;
