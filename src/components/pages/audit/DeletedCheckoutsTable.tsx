"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Search, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectFilials } from "@/components/shared/SelectFilials";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
} from "@/components/shared/ListPagination";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "@/components/pages/bookings/common/BookingPaymentStatusBadge";
import { formatCurrency } from "@/components/pages/calendar/bookingViewHelpers";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { GetDeletedCheckouts } from "@/services/checkouts.service";

const COLUMN_COUNT = 10;

/** ID curto do agendamento — mesmo formato usado nas importações. */
function shortId(checkoutId: string) {
  return `#${checkoutId.slice(-6)}`;
}

export function DeletedCheckoutsTable() {
  const { user } = useAuth();
  const { accesses } = useAccess();

  const [ customerName, setCustomerName ] = useState("");
  const [ deletedByName, setDeletedByName ] = useState("");
  const [ filialIds, setFilialIds ] = useState<string[]>([]);
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(DEFAULT_PAGE_SIZE);

  const debouncedCustomerName = useDebounce(customerName);
  const debouncedDeletedByName = useDebounce(deletedByName);

  // Filiais que o usuário pode ver na Auditoria — restringe o seletor.
  const accessibleFilialIds = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.AUDITORIA && a.canView)
      .map((a) => a.filialId);

    return Array.from(new Set(permissions));
  }, [ user, accesses ]);

  const hasActiveFilters =
    customerName !== "" || deletedByName !== "" || filialIds.length > 0;

  // Qualquer mudança de filtro volta para a primeira página, senão o usuário
  // pode cair numa página vazia.
  useEffect(() => {
    setPage(1);
  }, [ filialIds, debouncedCustomerName, debouncedDeletedByName ]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "deleted-checkouts",
      filialIds,
      debouncedCustomerName,
      debouncedDeletedByName,
      page,
      limit,
    ],
    queryFn: () =>
      GetDeletedCheckouts(
        {
          ...(filialIds.length > 0 ? { filialIds } : {}),
          ...(debouncedCustomerName
            ? { customerName: debouncedCustomerName }
            : {}),
          ...(debouncedDeletedByName
            ? { deletedByName: debouncedDeletedByName }
            : {}),
        },
        { page, limit },
      ),
  });

  const logs = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  function clearFilters() {
    setCustomerName("");
    setDeletedByName("");
    setFilialIds([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-end">
        <div className="w-full space-y-1 md:w-[240px]">
          <Label className="text-xs">Cliente</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Nome do cliente..."
              className="placeholder:text-placeholder pl-8"
              value={ customerName }
              onChange={ (e) => setCustomerName(e.target.value) }
            />
          </div>
        </div>

        <div className="w-full space-y-1 md:w-[220px]">
          <Label className="text-xs">Excluído por</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Nome do funcionário..."
              className="placeholder:text-placeholder pl-8"
              value={ deletedByName }
              onChange={ (e) => setDeletedByName(e.target.value) }
            />
          </div>
        </div>

        <div className="w-full space-y-1 md:w-[200px]">
          <Label className="text-xs">Filial</Label>
          <SelectFilials
            value={ filialIds }
            onChange={ setFilialIds }
            placeholder="Todas as filiais"
            accessibleFilials={ accessibleFilialIds }
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={ clearFilters }
            className="h-9 px-2 md:ml-auto lg:px-3"
          >
            Limpar filtros
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Agendado para</TableHead>
              <TableHead>Máquinas</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Excluído por</TableHead>
              <TableHead>Excluído em</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={ COLUMN_COUNT } className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={ COLUMN_COUNT }
                  className="text-muted-foreground py-8 text-center"
                >
                  {hasActiveFilters
                    ? "Nenhum agendamento excluído encontrado com esses filtros."
                    : "Nenhum agendamento excluído registrado."}
                </TableCell>
              </TableRow>
            )}

            {logs.map((log) => (
              <TableRow key={ log.id }>
                <TableCell
                  className="text-muted-foreground font-mono text-xs"
                  title={ log.checkoutId }
                >
                  {shortId(log.checkoutId)}
                </TableCell>
                <TableCell className="max-w-[220px] truncate font-medium">
                  {log.customerName}
                </TableCell>
                <TableCell>{log.Filial?.filialName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.checkoutDate), "dd/MM/yyyy")}
                  { " " }
                  <span className="text-muted-foreground">
                    {minutesToHHMM(log.startHourInMinutes)}
                  </span>
                </TableCell>
                <TableCell
                  className="max-w-[220px] truncate"
                  title={ log.gearNames }
                >
                  {log.gearNames || "—"}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(log.totalPrice / 100)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <BookingStatusBadge status={ log.checkoutStatus } />
                    {log.paymentStatus && (
                      <BookingPaymentStatusBadge
                        status={ log.paymentStatus }
                        isCourtesy={ log.isCourtesy }
                        small
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {log.deletedByName}
                  {log.notes && (
                    <span className="text-muted-foreground block text-xs">
                      {log.notes}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {log.restoredAt ? (
                    <>
                      <Badge variant="secondary">Restaurado</Badge>
                      <span className="text-muted-foreground block text-xs whitespace-nowrap">
                        {format(new Date(log.restoredAt), "dd/MM/yyyy HH:mm")}
                        {log.restoredByName ? ` · ${log.restoredByName}` : ""}
                      </span>
                    </>
                  ) : (
                    <Badge variant="destructive">Excluído</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ListPagination
        page={ page }
        limit={ limit }
        totalItems={ total }
        onPageChange={ setPage }
        onLimitChange={ (newLimit) => {
          setPage(1);
          setLimit(newLimit);
        } }
        itemLabel="agendamento(s)"
      />
    </div>
  );
}
