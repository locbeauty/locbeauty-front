import { z } from "zod";

export const createRegionalFormSchema = z
    .object({
        CNPJ: z.string().optional(),
        email: z
            .string()
            .min(1, { message: "Email é obrigatório" })
            .email({ message: "Email inválido" }),
        cellphone: z
            .string()
            .min(14, { message: "Celular deve conter DDD e número" })
            .max(15, { message: "Celular deve conter no máximo 11 dígitos" })
            .transform((val) => val.replace(/\D/g, "")),
        description: z.string().optional(),
        manager: z.string().min(1, { message: "Gerente é obrigatório." }),
        CEP: z.string({ message: "CEP é obrigatório." }).length(9, { message: "CEP precisa ter 8 caracteres." }),
        city: z.string().min(1, { message: "Cidade é obrigatória" }).trim(),
        state: z.string().min(2, { message: "Estado é obrigatório." }).toUpperCase(),
        neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }).trim(),
        street: z.string().min(1, { message: "Rua é obrigatória" }).trim(),
        houseNumber: z.string().min(1, { message: "Número do imóvel é obrigatório" }).trim(),
        addressComplement: z.string().optional(),
    }).transform((data) => {
        if (!data.description || data.description.trim() === "") {
            data.description = `Filial ${data.state}`;
        }
        return data;
    });

export type CreateRegionalFormSchemaType = z.infer<
  typeof createRegionalFormSchema
>