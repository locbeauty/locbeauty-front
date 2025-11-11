import { CheckoutStatuses, PaymentMethods, paymentStatuses, PaymentStatuses } from "@/utils/constants";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { z } from "zod";

export const checkoutPaymentDataSchema = z
    .object({
        paymentStatus: z.enum(paymentStatuses),

        firstPaymentDate: z.coerce.date().optional().nullable(),
        firstPaymentAmount: z.string().optional(),
        firstPaymentMethod: z.enum(PaymentMethods).optional(),
        firstPaymentStatus: z.enum([ "Pendente", "Pago" ]).default("Pendente").optional(),

        secondPaymentDate: z.coerce.date().optional().nullable(),
        secondPaymentAmount: z.string().optional(),
        secondPaymentMethod: z.enum(PaymentMethods).optional(),
        secondPaymentStatus: z.enum([ "Pendente", "Pago" ]).default("Pendente").optional(),
    })
    .superRefine((data, ctx) => {

        if (data.paymentStatus === "Pendente") {
            return;
        }

        // Se "Pago" ou "Parcial", a 1ª parcela é obrigatória.
        if (data.paymentStatus === "Pago" || data.paymentStatus === "Parcial") {
            const firstPaymentCents = parseStringToCents(data.firstPaymentAmount);
            if (firstPaymentCents === 0) {
                ctx.addIssue({
                    path: [ "firstPaymentAmount" ],
                    code: z.ZodIssueCode.custom,
                    message: "O valor da 1ª parcela é obrigatório.",
                });
            }
            if (!data.firstPaymentDate) {
                ctx.addIssue({
                    path: [ "firstPaymentDate" ],
                    code: z.ZodIssueCode.custom,
                    message: "A data da 1ª parcela é obrigatória.",
                });
            }
            if (!data.firstPaymentMethod) {
                ctx.addIssue({
                    path: [ "firstPaymentMethod" ],
                    code: z.ZodIssueCode.custom,
                    message: "A forma da 1ª parcela é obrigatória.",
                });
            }
        }
    });

export  type CheckoutPaymenteDataType = z.infer<typeof checkoutPaymentDataSchema>

export const createCheckoutFormSchema = z
    .object({
        // ... (todos os campos mantidos: filialId, date, customer, gears, etc.) ...
        filialId: z.string(),

        date: z.date({ message: "Data é obrigatória." }).refine((val) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return val.getTime() >= today.getTime();
        }, {
            message: "Data não pode ser no passado.",
        }),
        startHourInMinutes: z.number(),
        totalDurationInMinutes: z.number(),

        driverId: z.string().optional(),
        accountableEmployeeId: z.string(),

        customer: z.object({
            customerId: z.string({ message: "ID do cliente é obrigatório" }),
            fullname: z.string({ message: "Nome do cliente é obrigatório" }),
            documentNumber: z.string({ message: "Documento do cliente é obrigatório" }),
            cellphone: z.string()
        }),
        addressId: z.string(),

        gears: z.array(z.object({
            gearId: z.string({ message: "ID da máquina é obrigatório" }),
            gearName: z.string({ message: "Nome da máquina é obrigatório" }),
            individualPrice: z.string().refine(value => parseStringToCents(value) > 0, {
                message: "Valor deve ser maior que R$ 0,00."
            }),
        })),

        basePrice: z.string().min(1, { message: "Preço base é obrigatório." }),
        extraMachineCosts: z.string().optional(),

        distanceInKm: z.number().optional(),
        lodgingCost: z.string().optional(),
        foodCost: z.string().optional(),
        fuelCost: z.string().optional(),
        additionalTransportCost: z.string().optional(),

        totalPrice: z.string(),

        checkoutStatus: z.enum([ "Pendente", "Concluido", "Cancelado" ], {
            message: "Status do agendamento é obrigatório.",
        }),
        paymentStatus: z.enum(paymentStatuses, {
            message: "Status de pagamento é obrigatório.",
        }),
        paymentInfo: checkoutPaymentDataSchema, // Usa o esquema aninhado acima

        observations: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {

        // 🎯 REGRA NOVA: Se "Parcial", o valor da 1ª parcela deve ser MENOR que o total.
        if (data.paymentStatus === "Parcial") {
            const totalCents = parseStringToCents(data.totalPrice);
            const firstPaymentCents = parseStringToCents(data.paymentInfo.firstPaymentAmount);

            // A validação de (firstPaymentCents === 0) já é feita pelo esquema aninhado.
            // Aqui, só precisamos checar se é >= ao total.
            if (firstPaymentCents > 0 && firstPaymentCents >= totalCents) {
                ctx.addIssue({
                    path: [ "paymentInfo", "firstPaymentAmount" ], // Anexa o erro ao campo de valor
                    code: z.ZodIssueCode.custom,
                    message: "O valor parcial deve ser menor que o total. Para quitar, selecione 'Pago'.",
                });
            }
        }

        // Validação do TotalPrice (mantida)
        const fuelCost = (data.distanceInKm && data.fuelCost) ? parseStringToCents(data.fuelCost) * data.distanceInKm : 0;
        const computedTotal =
                parseStringToCents(data.basePrice)
                + parseStringToCents(data.lodgingCost)
                + parseStringToCents(data.foodCost)
                + fuelCost
                + parseStringToCents(data.additionalTransportCost)
                + parseStringToCents(data.extraMachineCosts);

        if (parseStringToCents(data.totalPrice) !== computedTotal) {
            ctx.addIssue({
                path: [ "totalPrice" ],
                code: z.ZodIssueCode.custom,
                message: "O preço total deve corresponder à soma dos custos e preço base.",
            });
        }
    });

// Types
export type CreateCheckoutFormSchemaType = z.infer<typeof createCheckoutFormSchema>;

export type CustomCheckoutFormSchemaType = Omit<CreateCheckoutFormSchemaType, "price"> & {
  price: number;
};