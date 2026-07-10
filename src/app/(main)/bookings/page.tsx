"use client";

import { BookingsTable } from "@/components/pages/calendar/BookingsTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FilterBookingPaymentStatusTypes,
  FilterBookingStatusTypes,
} from "@/utils/filterOptions";
import { ROUTES } from "@/utils/routes";
import { Eye, Plus, Search, X, FolderCog } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DateRangePicker } from "@/components/ui/DatePicker";
import type { DateRange } from "react-day-picker";
import { GearFilterSelect } from "@/components/pages/bookings/GearFilterSelect";
import { SelectFilials } from "@/components/shared/SelectFilials";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useAccess } from "@/contexts/access-provider";
import { ImportBookingsDialog } from "@/components/pages/bookings/ImportBookingsDialog";

export default function BookingsPage() {
  const { user } = useAuth();
  const { accesses } = useAccess();
  const [ isImportDialogOpen, setIsImportDialogOpen ] = useState(false);
  const [ customerName, setCustomerName ] = useState("");
  const [ status, setStatus ] = useState<string | undefined>();
  const [ paymentStatus, setPaymentStatus ] = useState<string | undefined>();
  const [ dateRange, setDateRange ] = useState<DateRange | undefined>(
    undefined,
  );
  const [ checkoutId, setCheckoutId ] = useState("");
  // Ids da máquina selecionada (a mesma máquina pode existir em várias filiais).
  const [ gearIds, setGearIds ] = useState<string[] | undefined>();
  const [ filialIds, setFilialIds ] = useState<string[]>([]);

  const accessibleFilialIds = useMemo(() => {
    // Admin/Master can see all
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    // Managers Restricted List (same logic as Table)
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.BOOKINGS && a.canView)
      .map((a) => a.filialId);

    // Removed implicit sourceFilial access to match strict RBAC.

    return Array.from(new Set(permissions));
  }, [ user, accesses ]);

  const clearFilters = () => {
    setCustomerName("");
    setStatus(undefined);
    setPaymentStatus(undefined);
    setDateRange(undefined);
    setCheckoutId("");
    setGearIds(undefined);
    setFilialIds([]);
  };

  const hasActiveFilters =
    customerName ||
    status ||
    paymentStatus ||
    dateRange?.from ||
    checkoutId ||
    (gearIds && gearIds.length > 0) ||
    filialIds.length > 0;

  return (
    <RouteGuard module={ SYSTEM_MODULES.BOOKINGS }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie os agendamentos de locações de equipamentos
            </p>
          </div>
          <div className="flex gap-4">
            <Can module={ SYSTEM_MODULES.BOOKINGS } action="canCreate">
              <Button
                variant="outline"
                className="flex justify-center items-center"
                onClick={ () => setIsImportDialogOpen(true) }
              >
                <FolderCog className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Gerenciar Arquivos</span>
              </Button>
              <Button className="flex justify-center items-center" asChild>
                <Link
                  className="flex justify-center items-center"
                  href={ ROUTES.CREATE_BOOKING }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Novo Agendamento</span>
                </Link>
              </Button>
            </Can>
            <Button
              variant="outline"
              className="flex justify-center items-center"
              asChild
            >
              <Link
                className="flex justify-center items-center"
                href={ ROUTES.SCHEDULE }
              >
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Visualizar Agenda</span>
              </Link>
            </Button>
          </div>
        </div>

        <ImportBookingsDialog
          open={ isImportDialogOpen }
          onOpenChange={ setIsImportDialogOpen }
        />

        <div className="flex flex-col gap-4">
          <div className="flex md:flex-row flex-col md:items-center gap-4 flex-wrap">
            <div className="relative w-full md:w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ID do agendamento"
                className="pl-8 placeholder:text-placeholder"
                value={ checkoutId }
                onChange={ (e) => setCheckoutId(e.target.value) }
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente..."
                className="pl-8 placeholder:text-placeholder"
                value={ customerName }
                onChange={ (e) => setCustomerName(e.target.value) }
              />
            </div>
            {(user?.role === USER_ROLES.ADMIN ||
              user?.role === USER_ROLES.MASTER ||
              (accessibleFilialIds && accessibleFilialIds.length > 0)) && (
              <div className="w-full md:w-[200px]">
                <SelectFilials
                  value={ filialIds }
                  onChange={ setFilialIds }
                  placeholder="Filtrar por filial"
                  accessibleFilials={ accessibleFilialIds }
                />
              </div>
            )}
            <GearFilterSelect
              value={ gearIds }
              onSelect={ setGearIds }
              // Lista as máquinas do mesmo escopo da tabela: filiais filtradas
              // ou tudo que o usuário pode ver (undefined = todas p/ admin).
              filialIds={
                filialIds.length > 0 ? filialIds : accessibleFilialIds
              }
            />
            <DateRangePicker
              value={ dateRange }
              onChange={ setDateRange }
              placeholder="Filtrar por período"
              clearable
              classNames={ { trigger: "w-full md:w-[230px]" } }
            />
            <FilterSelect
              items={ FilterBookingStatusTypes }
              placeholder="Status do agendamento"
              value={ status }
              onValueChange={ setStatus }
              triggerProps={ { className: "w-full md:w-[200px]" } }
            />
            <FilterSelect
              items={ FilterBookingPaymentStatusTypes }
              placeholder="Status do pagamento"
              value={ paymentStatus }
              onValueChange={ setPaymentStatus }
              triggerProps={ { className: "w-full md:w-[200px]" } }
            />
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={ clearFilters }
                className="h-8 px-2 lg:px-3"
              >
                Limpar filtros
                <X className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <BookingsTable
          filters={ {
            customerName,
            status,
            paymentStatus,
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            checkoutId,
            gearIds,
            filialIds: filialIds.length > 0 ? filialIds : undefined,
          } }
        />
      </div>
    </RouteGuard>
  );
}
