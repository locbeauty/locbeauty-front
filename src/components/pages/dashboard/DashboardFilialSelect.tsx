"use client";

import { SelectFilials } from "@/components/shared/SelectFilials";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { cn } from "@/lib/utils";

interface DashboardFilialSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

/**
 * Seletor de várias filiais dos cards e abas do dashboard. Só oferece as
 * filiais com DASHBOARD liberado no Controle de Acessos — o mesmo recorte que
 * o backend aplica nas métricas. Vazio = todas.
 */
export function DashboardFilialSelect({
  value,
  onChange,
  className,
}: DashboardFilialSelectProps) {
  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.DASHBOARD);

  return (
    <SelectFilials
      value={ value }
      onChange={ onChange }
      accessibleFilials={ accessibleFilialIds }
      className={ cn("w-[180px]", className) }
    />
  );
}
