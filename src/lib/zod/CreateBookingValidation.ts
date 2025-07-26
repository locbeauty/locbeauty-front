import { z } from "zod";

export const createBookingFormSchema = z
    .object({
        // customerId: z.string({ message: "Nome do cliente é obrigatório" }),
        customer: z.object({
            customerId: z.string({ message: "ID do cliente é obrigatório" }),
            fullname: z.string({ message: "Nome do cliente é obrigatório" }),
            documentNumber: z.string({ message: "documento do cliente é obrigatório" }),
        }),
        gear: z.object({
            gearId: z.string({ message: "ID da máquina é obrigatório" }),
            gearName: z.string({ message: "Nome da máquina é obrigatório" }),
        }),
        filialId: z.string(),
        gearAmount: z.number().min(1, { message: "Quantidade deve ser maior que zero." }),
        date: z.date({ message: "Data é obrigatória." })
            .refine((val) => val >= new Date(), {
                message: "Data precisa ser no futuro.",
            }),
        startHourInMinutes: z.number(),
        totalDurationInMinutes: z.number(),
        price: z.string().min(1, { message: "Preço é obrigatório." }),
        bookingStatus: z
            .enum([ "Pendente", "Concluido", "Cancelado" ], { message: "Status de pagamento é obrigatório." }),
        paymentStatus: z
            .enum([ "Pendente", "Parcial", "Pago" ], { message: "Status de pagamento é obrigatório." }),
        observations: z.string().trim().optional(),
        addressId: z.string()
    });

export type CreateBookingFormSchemaType = z.infer<typeof createBookingFormSchema>
