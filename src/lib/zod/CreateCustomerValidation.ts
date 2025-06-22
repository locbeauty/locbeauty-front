import { z } from "zod";
import { addressSchema } from "./address";

export const createCustomerFormSchema = z
    .object({
        fullname: z.string().trim().min(1, { message: "Nome é obrigatório." }),
        documentNumber: z.string().min(14, { message: "Número do documento é obrigatório." }),
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
            }),
        cellphone: z.string().min(14, { message: "Telefone é obrigatório" }),
        instagram: z.string().trim().nullable(),
        address: addressSchema,
    });

export type CreateCustomerFormSchemaType = z.infer<
  typeof createCustomerFormSchema
>;
