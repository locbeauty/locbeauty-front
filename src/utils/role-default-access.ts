import { AccessPermissions, SYSTEM_MODULES } from "@/utils/@types/access";
import { USER_ROLES } from "@/utils/constants";

const FULL: AccessPermissions = { canView: true, canCreate: true, canEdit: true };
const VIEW_ONLY: AccessPermissions = {
  canView: true,
  canCreate: false,
  canEdit: false,
};

export interface RoleModuleAccess {
  module: SYSTEM_MODULES;
  permissions: AccessPermissions;
}

// Todos os módulos que um Gerente administra: tudo, exceto Filiais.
const GERENTE_MODULES: SYSTEM_MODULES[] = [
  SYSTEM_MODULES.DASHBOARD,
  SYSTEM_MODULES.CUSTOMERS,
  SYSTEM_MODULES.GEARS,
  SYSTEM_MODULES.EMPLOYEES,
  SYSTEM_MODULES.BOOKINGS,
  SYSTEM_MODULES.ROUTES,
  SYSTEM_MODULES.CALENDAR,
  SYSTEM_MODULES.GOALS,
  SYSTEM_MODULES.TRAININGS,
  SYSTEM_MODULES.BIRTHDAYS,
  SYSTEM_MODULES.NOTICES,
];

/**
 * Espelho de `src/utils/role-default-access.ts` do backend: o acesso que cada
 * cargo recebe em UMA filial. É o que "Habilitar" concede — habilitar uma
 * filial dá ao funcionário as permissões do cargo dele naquela filial, não
 * acesso total a todos os módulos.
 *
 * Mantenha os dois arquivos em sincronia.
 */
const ROLE_DEFAULT_ACCESS: Record<string, RoleModuleAccess[]> = {
  [USER_ROLES.GERENTE]: [
    ...GERENTE_MODULES.map((module) => ({ module, permissions: FULL })),
    { module: SYSTEM_MODULES.AUDITORIA, permissions: VIEW_ONLY },
  ],

  [USER_ROLES.COMERCIAL]: [
    { module: SYSTEM_MODULES.CUSTOMERS, permissions: FULL },
    { module: SYSTEM_MODULES.GEARS, permissions: FULL },
    { module: SYSTEM_MODULES.BOOKINGS, permissions: FULL },
    { module: SYSTEM_MODULES.TRAININGS, permissions: FULL },
    { module: SYSTEM_MODULES.CALENDAR, permissions: VIEW_ONLY },
  ],

  [USER_ROLES.MOTORISTA]: [
    { module: SYSTEM_MODULES.CALENDAR, permissions: VIEW_ONLY },
    { module: SYSTEM_MODULES.ROUTES, permissions: VIEW_ONLY },
  ],

  // Motorista Chefe: enxerga a filial inteira na agenda/rotas e pode editar
  // agendamentos (inclusive reabrir concluídos), mas não cria agendamentos
  // nem acessa a tabela /bookings.
  [USER_ROLES.MOTORISTA_CHEFE]: [
    { module: SYSTEM_MODULES.CALENDAR, permissions: VIEW_ONLY },
    { module: SYSTEM_MODULES.ROUTES, permissions: VIEW_ONLY },
    {
      module: SYSTEM_MODULES.BOOKINGS,
      permissions: { canView: false, canCreate: false, canEdit: true },
    },
  ],

  [USER_ROLES.LOGISTICA]: [
    { module: SYSTEM_MODULES.CALENDAR, permissions: VIEW_ONLY },
    { module: SYSTEM_MODULES.ROUTES, permissions: VIEW_ONLY },
  ],
};

/**
 * Acesso padrão do cargo em uma filial. Cargos sem padrão definido
 * (Financeiro, Master) devolvem lista vazia.
 */
export function getRoleDefaultAccess(role?: string): RoleModuleAccess[] {
  return ROLE_DEFAULT_ACCESS[role ?? ""] ?? [];
}
