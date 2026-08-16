/**
 * Segmentos de acompanhamento de clientes, calculados sobre um mês de
 * referência (por padrão, o mês corrente). Espelha
 * `src/utils/customer-segments.ts` do backend — mantenha os dois em sincronia.
 *
 * Agendamentos cancelados não contam como "agendou": quem teve a locação
 * cancelada precisa aparecer na lista de retomada.
 */
export const CUSTOMER_SEGMENTS = [
  "NOVOS_DO_MES",
  "SEM_AGENDAMENTO_PROXIMO_MES",
  "SEM_AGENDAMENTO_ESTE_MES",
] as const;

export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];

interface CustomerSegmentOption {
  value: CustomerSegment;
  /** Rótulo curto, para o seletor de filtro. */
  label: string;
  /** Explicação da regra, para o card do dashboard. */
  description: string;
}

export const CUSTOMER_SEGMENT_OPTIONS: CustomerSegmentOption[] = [
  {
    value: "NOVOS_DO_MES",
    label: "Novos do mês",
    description: "Clientes cadastrados no mês.",
  },
  {
    value: "SEM_AGENDAMENTO_PROXIMO_MES",
    label: "Sem agendamento no próximo mês",
    description:
      "Agendaram no mês, mas não têm nada marcado para o mês seguinte.",
  },
  {
    value: "SEM_AGENDAMENTO_ESTE_MES",
    label: "Sem agendamento neste mês",
    description: "Agendaram no mês anterior, mas não voltaram a agendar.",
  },
];

export function getCustomerSegmentOption(
  segment: CustomerSegment,
): CustomerSegmentOption | undefined {
  return CUSTOMER_SEGMENT_OPTIONS.find((option) => option.value === segment);
}
