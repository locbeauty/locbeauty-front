export const PaymentMethods = [
  "PIX",
  "Transferência",
  "Débito",
  "Crédito",
  "Dinheiro",
] as const;
export const paymentModes = [ "Parcelado", "AVista" ] as const;
export const paymentStatuses = [
  "Pendente",
  "Pago",
  "Parcial",
  "Reembolsado",
  "Cortesia",
  "Cancelado",
] as const;
export const checkoutStatuses = [ "Pendente", "Concluido", "Cancelado" ] as const;

export type CheckoutStatuses = (typeof checkoutStatuses)[number];
export type PaymentStatuses = (typeof paymentStatuses)[number];
export type PaymentModes = (typeof paymentModes)[number];

export const goalStatuses = [
  "EM_ANDAMENTO",
  "Concluida",
  "NAO_ATINGIDA",
  "PARCIALMENTE_CONCLUIDA",
] as const;

export type GoalStatuses = (typeof goalStatuses)[number];

// User Roles
export const USER_ROLES = {
  GERENTE: "Gerente",
  ADMIN: "ADMIN",
  MASTER: "MASTER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
