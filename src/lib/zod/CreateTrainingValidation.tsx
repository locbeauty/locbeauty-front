import { z } from "zod";

// --- Schemas Auxiliares ---

const currencyFieldSchema = z
  .union([ z.string(), z.number() ])
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
  firstPaymentDate: z.union([ z.date(), z.string() ]).optional().nullable(),
  firstPaymentMethod: z.string().optional().nullable(),
  firstPaymentStatus: z.string().optional().nullable(),

  secondPaymentAmount: currencyFieldSchema,
  secondPaymentDate: z.union([ z.date(), z.string() ]).optional().nullable(),
  secondPaymentMethod: z.string().optional().nullable(),
  secondPaymentStatus: z.string().optional().nullable(),
  wasRefunded: z.boolean().optional(),
  refundedAmount: currencyFieldSchema,
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

  // Mantemos IDs para controle dos seletores de UI (quem está selecionado)
  // Aluno e paciente modelo são opcionais ao criar um treinamento
  volunteerIds: z.array(z.string().cuid()).optional(),
  traineeIds: z.array(z.string().cuid()).optional(),

  addressId: z.string().optional().nullable(),
  dueDate: z.date({ message: "Data é obrigatória" }),
  filialId: z.string(),

  // Endereço
  zipCode: z.string().optional().nullable(),
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

// ===== Reformulação: novo fluxo de criação (participantes + papéis + charges + tipo) =====

export const ExtraChargeSchema = z.object({
  description: z.string().min(1, { message: "Descrição obrigatória" }),
  value: z.string().optional(),
});

export const TrainingParticipantSchema = z.object({
  customerId: z.string(),
  name: z.string().optional(), // UI only
  document: z.string().optional(), // UI only
  // Sem .default() para manter input == output no zodResolver; os valores
  // padrão são fornecidos ao adicionar o participante (append) no formulário.
  isTrainee: z.boolean(),
  isModel: z.boolean(),
  observations: z.string().optional().nullable(),

  // Valores em string (mascarados no input); convertidos para centavos no submit.
  baseValue: z.string().optional(), // treinamento COMUM
  placeGuaranteeValue: z.string().optional(), // MPT: garantia de vaga
  shotsValue: z.string().optional(), // MPT: disparos
  extraCharges: z.array(ExtraChargeSchema), // "Adicionar cobrança"

  paymentStatus: z.enum([ "Pendente", "Pago", "Parcial" ]),
});

export type TrainingParticipantForm = z.infer<typeof TrainingParticipantSchema>;

export const NewTrainingSchema = z
  .object({
    hourInMinutes: z.number({ message: "Selecione um horário" }),
    gearId: z.string().cuid({ message: "Selecione um equipamento" }),
    trainingType: z.enum([ "COMUM", "MPT" ]),
    filialId: z.string(),
    dueDate: z.date({ message: "Data é obrigatória" }),

    addressId: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    stateName: z.string().optional(),
    cityName: z.string().optional(),
    neighborhoodName: z.string().optional(),
    streetName: z.string().optional(),
    buildingNumber: z.string().min(1, { message: "Número é obrigatório" }),
    addressComplement: z.string().optional().nullable(),

    participants: z
      .array(TrainingParticipantSchema)
      .min(1, { message: "Adicione ao menos um participante" })
      .max(15, { message: "Máximo de 15 vagas por turma" }),
  })
  .superRefine((data, ctx) => {
    data.participants.forEach((p, i) => {
      if (!p.isTrainee && !p.isModel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Marque ao menos um papel (aluno ou paciente modelo)",
          path: [ "participants", i, "isTrainee" ],
        });
      }
      if (data.trainingType === "MPT") {
        if (!p.placeGuaranteeValue) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Garantia de vaga é obrigatória (MPT)",
            path: [ "participants", i, "placeGuaranteeValue" ],
          });
        }
        // Disparos é obrigatório apenas para pacientes modelos.
        if (p.isModel && !p.shotsValue) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Valor de disparos é obrigatório (paciente modelo)",
            path: [ "participants", i, "shotsValue" ],
          });
        }
      }
    });
  });

export type NewTrainingDataType = z.infer<typeof NewTrainingSchema>;

// --- Payload enviado ao backend (create) ---
export interface TrainingChargePayload {
  kind: "BASE" | "GARANTIA_VAGA" | "DISPAROS" | "EXTRA";
  description: string;
  amountCents: number;
  isRequired?: boolean;
}

export interface TrainingParticipantPayload {
  customerId: string;
  isTrainee: boolean;
  isModel: boolean;
  observations?: string | null;
  charges: TrainingChargePayload[];
  paymentInfo: { paymentStatus: "Pendente" | "Pago" | "Parcial" };
}

export interface CreateTrainingBackendPayload {
  hourInMinutes: number;
  gearId: string;
  addressId: string;
  dueDate: Date;
  filialId: string;
  trainingType: "COMUM" | "MPT";
  capacity?: number;
  participants: TrainingParticipantPayload[];
}
