import { z } from "zod";

export const createBookingFormSchema = z
    .object({
        customerId: z.string({ message: "Nome do cliente é obrigatório" }).trim(),
        gearName: z.string({ message: "Nome da máquina é obrigatório" }).trim(),
        regional: z.string().optional(),
        amount: z.number().min(1, { message: "Quantidade deve ser maior que zero." }),
        date: z
            .date({ message: "Data é obrigatória.", })
            .refine((val) => val > new Date(), {
                message: "Data precisa ser no futuro.",
            })
            .transform((val) => new Date(val)).nullable().refine((val) => val !== null || val !== undefined, {
                message: "Data é obrigatória.",
            }),
        startHour: z.number().nullable(),
        endHour: z.number().nullable(),
        totalDuration: z
            .number(),
        price: z
            .string()
            .min(1, { message: "Preço é obrigatório." }),
        bookingStatus: z
            .enum([ "Não iniciado", "Concluído", "Cancelado" ], { message: "Status de pagamento é obrigatório." }),
        paymentStatus: z
            .enum([ "Não pago", "Pagamento parcial", "Pago" ], { message: "Status de pagamento é obrigatório." }),
        observations: z.string().trim().optional(),
    });

export type CreateBookingFormSchemaType = z.infer<typeof createBookingFormSchema>
