import { z } from "zod";

export const createFilialFormSchema = z.object({
  cellphone: z
    .string()
    .min(14, { message: "Telefone deve conter DDD e número" })
    .max(15, { message: "Telefone deve conter no máximo 15 dígitos" }),
  filialName: z.string(),
  managerEmployeeId: z.string().nullable().optional(),
});

export type CreateFilialFormSchemaType = z.infer<typeof createFilialFormSchema>;
