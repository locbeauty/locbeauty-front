"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SelectFilials } from "@/components/shared/SelectFilials";
import { DateRangePicker } from "@/components/ui/DatePicker";
import type { DateRange } from "react-day-picker";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { RoutesTable } from "@/components/pages/routes/RoutesTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { FilterBookingStatusTypes } from "@/utils/filterOptions";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";

export default function RoutesPage() {
  const { user } = useAuth();

  const isMaster = user?.role === USER_ROLES.MASTER || user?.role === USER_ROLES.ADMIN;
  const isMotorista = user?.role === USER_ROLES.MOTORISTA;

  // Filiais liberadas para o usuário (undefined = todas, para Master/Admin).
  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.ROUTES);

  // Sem filtro escolhido (lista vazia), a tela mostra TODAS as filiais
  // liberadas — antes o estado inicial era a filial de origem, o que escondia
  // as rotas das demais filiais habilitadas em "Gerenciar Acessos".
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ selectedFilialIds, setSelectedFilialIds ] = useState<string[]>([]);
  const [ dateRange, setDateRange ] = useState<DateRange | undefined>(
    undefined,
  );
  const [ status, setStatus ] = useState<string | undefined>();

  const debouncedSearch = useDebounce(searchQuery, 500);

  // O seletor de filial só faz sentido para quem enxerga mais de uma.
  const canFilterByFilial =
    !isMotorista &&
    (isMaster || (accessibleFilialIds?.length ?? 0) > 1);

  const hasActiveFilters =
    debouncedSearch ||
    dateRange?.from ||
    status ||
    selectedFilialIds.length > 0;

  function clearFilters() {
    setSearchQuery("");
    setDateRange(undefined);
    setStatus(undefined);
    setSelectedFilialIds([]);
  }

  return (
    <RouteGuard module={ SYSTEM_MODULES.ROUTES }>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMotorista ? "Minhas Rotas" : "Rotas"}
          </h1>
          <p className="text-muted-foreground">
            {isMotorista
              ? "Visualize e gerencie as rotas atribuídas a você."
              : "Gerencie as rotas com motoristas atribuídos."}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex md:flex-row flex-col md:items-center gap-3 flex-wrap">

            {/* Gestor: busca por cliente */}
            {!isMotorista && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente..."
                  className="pl-8 placeholder:text-placeholder"
                  value={ searchQuery }
                  onChange={ (e) => setSearchQuery(e.target.value) }
                />
              </div>
            )}

            {/* Seletor de filiais (múltipla escolha) para quem enxerga mais de uma */}
            {canFilterByFilial && (
              <div className="w-full md:w-[220px]">
                <SelectFilials
                  value={ selectedFilialIds }
                  onChange={ setSelectedFilialIds }
                  placeholder="Filtrar por filial"
                  accessibleFilials={ accessibleFilialIds }
                />
              </div>
            )}

            <DateRangePicker
              value={ dateRange }
              onChange={ setDateRange }
              placeholder="Filtrar por período"
              clearable
              classNames={ { trigger: "w-full md:w-[230px]" } }
            />

            {/* Status só para gestores */}
            {!isMotorista && (
              <FilterSelect
                items={ FilterBookingStatusTypes }
                placeholder="Status"
                value={ status }
                onValueChange={ setStatus }
                triggerProps={ { className: "w-full md:w-[180px]" } }
              />
            )}

            {hasActiveFilters && (
              <Button variant="ghost" onClick={ clearFilters } className="h-9 px-3">
                Limpar filtros
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <RoutesTable
          filters={ {
            customerName: !isMotorista ? debouncedSearch || undefined : undefined,
            filialIds: selectedFilialIds,
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            status: !isMotorista ? status : undefined,
          } }
        />
      </div>
    </RouteGuard>
  );
}
