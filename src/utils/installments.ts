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
 * Ao editar a parcela `index` para `newAmount`, mantém as parcelas PAGAS fixas
 * e divide o saldo restante igualmente entre as demais (não pagas). A soma final
 * é sempre exatamente igual a `totalCents`.
 */
export function redistributeInstallments(
  installments: Installment[],
  index: number,
  newAmount: number,
  totalCents: number,
): Installment[] {
  const total = Math.max(0, Math.round(totalCents || 0));

  // Parcelas pagas (exceto a editada) têm valor fixo e não entram na divisão.
  const paidSum = installments.reduce(
    (acc, inst, i) =>
      i !== index && inst.paymentStatus === "Pago"
        ? acc + (inst.amount || 0)
        : acc,
    0,
  );
  const budget = Math.max(0, total - paidSum);

  // Índices das demais parcelas editáveis (não pagas, exceto a editada).
  const otherIdx = installments
    .map((inst, i) => ({ inst, i }))
    .filter(({ inst, i }) => i !== index && inst.paymentStatus !== "Pago")
    .map(({ i }) => i);

  // Sem outras parcelas para absorver → a editada assume todo o saldo.
  const edited =
    otherIdx.length === 0
      ? budget
      : Math.max(0, Math.min(Math.round(newAmount || 0), budget));
  const remaining = budget - edited;

  const splits =
    otherIdx.length > 0 ? splitEqual(remaining, otherIdx.length) : [];

  return installments.map((inst, i) => {
    if (i === index) return { ...inst, amount: edited };
    const pos = otherIdx.indexOf(i);
    return pos === -1 ? inst : { ...inst, amount: splits[pos] };
  });
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
