"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";

/**
 * Filiais que o usuário pode visualizar na agenda:
 * - Admin/Master → undefined (todas);
 * - Motorista/Motorista Chefe/Logistica → filiais com canView no módulo CALENDAR;
 * - demais → filiais com canView no módulo BOOKINGS;
 * - fail-safe ["NO_ACCESS"] quando o usuário restrito não tem permissão alguma.
 */
export function useAccessibleFilialIds(): string[] | undefined {
  const { user } = useAuth();
  const { accesses } = useAccess();

  return useMemo(() => {
    // Admin/Master can see all
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    // Motorista/Motorista Chefe/Logistica: derive filial access from CALENDAR module (not BOOKINGS)
    const moduleFilter =
      user?.role === USER_ROLES.MOTORISTA ||
      user?.role === USER_ROLES.MOTORISTA_CHEFE ||
      user?.role === USER_ROLES.LOGISTICA
        ? SYSTEM_MODULES.CALENDAR
        : SYSTEM_MODULES.BOOKINGS;

    const permissions = accesses
      .filter((a) => a.module === moduleFilter && a.canView)
      .map((a) => a.filialId);

    const uniquePermissions = Array.from(new Set(permissions));

    // Fail-safe: if restricted user has no permissions, ensures NO_ACCESS
    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses ]);
}
