import { z } from "zod";

export type CreateBookingFormSchemaType = z.infer<typeof createBookingFormSchema>;

export type CustomBookingFormSchemaType = Omit<CreateBookingFormSchemaType, "price"> & {
  price: number;
};

export const createBookingFormSchema = z
    .object({
        customer: z.object({
            customerId: z.string({ message: "ID do cliente é obrigatório" }),
            fullname: z.string({ message: "Nome do cliente é obrigatório" }),
            documentNumber: z.string({ message: "Documento do cliente é obrigatório" }),
        }),
        gear: z.object({
            gearId: z.string({ message: "ID da máquina é obrigatório" }),
            gearName: z.string({ message: "Nome da máquina é obrigatório" }),
        }),
        filialId: z.string(),
        gearAmount: z.number().min(1, { message: "Quantidade deve ser maior que zero." }),
        date: z.date({ message: "Data é obrigatória." }).refine((val) => val >= new Date(), {
            message: "Data precisa ser no futuro.",
        }),
        startHourInMinutes: z.number(),
        totalDurationInMinutes: z.number(),
        price: z.string().min(1, { message: "Preço é obrigatório." }),
        bookingStatus: z.enum([ "Pendente", "Concluido", "Cancelado" ], {
            message: "Status do agendamento é obrigatório.",
        }),
        paymentStatus: z.enum([ "Pendente", "Parcial", "Pago" ], {
            message: "Status de pagamento é obrigatório.",
        }),
        partialPayment: z.string().optional(),
        paymentMode: z
            .enum([ "PIX", "Crédito", "Débito", "Dinheiro" ])
            .optional(),
        observations: z.string().trim().optional(),
        addressId: z.string(),
    })
    .superRefine((data, ctx) => {
        const priceValue = parseFloat(data.price.replace(",", "."));
        const partialValue = parseFloat((data.partialPayment || "0").replace(",", "."));

        if (data.paymentStatus === "Parcial") {
            if (
                !data.partialPayment ||
        data.partialPayment.trim() === "" ||
        data.partialPayment === "0"
            ) {
                ctx.addIssue({
                    path: [ "partialPayment" ],
                    code: z.ZodIssueCode.custom,
                    message: "Valor pendente é obrigatório quando o pagamento for parcial.",
                });
            } else if (!isNaN(partialValue) && !isNaN(priceValue) && partialValue >= priceValue) {
                console.log("partialValue >= priceValue: ", partialValue, priceValue)
                ctx.addIssue({
                    path: [ "partialPayment" ],
                    code: z.ZodIssueCode.custom,
                    message: "Valor maior que o preço total. Escolha a opção \"Pago\".",
                });
            }
        }

        if (data.paymentStatus !== "Pendente" && !data.paymentMode) {
            ctx.addIssue({
                path: [ "paymentMode" ],
                code: z.ZodIssueCode.custom,
                message: "Forma de pagamento é obrigatória.",
            });
        }
    });
