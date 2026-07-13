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

/** "YYYY-MM-DD" da data local. */
function toISODay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Interpreta "YYYY-MM-DD" no fuso local (new Date(iso) seria UTC). */
function parseISODay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Soma `months` meses a uma data ISO preservando o dia; quando o dia não
 * existe no mês de destino, usa o último dia (31/01 + 1 mês -> 28/02).
 */
export function addMonthsISO(iso: string, months: number): string | null {
  const base = parseISODay(iso);
  if (!base) return null;
  const day = base.getDate();
  base.setDate(1);
  base.setMonth(base.getMonth() + months);
  const lastDay = new Date(
    base.getFullYear(),
    base.getMonth() + 1,
    0,
  ).getDate();
  base.setDate(Math.min(day, lastDay));
  return toISODay(base);
}

/**
 * Preenche vencimentos ausentes replicando a data da 1ª parcela mês a mês
 * (1ª: 01/07 -> 2ª: 01/08 -> 3ª: 01/09...). O vencimento das parcelas guia a
 * inadimplência de pagamentos parciais, então toda parcela precisa de data.
 * Sem data-base na 1ª parcela, retorna a lista inalterada.
 */
export function fillMissingDueDates(
  installments: Installment[],
): Installment[] {
  const base = installments[0]?.dueDate ?? installments[0]?.paymentDate;
  if (!base) return installments;
  return installments.map((inst, idx) =>
    inst.dueDate ? inst : { ...inst, dueDate: addMonthsISO(base, idx) },
  );
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
