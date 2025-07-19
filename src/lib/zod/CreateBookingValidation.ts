import { z } from "zod";

export const createBookingFormSchema = z
    .object({
        customerId: z.string({ message: "Nome do cliente é obrigatório" }),
        gearId: z.string({ message: "Nome da máquina é obrigatório" }),
        filialId: z.string(),
        gearAmount: z.number().min(1, { message: "Quantidade deve ser maior que zero." }),
        date: z.date({ message: "Data é obrigatória." })
            .refine((val) => val >= new Date(), {
                message: "Data precisa ser no futuro.",
            }),
        startHourInMinutes: z.number(),
        totalDuration: z.number(),
        price: z.string().min(1, { message: "Preço é obrigatório." }),
        bookingStatus: z
            .enum([ "Pendente", "Concluido", "Cancelado" ], { message: "Status de pagamento é obrigatório." }),
        paymentStatus: z
            .enum([ "Pendente", "Parcial", "Pago" ], { message: "Status de pagamento é obrigatório." }),
        observations: z.string().trim().optional(),
    });

export type CreateBookingFormSchemaType = z.infer<typeof createBookingFormSchema>
