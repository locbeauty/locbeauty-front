import { z } from "zod";

export const createCustomerFormSchema = z
    .object({
        personType: z.enum([ "PF", "PJ" ]),
        birthday: z.date().optional(),
        customerName: z.string().trim().optional(),
        personAccountableName: z.string().trim().optional(), // Novo campo
        companyName: z.string().trim().optional(),
        regional: z.string(),
        email: z
            .string()
            .min(1, { message: "Email é obrigatório" })
            .email({ message: "Email inválido" }),
        cellphone: z
            .string()
            .min(10, { message: "Celular deve conter DDD e número" }),
        instagram: z.string().trim().optional(),
        city: z.string().min(1, { message: "Cidade é obrigatória" }).trim(),
        UF: z.string().length(2, { message: "UF é obrigatório." }).toUpperCase(),
        neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }).trim(),
        street: z.string().min(1, { message: "Rua é obrigatória" }).trim(),
        houseNumber: z.string().min(1, { message: "Número do imóvel é obrigatório" }).trim(),
        CPF: z.string().optional(),
        CNPJ: z.string().optional(),
        addressComplement: z.string().optional(),
    })
    .superRefine((data, ctx) => {
    // Validações para Pessoa Física (PF)
        if (data.personType === "PF") {
            // Validação de CPF obrigatório
            if (!data.CPF) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CPF é obrigatório para pessoa física.",
                    path: [ "CPF" ],
                });
            }
            else if(!data.personAccountableName) {
                ctx.addIssue({
                    path: [ "personAccountableName" ],
                    message: "Nome do responsável é obrigatório para pessoa jurídica",
                    code: z.ZodIssueCode.custom,
                });
            }
            // Validação do formato do CPF (apenas se CPF existir)
            else if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(data.CPF)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CPF inválido.",
                    path: [ "CPF" ],
                });
            }

            // Validação de nome obrigatório APENAS para pessoa física
            if (!data.customerName || data.customerName.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nome completo é obrigatório para pessoa física.",
                    path: [ "customerName" ],
                });
            }

            // Validação de data de nascimento obrigatória
            if (!data.birthday) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Data de nascimento é obrigatória.",
                    path: [ "birthday" ],
                });
            }

            // Para PF, companyName não é validado (não é obrigatório)
        }

        // Validações para Pessoa Jurídica (PJ)
        if (data.personType === "PJ") {
            // Validação de CNPJ obrigatório
            if (!data.CNPJ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CNPJ é obrigatório para pessoa jurídica.",
                    path: [ "CNPJ" ],
                });
            }
            // Validação do formato do CNPJ (apenas se CNPJ existir)
            else if (!/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(data.CNPJ)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CNPJ inválido.",
                    path: [ "CNPJ" ],
                });
            }

            // Validação de nome da empresa obrigatório APENAS para pessoa jurídica
            if (!data.companyName || data.companyName.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nome da empresa é obrigatório para pessoa jurídica.",
                    path: [ "companyName" ],
                });
            }
        }
    });

export type CreateCustomerFormSchemaType = z.infer<
  typeof createCustomerFormSchema
>