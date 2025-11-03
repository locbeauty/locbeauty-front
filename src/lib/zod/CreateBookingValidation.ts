import { z } from "zod";

export type CreateCheckoutFormSchemaType = z.infer<typeof createCheckoutFormSchema>;

export type CustomCheckoutFormSchemaType = Omit<CreateCheckoutFormSchemaType, "price"> & {
  price: number;
};

export const createCheckoutFormSchema = z
    .object({
        filialId: z.string(),

        date: z.date({ message: "Data é obrigatória." }).refine((val) => val > new Date(), {
            message: "Data precisa ser no futuro.",
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
            individualPrice: z.string().refine(value => value !== "0", { message: "Valor inválido." }),
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
        paymentStatus: z.enum([ "Pendente", "Parcial", "Pago" ], {
            message: "Status de pagamento é obrigatório.",
        }),
        partialPayment: z.string().optional(),
        paymentMode: z
            .enum([ "PIX", "Transferência bancária" ])
            .optional(),

        observations: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
        const basePriceValue = parseFloat(data.basePrice.replace(",", "."));
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
            } else if (!isNaN(partialValue) && !isNaN(basePriceValue) && partialValue >= basePriceValue) {
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

export type CreateCheckoutValidationWithMoneyInCents = Omit<
  CreateCheckoutFormSchemaType,
  | "totalPrice"
  | "partialPayment"
  | "basePrice"
  | "extraMachineCosts"
  | "lodgingCost"
  | "foodCost"
  | "fuelCost"
  | "additionalTransportCost"
  | "gears"
> & {
  basePrice: number;
  extraMachineCosts: number;
  lodgingCost: number;
  foodCost: number;
  fuelCost: number;
  additionalTransportCost: number;
  totalPrice: number;
  partialPayment?: number;
  gears: {
            gearId: string,
            gearName: string,
            individualPrice: number
        }[],
};
