export const ROLES_ARRAY = [
  "Master",
  "Gerente",
  "Comercial",
  "Financeiro",
  "Logistica",
  "Motorista",
  "Motorista Chefe",
] as const;
export type ROLES = (typeof ROLES_ARRAY)[number];
