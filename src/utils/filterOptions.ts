export const FilterBookingStatusTypes = [
  "Todos",
  "Pendente",
  { value: "Concluido", label: "Concluído" },
  "Cancelado",
] as const;

export const FilterBookingPaymentStatusTypes = [
  "Todos",
  "Pendente",
  "Cancelado",
  "Cortesia",
  "Reembolsado",
  "Parcial",
  "Pago",
] as const;
