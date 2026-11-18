import { USER_ROLES } from "@/utils/constants";

/**
 * Cargos com acesso à auditoria de agendamentos apagados (Auditoria →
 * "Agendamentos excluídos"): Master, Gerente e Comercial. A regra é por cargo,
 * independente do módulo AUDITORIA — o Comercial não tem Auditoria por padrão.
 *
 * Espelha `DELETED_CHECKOUTS_AUDIT_ROLES` do backend, que é quem de fato
 * barra a consulta; aqui serve só para mostrar ou esconder a tela.
 */
export const DELETED_CHECKOUTS_AUDIT_ROLES: string[] = [
  USER_ROLES.MASTER,
  USER_ROLES.ADMIN,
  USER_ROLES.GERENTE,
  USER_ROLES.COMERCIAL,
];

export function canViewDeletedCheckoutsAudit(role?: string | null): boolean {
  return !!role && DELETED_CHECKOUTS_AUDIT_ROLES.includes(role);
}
