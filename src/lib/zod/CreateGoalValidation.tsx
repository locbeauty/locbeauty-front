import { z } from "zod";

// 1. Schema Base com campos comuns
const baseGoalSchema = z.object({
  filialId: z.string().optional().nullable(),
  year: z.number({ message: "Ano é obrigatório" }),
  monthIndex: z.number(),
  status: z.enum([ "Concluida", "EM_ANDAMENTO", "NAO_ATINGIDA" ]),
  isGlobal: z.boolean().optional(),
});

// 2. Criar um 'discriminatedUnion' para os tipos de meta
export const CreateGoalSchema = z
  .discriminatedUnion("goalType", [
    // Tipo 1: Faturamento (MONEY)
    // targetCents é 'string' pois vem do PriceInput (ex: "1.000,00")
    baseGoalSchema.extend({
      goalType: z.literal("MONEY"),
      targetCents: z
        .string({ message: "Adicione um valor objetivo" })
        .min(1, "O valor é obrigatório"),
      targetQuantity: z.number().optional(), // Opcional
    }),

    // Tipo 2: Máquinas (GEAR)
    // targetQuantity é 'number' pois vem do input type="number"
    baseGoalSchema.extend({
      goalType: z.literal("GEAR"),
      gearId: z.string(),
      targetQuantity: z
        .number({ message: "Adicione uma quantidade" })
        .min(1, "A quantidade é obrigatória"),
      targetCents: z.string().optional(), // Opcional
    }),
  ])
  .refine(
    (data) => {
      // 3. O 'refine' permanece, validando a data
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Permitir criar metas para o mês corrente
      return (
        data.year > currentYear ||
        (data.year === currentYear && data.monthIndex >= currentMonth)
      );
    },
    {
      message: "Não é possível criar metas para meses anteriores",
      path: [ "monthIndex" ], // Aplica o erro ao campo do mês
    }
  );

// 3. Tipos derivados
export type CreateGoalDataType = z.infer<typeof CreateGoalSchema>;

export type CreateGoalDataWithMoneyInCents = Omit<
  CreateGoalDataType,
  "targetCents"
> & {
  targetCents: number | undefined;
};
