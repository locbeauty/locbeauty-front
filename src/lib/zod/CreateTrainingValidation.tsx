import { z } from "zod";

// --- Schemas Auxiliares ---

const currencyFieldSchema = z
  .union([ z.string(), z.number() ])
  .optional()
  .nullable();

// Schema base para os dados de pagamento
// CORREÇÃO: paymentStatus agora é .optional() ao invés de .default()
// Isso alinha a tipagem do input do formulário com o React Hook Form
const basePaymentInfoSchema = z.object({
  paymentStatus: z.enum([ "Pendente", "Pago", "Parcial" ]).optional(),

  firstPaymentAmount: currencyFieldSchema,
  firstPaymentDate: z.union([ z.date(), z.string() ]).optional().nullable(),
  firstPaymentMethod: z.string().optional().nullable(),
  firstPaymentStatus: z.string().optional().nullable(),

  secondPaymentAmount: currencyFieldSchema,
  secondPaymentDate: z.union([ z.date(), z.string() ]).optional().nullable(),
  secondPaymentMethod: z.string().optional().nullable(),
  secondPaymentStatus: z.string().optional().nullable(),
});

// Schema refinado
const PaymentSectionSchema = z
  .object({
    price: z.string().optional(),

    additionalCost: z.string().optional(),
    additionalCostDescription: z.string().optional(),

    paymentInfo: basePaymentInfoSchema,
  })
  .superRefine((data, ctx) => {
    // CORREÇÃO: Tratamos o undefined aqui, assumindo "Pendente" se não houver valor
    const currentStatus = data.paymentInfo.paymentStatus || "Pendente";

    // Se o status for "Pago" ou "Parcial", exigimos Data e Método
    if (currentStatus === "Pago" || currentStatus === "Parcial") {
      if (!data.paymentInfo.firstPaymentDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data é obrigatória",
          path: [ "paymentInfo", "firstPaymentDate" ],
        });
      }
      if (!data.paymentInfo.firstPaymentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Método é obrigatório",
          path: [ "paymentInfo", "firstPaymentMethod" ],
        });
      }
    }
  });

// --- Schema Principal ---

export const CreateTrainingSchema = z.object({
  hourInMinutes: z.number({ message: "Selecione um horário" }),
  gearId: z.string().cuid({ message: "Selecione um equipamento" }),

  volunteerIds: z
    .array(z.string().cuid())
    .min(1, { message: "Selecione pelo menos um paciente modelo" }),
  traineeIds: z
    .array(z.string().cuid())
    .min(1, { message: "Selecione pelo menos um aluno" }),
  addressId: z.string().optional().nullable(),
  dueDate: z.date({ message: "Data é obrigatória" }),
  filialId: z.string(),

  // Endereço (opcional, usado se addressId for null)
  zipCode: z.string().optional(),
  stateName: z.string().optional(),
  cityName: z.string().optional(),
  neighborhoodName: z.string().optional(),
  streetName: z.string().optional(),
  buildingNumber: z.string().optional(),
  addressComplement: z.string().optional().nullable(),

  // Seções de pagamento
  traineePayment: PaymentSectionSchema,
  volunteerPayment: PaymentSectionSchema,
});

// --- Tipos ---

export type CreateTrainingDataType = z.infer<typeof CreateTrainingSchema>;

type ProcessedPaymentInfo = {
  paymentStatus: string;
  firstPaymentDate: Date | null;
  firstPaymentAmount: number | null;
  firstPaymentMethod: string | null;
  firstPaymentStatus: string | null;
  secondPaymentDate: Date | null;
  secondPaymentAmount: number | null;
  secondPaymentMethod: string | null;
  secondPaymentStatus: string | null;
};

export type CreateTrainingBackendPayload = Omit<
  CreateTrainingDataType,
  "traineePayment" | "volunteerPayment"
> & {
  traineePayment: {
    price: number;
    additionalCost: number;
    additionalCostDescription?: string;
    paymentInfo: ProcessedPaymentInfo;
  };
  volunteerPayment: {
    price: number;
    paymentInfo: ProcessedPaymentInfo;
  };
};
