"use client";

import { useCallback } from "react";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { SYSTEM_MODULES } from "@/utils/@types/access";

/**
 * Recorta uma lista de filiais para as que o usuário pode ver no dashboard.
 *
 * Os cards do dashboard buscam `GET /filials`, que devolve todas as filiais
 * para qualquer usuário autenticado. O recorte real vem do Controle de
 * Acessos (`DASHBOARD` com canView), o mesmo que o backend aplica nas
 * métricas — aqui é só para não OFERECER no seletor uma filial cujos números
 * o usuário não receberia.
 *
 * Admin/Master recebem `undefined` do hook de acessos e passam sem filtro.
 */
export function useDashboardFilialFilter() {
  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.DASHBOARD);

  return useCallback(
    <T extends { filialId: string }>(filials: T[]): T[] =>
      accessibleFilialIds
        ? filials.filter((filial) =>
          accessibleFilialIds.includes(filial.filialId),
        )
        : filials,
    [ accessibleFilialIds ],
  );
}
