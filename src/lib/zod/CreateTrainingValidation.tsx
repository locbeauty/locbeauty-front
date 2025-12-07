import { z } from "zod";
import { checkoutPaymentDataSchema } from "./CreateBookingValidation";

// Helper para aceitar String (do input mask) ou Number (do defaultValues)
// Não fazemos transform aqui para não quebrar a máscara do input no frontend.
// A conversão para centavos será feita APENAS no onSubmit.
const currencyFieldSchema = z.union([ z.string(), z.number() ])
    .optional()
    .nullable();

export const CreateTrainingSchema = z.object({
    // Horários
    hourInMinutes: z.number({ message: "Selecione um horário" }),
    // minute: z.coerce.number({ message: "Selecione um horário" }).int().min(0).max(59),

    // IDs
    gearId: z.string({ message: "Selecione um equipamento" }).cuid(),
    volunteerId: z.string({ message: "Selecione um paciente modelo" }).cuid(),
    traineeId: z.string({ message: "Selecione um aluno" }).cuid(),
    addressId: z.string({ message: "Selecione um endereço" }).cuid(),

    // Data
    dueDate: z.date({ message: "Data é obrigatória" }),

    filialId: z.string(),

    // Financeiro (Input do Formulário aceita string formatada ou número)
    // price: currencyFieldSchema,
    price: z.string().optional(),

    additionalCost: z.string().optional(),
    additionalCostDescription: z.string().optional().or(z.literal("")),

    // Reutilizamos o schema do checkout, mas lembre-se que ele valida os INPUTS (strings formatadas)
    paymentInfo: checkoutPaymentDataSchema,
});

// 1. Tipo para o useForm (Reflete os Inputs do Frontend)
export type CreateTrainingDataType = z.infer<typeof CreateTrainingSchema>;

// 2. Tipo para o Backend (Reflete os dados processados/limpos)
export type CreateTrainingBackendPayload = Omit<
  CreateTrainingDataType,
  "paymentInfo" | "price" | "additionalCost"
> & {
  // Substituímos os campos híbridos por campos estritos (number)
  price: number;
  additionalCost: number;

  // Redefinimos paymentInfo para garantir que amounts sejam number
  paymentInfo: {
    paymentStatus: string | undefined;

    firstPaymentDate: Date | null;
    firstPaymentAmount: number | null; // Backend espera number (centavos)
    firstPaymentMethod?: string;
    firstPaymentStatus: "Pendente" | "Pago" | undefined;

    secondPaymentDate: Date | null;
    secondPaymentAmount: number | null; // Backend espera number (centavos)
    secondPaymentMethod?: string;
    secondPaymentStatus: "Pendente" | "Pago" | undefined;
  };
};