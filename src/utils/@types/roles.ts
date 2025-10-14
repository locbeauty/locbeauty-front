export const ROLES_ARRAY = [ "Gerente", "Comercial", "Financeiro", "Logistica", "Motorista", "Motorista chefe" ] as const;
export type ROLES = (typeof ROLES_ARRAY)[number];
