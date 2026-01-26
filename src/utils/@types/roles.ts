export const ROLES_ARRAY = [
  "Master",
  "Gerente",
  "Comercial",
  "Financeiro",
  "Logistica",
  "Motorista",
] as const;
export type ROLES = (typeof ROLES_ARRAY)[number];
