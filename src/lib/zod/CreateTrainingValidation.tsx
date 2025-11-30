// import { z } from "zod";
// import { checkoutPaymentDataSchema } from "./CreateBookingValidation";

// export const CreateTrainingSchema = z.object({
//     // Horários continuam como números para o backend
//     hour: z.number({ message: "Selecione um horário" }).int().min(0).max(23),
//     minute: z.number({ message: "Selecione um horário" }).int().min(0).max(59),

//     // IDs
//     gearId: z.string({ message: "Selecione um equipamento" }).cuid(),
//     professorId: z.string({ message: "Selecione um paciente modelo" }).cuid(),
//     studentId: z.string({ message: "Selecione um aluno" }).cuid(),
//     addressId: z.string({ message: "Selecione um endereço" }).cuid(),

//     // Data
//     dueDate: z.date({ message: "Data é obrigatória" }),

//     // Financeiro
//     // .optional().or(z.literal("")) permite que o campo venha vazio do input
//     price: z.string().optional().or(z.literal("")),
//     additionalCost: z.string().optional().or(z.literal("")),
//     additionalCostDescription: z.string().optional().or(z.literal("")),

//     paymentInfo: checkoutPaymentDataSchema, // Usa o esquema aninhado acima

// });

// export type CreateTrainingDataType = z.infer<typeof CreateTrainingSchema>;

// export type CreateTrainingValidationWithMoneyInCents = Omit<
//   CreateTrainingDataType,
//   | "totalPrice"
//   | "basePrice"
//   | "extraMachineCosts"
//   | "lodgingCost"
//   | "foodCost"
//   | "fuelCost"
//   | "additionalTransportCost"
//   | "gears"
//   | "paymentInfo"
// > & {
//   basePrice: number;
//   extraMachineCosts: number;
//   lodgingCost: number;
//   foodCost: number;
//   fuelCost: number;
//   additionalTransportCost: number;
//   totalPrice: number;
//   gears: {
//     gearId: string;
//     gearName: string;
//     individualPrice: number;
//   }[];
//   paymentInfo: {
//     paymentStatus: (typeof paymentStatuses)[number] | undefined;
//     firstPaymentDate: Date | null;
//     firstPaymentAmount: number | null;
//     firstPaymentMethod?: (typeof PaymentMethods)[number];
//     firstPaymentStatus: "Pendente" | "Pago" | undefined;
//     secondPaymentDate: Date | null;
//     secondPaymentAmount: number | null;
//     secondPaymentMethod?: (typeof PaymentMethods)[number];
//     secondPaymentStatus: "Pendente" | "Pago" | undefined;
//   };
// };

// import { z } from "zod";
// import { checkoutPaymentDataSchema } from "./CreateBookingValidation";

// // Helper para transformar string numérica (ex: "100" ou "") em number (100 ou 0)
// // Se quiser permitir null em vez de 0, altere o "|| 0" para "|| null"
// const stringToNumber = z.union([ z.string(), z.number() ])
//     .transform((val) => {
//         if (val === "" || val === undefined || val === null) return 0;
//         return Number(val);
//     });

// export const CreateTrainingSchema = z.object({
//     // Horários
//     hour: z.coerce.number({ message: "Selecione um horário" }).int().min(0).max(23),
//     minute: z.coerce.number({ message: "Selecione um horário" }).int().min(0).max(59),

//     // IDs
//     gearId: z.string({ message: "Selecione um equipamento" }).cuid(),
//     professorId: z.string({ message: "Selecione um paciente modelo" }).cuid(),
//     studentId: z.string({ message: "Selecione um aluno" }).cuid(),
//     addressId: z.string({ message: "Selecione um endereço" }).cuid(),

//     // Data
//     dueDate: z.date({ message: "Data é obrigatória" }),

//     // Financeiro (Agora transforma automaticamente para number)
//     price: stringToNumber,
//     additionalCost: stringToNumber,
//     additionalCostDescription: z.string().optional().or(z.literal("")),

//     paymentInfo: checkoutPaymentDataSchema,
// });

// // Tipo inferido diretamente do Zod (já virá com numbers graças ao transform)
// export type CreateTrainingDataType = z.infer<typeof CreateTrainingSchema>;

// // Tipo refinado para garantir tipagem estrita no Backend/Service
// export type CreateTrainingValidationWithMoneyInCents = Omit<
//   CreateTrainingDataType,
//   "paymentInfo" // Removemos para redefinir com os tipos exatos abaixo
// > & {
//   // Garantindo que são números (o Zod já garante, mas reforçamos aqui)
//   price: number;
//   additionalCost: number;

//   // Redefinindo paymentInfo para garantir que amounts sejam number
//   paymentInfo: {
//     paymentStatus: string | undefined; // Ou use seu Enum específico aqui

//     firstPaymentDate: Date | null;
//     firstPaymentAmount: number | null; // Forçando number
//     firstPaymentMethod?: string; // Ou seu Enum
//     firstPaymentStatus: "Pendente" | "Pago" | undefined;

//     secondPaymentDate: Date | null;
//     secondPaymentAmount: number | null; // Forçando number
//     secondPaymentMethod?: string; // Ou seu Enum
//     secondPaymentStatus: "Pendente" | "Pago" | undefined;
//   };
// };

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
    hour: z.coerce.number({ message: "Selecione um horário" }).int().min(0).max(23),
    minute: z.coerce.number({ message: "Selecione um horário" }).int().min(0).max(59),

    // IDs
    gearId: z.string({ message: "Selecione um equipamento" }).cuid(),
    professorId: z.string({ message: "Selecione um paciente modelo" }).cuid(),
    studentId: z.string({ message: "Selecione um aluno" }).cuid(),
    addressId: z.string({ message: "Selecione um endereço" }).cuid(),

    // Data
    dueDate: z.date({ message: "Data é obrigatória" }),

    // Financeiro (Input do Formulário aceita string formatada ou número)
    price: currencyFieldSchema,
    additionalCost: currencyFieldSchema,
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