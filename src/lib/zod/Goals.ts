import { z } from "zod";

export const FilterGoalsSchema = z
  .object({
    filterFilial: z.string().optional(),
    filterStatus: z.string().optional(),
    filterStartYear: z.string().optional(),
    filterStartMonth: z.string().optional(),
    filterEndYear: z.string().optional(),
    filterEndMonth: z.string().optional(),
  })
  .refine((data) => {
    if (!data.filterStartYear || !data.filterStartMonth) return true;
    if (!data.filterEndYear || !data.filterEndMonth) return true;

    const startYear = parseInt(data.filterStartYear, 10);
    const endYear = parseInt(data.filterEndYear, 10);
    const startMonth = parseInt(data.filterStartMonth, 10);
    const endMonth = parseInt(data.filterEndMonth, 10);

    if (isNaN(startYear) || isNaN(endYear) || isNaN(startMonth) || isNaN(endMonth)) {
      return false;
    }

    if (startYear > endYear) return false;
    if (startYear === endYear && startMonth > endMonth) return false;

    return true;
  }, {
    message: "A data inicial não pode ser posterior à data final.",
    path: [ "filterStartYear" ],
  });

export type filterGoalsType = z.infer<typeof FilterGoalsSchema>

export type StatusMeta = "Concluida" | "EM_ANDAMENTO" | "NAO_ATINGIDA" | "PARCIALMENTE_CONCLUIDA"