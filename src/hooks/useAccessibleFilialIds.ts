"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";

// Cargos operacionais (motorista/logística) não têm acesso a BOOKINGS: para
// eles, "filial habilitada" significa ter CALENDAR ou ROUTES liberado. Os dois
// módulos entram juntos para que agenda e rotas nunca divirjam.
const OPERATIONAL_ROLES: string[] = [
  USER_ROLES.MOTORISTA,
  USER_ROLES.MOTORISTA_CHEFE,
  USER_ROLES.LOGISTICA,
];

const OPERATIONAL_MODULES = [
  SYSTEM_MODULES.CALENDAR,
  SYSTEM_MODULES.ROUTES,
];

/**
 * Filiais que o usuário pode visualizar:
 * - Admin/Master → undefined (todas);
 * - Motorista/Motorista Chefe/Logistica → filiais com canView em CALENDAR ou ROUTES;
 * - demais → filiais com canView no módulo informado (padrão: BOOKINGS);
 * - fail-safe ["NO_ACCESS"] quando o usuário restrito não tem permissão alguma.
 */
export function useAccessibleFilialIds(
  module: SYSTEM_MODULES = SYSTEM_MODULES.BOOKINGS,
): string[] | undefined {
  const { user } = useAuth();
  const { accesses } = useAccess();

  return useMemo(() => {
    // Admin/Master can see all
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    const allowedModules = OPERATIONAL_ROLES.includes(user?.role ?? "")
      ? OPERATIONAL_MODULES
      : [ module ];

    const permissions = accesses
      .filter((a) => allowedModules.includes(a.module) && a.canView)
      .map((a) => a.filialId);

    const uniquePermissions = Array.from(new Set(permissions));

    // Fail-safe: if restricted user has no permissions, ensures NO_ACCESS
    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses, module ]);
}
