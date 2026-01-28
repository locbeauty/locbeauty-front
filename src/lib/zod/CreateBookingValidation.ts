import {
  CheckoutStatuses,
  PaymentMethods,
  paymentStatuses,
  PaymentStatuses,
} from "@/utils/constants";
import { centsToString } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { z } from "zod";

export const checkoutPaymentDataSchema = z
  .object({
    paymentStatus: z.enum(paymentStatuses),

    firstPaymentDate: z.coerce.date().optional().nullable(),
    firstPaymentAmount: z.string().optional(),
    firstPaymentMethod: z.enum(PaymentMethods).optional(),
    firstPaymentStatus: z
      .enum(["Pendente", "Pago"])
      .default("Pendente")
      .optional(),

    secondPaymentDate: z.coerce.date().optional().nullable(),
    secondPaymentAmount: z.string().optional(),
    secondPaymentMethod: z.enum(PaymentMethods).optional(),
    secondPaymentStatus: z
      .enum(["Pendente", "Pago"])
      .default("Pendente")
      .optional(),
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
          path: ["firstPaymentAmount"],
          code: z.ZodIssueCode.custom,
          message: "O valor da 1ª parcela é obrigatório.",
        });
      }
      if (!data.firstPaymentDate) {
        ctx.addIssue({
          path: ["firstPaymentDate"],
          code: z.ZodIssueCode.custom,
          message: "A data da 1ª parcela é obrigatória.",
        });
      }
      if (!data.firstPaymentMethod) {
        ctx.addIssue({
          path: ["firstPaymentMethod"],
          code: z.ZodIssueCode.custom,
          message: "A forma da 1ª parcela é obrigatória.",
        });
      }
    }
  });

export type CheckoutPaymenteDataType = z.infer<
  typeof checkoutPaymentDataSchema
>;

export const createCheckoutFormSchema = z
  .object({
    // ... (todos os campos mantidos: filialId, date, customer, gears, etc.) ...
    filialId: z.string(),

    date: z.date({ message: "Data é obrigatória." }),
    startHourInMinutes: z.number(),
    totalDurationInMinutes: z.number(),

    driverId: z.string().optional(),
    accountableEmployeeId: z.string(),

    customer: z.object({
      customerId: z.string({ message: "ID do cliente é obrigatório" }),
      fullname: z.string({ message: "Nome do cliente é obrigatório" }),
      documentNumber: z.string({
        message: "Documento do cliente é obrigatório",
      }),
      cellphone: z.string(),
    }),
    addressId: z.string(),

    gears: z.array(
      z.object({
        gearId: z.string({ message: "ID da máquina é obrigatório" }),
        gearName: z.string({ message: "Nome da máquina é obrigatório" }),
        individualPrice: z.string(),
      }),
    ),

    // basePrice: z.string().min(1, { message: "Preço base é obrigatório." }),
    basePrice: z.string(),
    extraMachineCosts: z.string().optional(),

    distanceInKm: z.number().optional(),
    lodgingCost: z.string().optional(),
    foodCost: z.string().optional(),
    fuelCost: z.string().optional(),
    additionalTransportCost: z.string().optional(),

    consumption: z.number().optional(),
    isRoundTrip: z.boolean().default(true),

    totalPrice: z.string(),

    checkoutStatus: z.enum(["Pendente", "Concluido", "Cancelado"], {
      message: "Status do agendamento é obrigatório.",
    }),
    paymentStatus: z.enum(paymentStatuses, {
      message: "Status de pagamento é obrigatório.",
    }),
    paymentInfo: checkoutPaymentDataSchema, // Usa o esquema aninhado acima

    observations: z.string().trim().optional(),

    // New fields for cross-day bookings
    crossDays: z.boolean().optional(),
    endDate: z.date().optional(),
    endHourInMinutes: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate Cross Days Logic
    if (data.crossDays) {
      if (!data.endDate) {
        ctx.addIssue({
          path: ["endDate"],
          code: z.ZodIssueCode.custom,
          message:
            "Data final é obrigatória quando 'Agendamento atravessa dias' está marcado.",
        });
      }

      // We allow 0 (midnight) so check undefined
      if (
        data.endHourInMinutes === undefined ||
        data.endHourInMinutes === null
      ) {
        ctx.addIssue({
          path: ["endHourInMinutes"],
          code: z.ZodIssueCode.custom,
          message: "Horário final é obrigatório.",
        });
      }

      if (
        data.date &&
        data.endDate &&
        data.endHourInMinutes !== undefined &&
        data.startHourInMinutes !== undefined
      ) {
        const start = new Date(data.date);
        start.setHours(0, 0, 0, 0); // Reset time part of date just in case
        // Add minutes
        start.setMinutes(start.getMinutes() + data.startHourInMinutes);

        const end = new Date(data.endDate);
        end.setHours(0, 0, 0, 0);
        end.setMinutes(end.getMinutes() + data.endHourInMinutes);

        if (end <= start) {
          ctx.addIssue({
            path: ["endDate"],
            code: z.ZodIssueCode.custom,
            message: "A data/hora final deve ser posterior à inicial.",
          });
        }
      }
    }

    // 🎯 REGRA NOVA: Se "Parcial", o valor da 1ª parcela deve ser MENOR que o total.
    if (data.paymentStatus === "Parcial") {
      const totalCents = parseStringToCents(data.totalPrice);
      const firstPaymentCents = parseStringToCents(
        data.paymentInfo.firstPaymentAmount,
      );

      // A validação de (firstPaymentCents === 0) já é feita pelo esquema aninhado.
      // Aqui, só precisamos checar se é >= ao total.
      if (firstPaymentCents > 0 && firstPaymentCents >= totalCents) {
        ctx.addIssue({
          path: ["paymentInfo", "firstPaymentAmount"], // Anexa o erro ao campo de valor
          code: z.ZodIssueCode.custom,
          message:
            "O valor parcial deve ser menor que o total. Para quitar, selecione 'Pago'.",
        });
      }
    }

    // Validação do TotalPrice
    // O custo de combustível depende do consumo. Se não tiver consumo definido, assume 1 para evitar divisão por zero (embora o form use 10 ou 1).
    // No form: const litersNeeded = distance / consumption;
    //          const totalFuel = Math.round(litersNeeded * fuelCents);
    const distance = data.distanceInKm || 0;
    const consumption = data.consumption || 1; // Default seguro
    const fuelPriceCents = parseStringToCents(data.fuelCost || "0");

    let fuelCostCents = 0;
    if (distance > 0 && fuelPriceCents > 0) {
      const litersNeeded = distance / consumption;
      const roundTripMultiplier = data.isRoundTrip ? 2 : 1;
      fuelCostCents = Math.round(
        litersNeeded * fuelPriceCents * roundTripMultiplier,
      );
    }

    const computedTotal =
      parseStringToCents(data.basePrice) +
      parseStringToCents(data.lodgingCost) +
      parseStringToCents(data.foodCost) +
      fuelCostCents +
      parseStringToCents(data.additionalTransportCost) +
      parseStringToCents(data.extraMachineCosts);

    // Permitimos uma pequena margem de erro de arredondamento (ex: 1 centavo) se necessário,
    // mas idealmente deve bater exato se a lógica for idêntica.
    if (parseStringToCents(data.totalPrice) !== computedTotal) {
      ctx.addIssue({
        path: ["totalPrice"],
        code: z.ZodIssueCode.custom,
        message: `O preço total (${
          data.totalPrice
        }) não bate com a soma (${centsToString(
          computedTotal,
        )}). Verifique os custos.`,
      });
    }
  });

// Types
export type CreateCheckoutFormSchemaType = z.infer<
  typeof createCheckoutFormSchema
>;

export type CustomCheckoutFormSchemaType = Omit<
  CreateCheckoutFormSchemaType,
  "price"
> & {
  price: number;
};

export type CreateCheckoutValidationWithMoneyInCents = Omit<
  CreateCheckoutFormSchemaType,
  | "totalPrice"
  | "basePrice"
  | "extraMachineCosts"
  | "lodgingCost"
  | "foodCost"
  | "fuelCost"
  | "additionalTransportCost"
  | "gears"
  | "paymentInfo"
  | "consumption"
> & {
  basePrice: number;
  extraMachineCosts: number;
  lodgingCost: number;
  foodCost: number;
  fuelCost: number;
  additionalTransportCost: number;
  consumption: number;
  totalPrice: number;
  gears: {
    gearId: string;
    gearName: string;
    individualPrice: number;
  }[];
  paymentInfo: {
    paymentStatus: (typeof paymentStatuses)[number] | undefined;
    firstPaymentDate: Date | null;
    firstPaymentAmount: number | null;
    firstPaymentMethod?: (typeof PaymentMethods)[number];
    firstPaymentStatus: "Pendente" | "Pago" | undefined;
    secondPaymentDate: Date | null;
    secondPaymentAmount: number | null;
    secondPaymentMethod?: (typeof PaymentMethods)[number];
    secondPaymentStatus: "Pendente" | "Pago" | undefined;
  };
};
