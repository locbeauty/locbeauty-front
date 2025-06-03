import { z } from "zod";
import { addressSchema } from "./address";

export const createCustomerFormSchema = z
    .object({
        personType: z.enum([ "PF", "PJ" ]),
        fullname: z.string().trim().optional(),
        personAccountableName: z.string().trim().optional(),
        companyName: z.string().trim().optional(),
        regionalId: z.string().optional(),
        email: z
            .string()
            .optional()
            .refine((val) => val !== "", { message: "Email é obrigatório" })
            .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
                message: "Email inválido",
            }),
        cellphone: z
            .string()
            .optional()
            .refine((val) => val !== undefined && val !== "", {
                message: "Telefone é obrigatório",
            }), // Validação será feita em outro arquivo
        instagram: z.string().trim().optional(),
        address: addressSchema,
        CPF: z
            .string()
            .length(14, { message: "CPF precisa ter 11 caracteres." })
            .optional(),
        CNPJ: z.string().optional(),
        addressComplement: z.string().nullable(),
        birthdate: z.date().optional(),
    })
    .superRefine((data, ctx) => {
    // Validações para Pessoa Física (PF)
        if (data.personType === "PF") {
            if (!data.birthdate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Data de nascimento é obrigatória.",
                    path: [ "birthdate" ],
                });
            } else {
                if (data.birthdate >= new Date()) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Data de nascimento não pode ser no futuro.",
                        path: [ "birthdate" ],
                    });
                }
            }

            if (!data.CPF) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CPF é obrigatório para PF.",
                    path: [ "CPF" ],
                });
            }
            // A validação do formato do CPF será feita em outro arquivo

            if (!data.fullname || data.fullname.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nome completo é obrigatório para PF.",
                    path: [ "fullname" ],
                });
            }
        }

        // Validações para Pessoa Jurídica (PJ)
        if (data.personType === "PJ") {
            if (!data.CNPJ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CNPJ é obrigatório para PJ.",
                    path: [ "CNPJ" ],
                });
            }

            if (!data.companyName || data.companyName.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nome da empresa é obrigatório para PJ.",
                    path: [ "companyName" ],
                });
            }

            if (
                !data.personAccountableName ||
        data.personAccountableName.trim().length < 2
            ) {
                ctx.addIssue({
                    path: [ "personAccountableName" ],
                    message: "Nome do responsável é obrigatório para PJ",
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });

export type CreateCustomerFormSchemaType = z.infer<
  typeof createCustomerFormSchema
>;
