"use client";

import { BookingsTable } from "@/components/pages/calendar/BookingsTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FilterBookingPaymentStatusTypes,
  FilterBookingStatusTypes,
} from "@/utils/filterOptions";
import { ROUTES } from "@/utils/routes";
import { Eye, Plus, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DatePicker } from "@/components/ui/DatePicker";
import { GearFilterSelect } from "@/components/pages/bookings/GearFilterSelect";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useAccess } from "@/contexts/access-provider";

export default function BookingsPage() {
  const { user } = useAuth();
  const { accesses } = useAccess();
  const [ customerName, setCustomerName ] = useState("");
  const [ status, setStatus ] = useState<string | undefined>();
  const [ paymentStatus, setPaymentStatus ] = useState<string | undefined>();
  const [ date, setDate ] = useState<Date | null>(null);
  const [ checkoutId, setCheckoutId ] = useState("");
  const [ gearId, setGearId ] = useState<string | undefined>();
  const [ filialId, setFilialId ] = useState<string | undefined>();

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
    setDate(null);
    setCheckoutId("");
    setGearId(undefined);
    setFilialId(undefined);
  };

  const hasActiveFilters =
    customerName ||
    status ||
    paymentStatus ||
    date ||
    checkoutId ||
    gearId ||
    filialId;

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
                href={ ROUTES.CALENDAR }
              >
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Visualizar Agenda</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex md:flex-row flex-col md:items-center gap-4 flex-wrap">
            <div className="relative w-full md:w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ID do agendamento"
                className="pl-8"
                value={ checkoutId }
                onChange={ (e) => setCheckoutId(e.target.value) }
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente..."
                className="pl-8"
                value={ customerName }
                onChange={ (e) => setCustomerName(e.target.value) }
              />
            </div>
            {user?.role === USER_ROLES.GERENTE && (
              <div className="w-full md:w-[200px]">
                <SelectFilial
                  value={ filialId }
                  onValueChange={ setFilialId }
                  placeholder="Filtrar por filial"
                  accessibleFilials={ accessibleFilialIds }
                />
              </div>
            )}
            <GearFilterSelect
              value={ gearId }
              onSelect={ setGearId }
              filialId={ filialId || user?.sourceFilial?.filialId }
            />
            <DatePicker
              value={ date }
              onChange={ (d) => setDate(d || null) }
              placeholder="Filtrar por data"
              clearable
              classNames={ { trigger: "w-full md:w-[180px]" } }
            />
            <CustomFilterSelect
              items={ FilterBookingStatusTypes }
              placeholder="Status do agendamento"
              value={ status }
              onValueChange={ setStatus }
              triggerProps={ {
                className: "w-full md:w-[200px]",
                disabled: false,
              } }
            />
            <CustomFilterSelect
              items={ FilterBookingPaymentStatusTypes }
              placeholder="Status do pagamento"
              value={ paymentStatus }
              onValueChange={ setPaymentStatus }
              triggerProps={ {
                className: "w-full md:w-[200px]",
                disabled: false,
              } }
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
            date: date || undefined,
            checkoutId,
            gearId,
            filialIds: filialId ? [ filialId ] : undefined,
          } }
        />
      </div>
    </RouteGuard>
  );
}
