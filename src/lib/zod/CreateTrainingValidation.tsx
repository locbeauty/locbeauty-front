import { z } from "zod";

// --- Schemas Auxiliares ---

const currencyFieldSchema = z
  .union([z.string(), z.number()])
  .optional()
  .nullable();

// Schema base para os dados de pagamento
const basePaymentInfoSchema = z.object({
  paymentStatus: z
    .enum([
      "Pendente",
      "Pago",
      "Parcial",
      "Cancelado",
      "Reembolsado",
      "Cortesia",
    ])
    .optional(),

  firstPaymentAmount: currencyFieldSchema,
  firstPaymentDate: z.union([z.date(), z.string()]).optional().nullable(),
  firstPaymentMethod: z.string().optional().nullable(),
  firstPaymentStatus: z.string().optional().nullable(),

  secondPaymentAmount: currencyFieldSchema,
  secondPaymentDate: z.union([z.date(), z.string()]).optional().nullable(),
  secondPaymentMethod: z.string().optional().nullable(),
  secondPaymentStatus: z.string().optional().nullable(),
});

// Schema individual de pagamento
export const IndividualPaymentSchema = z
  .object({
    participantId: z.string(), // ID do trainee ou volunteer
    price: z.string().optional(),

    // Custos adicionais (apenas para trainee, mas podemos deixar genérico)
    additionalCost: z.string().optional(),
    additionalCostDescription: z.string().optional(),

    paymentInfo: basePaymentInfoSchema,
  })
  .superRefine((data, ctx) => {
    const currentStatus = data.paymentInfo.paymentStatus || "Pendente";

    if (currentStatus === "Pago" || currentStatus === "Parcial") {
      if (!data.paymentInfo.firstPaymentDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data é obrigatória",
          path: ["paymentInfo", "firstPaymentDate"],
        });
      }
      if (!data.paymentInfo.firstPaymentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Método é obrigatório",
          path: ["paymentInfo", "firstPaymentMethod"],
        });
      }
    }
  });

// --- Schema Principal ---

export const CreateTrainingSchema = z.object({
  hourInMinutes: z.number({ message: "Selecione um horário" }),
  gearId: z.string().cuid({ message: "Selecione um equipamento" }),

  // Mantemos IDs para controle dos seletores de UI (quem está selecionado)
  volunteerIds: z
    .array(z.string().cuid())
    .min(1, { message: "Selecione pelo menos um paciente modelo" }),
  traineeIds: z
    .array(z.string().cuid())
    .min(1, { message: "Selecione pelo menos um aluno" }),

  addressId: z.string().optional().nullable(),
  dueDate: z.date({ message: "Data é obrigatória" }),
  filialId: z.string(),

  // Endereço
  zipCode: z
    .string({ message: "CEP é obrigatório" })
    .min(1, { message: "CEP é obrigatório" }),
  stateName: z.string().optional(),
  cityName: z.string().optional(),
  neighborhoodName: z.string().optional(),
  streetName: z.string().optional(),
  buildingNumber: z.string().min(1, { message: "Número é obrigatório" }),
  addressComplement: z.string().optional().nullable(),

  // Seções de pagamento (Listas)
  // O formulário irá inicializar/manter esses arrays sincronizados com os IDs selecionados
  traineePayments: z.array(IndividualPaymentSchema),
  volunteerPayments: z.array(IndividualPaymentSchema),
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

// Tipo enviado ao backend (omitindo os campos de UI-only e formatando pagamentos)
export type CreateTrainingBackendPayload = Omit<
  CreateTrainingDataType,
  | "traineePayments"
  | "volunteerPayments"
  | "traineeIds"
  | "volunteerIds"
  | "zipCode"
  | "stateName"
  | "cityName"
  | "neighborhoodName"
  | "streetName"
  | "buildingNumber"
  | "addressComplement"
> & {
  // Backend espera arrays com IDs explícitos dentro
  traineePayments: {
    customerId: string;
    price: number;
    additionalCost: number;
    additionalCostDescription?: string;
    paymentInfo: ProcessedPaymentInfo;
  }[];
  volunteerPayments: {
    volunteerId: string;
    price: number;
    paymentInfo: ProcessedPaymentInfo;
  }[];
};
