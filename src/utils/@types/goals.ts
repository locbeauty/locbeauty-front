export interface Goal {
  goalId: string;
  goalType: "GEAR" | "MONEY";
  year: number;
  monthIndex: number;

  targetCents: number | null;
  currentCents: number | null;
  estimatedCents: number | null;

  targetQuantity: number | null;
  currentQuantity: number | null;
  estimatedQuantity: number | null;

  status: "EM_ANDAMENTO" | "Concluida" | "NAO_ATINGIDA" | "PARCIALMENTE_CONCLUIDA";

  remainingDays: number | null;

  filialId: string;

  createdAt: Date;
  updatedAt: Date;
}
