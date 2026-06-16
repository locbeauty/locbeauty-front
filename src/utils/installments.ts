import { Installment, InstallmentStatus } from "./@types/payments";

// Utilitários de parcelamento (N parcelas iguais) no front. Valores em centavos.

/**
 * Divide `totalCents` em `count` parcelas iguais. O resto da divisão é
 * distribuído 1 centavo nas primeiras parcelas, de modo que a soma seja sempre
 * exatamente igual ao total. Ex.: splitEqual(5000, 3) => [1667, 1667, 1666].
 */
export function splitEqual(totalCents: number, count: number): number[] {
  const n = Math.max(1, Math.floor(count || 1));
  const total = Math.max(0, Math.round(totalCents || 0));
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function sumPaid(installments: Installment[]): number {
  return installments
    .filter((i) => i.paymentStatus === "Pago")
    .reduce((acc, i) => acc + (i.amount || 0), 0);
}

export function sumPending(installments: Installment[]): number {
  return installments
    .filter((i) => i.paymentStatus !== "Pago")
    .reduce((acc, i) => acc + (i.amount || 0), 0);
}

export function sumTotal(installments: Installment[]): number {
  return installments.reduce((acc, i) => acc + (i.amount || 0), 0);
}

/** nenhuma paga -> "Pendente"; todas pagas -> "Pago"; parte paga -> "Parcial". */
export function deriveStatus(
  installments: Installment[],
): "Pendente" | "Parcial" | "Pago" {
  if (!installments.length) return "Pendente";
  const paid = installments.filter((i) => i.paymentStatus === "Pago").length;
  if (paid === 0) return "Pendente";
  if (paid === installments.length) return "Pago";
  return "Parcial";
}

/**
 * Monta a lista de parcelas preservando data/forma/status das parcelas já
 * existentes (mesmo índice) ao recalcular os valores.
 */
export function buildInstallments(
  totalCents: number,
  count: number,
  existing?: Installment[],
): Installment[] {
  const amounts = splitEqual(totalCents, count);
  return amounts.map((amount, idx) => {
    const prev = existing?.[idx];
    const paymentStatus: InstallmentStatus = prev?.paymentStatus ?? "Pendente";
    return {
      number: idx + 1,
      amount,
      dueDate: prev?.dueDate ?? null,
      paymentDate: prev?.paymentDate ?? null,
      paymentMethod: prev?.paymentMethod ?? null,
      paymentStatus,
    };
  });
}
