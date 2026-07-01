"use client";

import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { Checkout } from "@/utils/@types/checkouts";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { ApiResponse } from "@/lib/api";
import {
  GetAllCheckouts,
  UpdateCheckout,
  DeleteCheckout,
} from "@/services/checkouts.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingDetailsDialog } from "./DetailsDialog/BookingDetailsDialog";
import {
  ChevronLeft,
  ChevronsLeft,
  Eye,
  Pencil,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BookingsTableProps {
  filters?: BookingsTableFilters;
}

export interface BookingsTableFilters {
  customerName?: string;
  status?: string;
  paymentStatus?: string;
  date?: Date;
  checkoutId?: string;
  gearId?: string;
  filialIds?: string[];
}

import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useMemo, useState, useEffect } from "react";

export function BookingsTable({ filters }: BookingsTableProps) {
  const { user } = useAuth();
  const { accesses } = useAccess();
  const [ isBookingDetailsDialogOpen, setBookingDetailsDialogOpen ] =
    useState(false);
  const [ selectedCheckout, setSelectedCheckout ] = useState<Checkout | null>(
    null,
  );
  const [ pagination, setPagination ] = useState({ page: 1, limit: 10 });
  const [ isVisible, setIsVisible ] = useState(true);
  const [ checkoutToRestore, setCheckoutToRestore ] = useState<Checkout | null>(
    null,
  );
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);

  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ checkoutToDelete, setCheckoutToDelete ] = useState<string | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);

  const queryClient = useQueryClient();

  const accessibleFilialIds = useMemo(() => {
    // Superusers can view all filials
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    // For regular employees and managers, gather allowed filials
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.BOOKINGS && a.canView)
      .map((a) => a.filialId);

    const uniquePermissions = Array.from(new Set(permissions));

    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

  const finalFilialIds = useMemo(() => {
    // If accessibleFilialIds is undefined, it means SUPERUSER (All Access)
    // If accessibleFilialIds is an array (even with NO_ACCESS), we are RESTRICTED.
    const isRestricted = accessibleFilialIds !== undefined;

    // If specific filters are applied
    if (filters?.filialIds && filters.filialIds.length > 0) {
      if (isRestricted && accessibleFilialIds) {
        // Intersect filter with permissions
        const filtered = filters.filialIds.filter((id) =>
          accessibleFilialIds.includes(id),
        );
        return filtered.length > 0 ? filtered : [ "NO_ACCESS" ];
      }
      return filters.filialIds;
    }

    // If no filters, and we are restricted, return our allowed list (which already handles empty -> NO_ACCESS)
    if (isRestricted) {
      return accessibleFilialIds;
    }

    return undefined; // Superuser accessing all
  }, [ filters?.filialIds, accessibleFilialIds ]);

  const queryParams: Record<
    string,
    string | number | boolean | Date | string[] | undefined | null
  > = {
    ...filters,
    filialIds: finalFilialIds,
    page: pagination.page,
    limit: pagination.limit,
    isVisible,
    // "Todos" significa "sem filtro" → não enviar ao servidor.
    status:
      filters?.status && filters.status !== "Todos" ? filters.status : undefined,
    paymentStatus:
      filters?.paymentStatus && filters.paymentStatus !== "Todos"
        ? filters.paymentStatus
        : undefined,
  };

  const { data, isLoading } = useQuery<
    ApiResponse<{ items: Checkout[]; total: number }>,
    Error
  >({
    queryKey: [ "get-all-checkouts", queryParams ],
    queryFn: () => GetAllCheckouts({ queryParams: queryParams || {} }),
    staleTime: 1000 * 60,
    enabled: !!user,
  });

  const totalCheckouts = data?.data?.total || 0;
  const totalPages = Math.ceil(totalCheckouts / pagination.limit);

  // A filtragem (filial, máquina, data, status, pagamento) é feita no servidor,
  // que já devolve os itens filtrados e paginados.
  const checkouts = data?.data?.items || [];

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ filters ]);

  const isEmpty = !isLoading && (!checkouts || checkouts.length === 0);

  const handleRestoreCheckout = (checkout: Checkout) => {
    setCheckoutToRestore(checkout);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreCheckout = async () => {
    if (!checkoutToRestore) return;
    const targetId = checkoutToRestore.checkoutId;

    setIsRestoring(true);
    try {
      const response = await UpdateCheckout({
        checkoutId: targetId,
        body: { isVisible: true },
      });

      if (
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        response.statusCode === 204
      ) {
        toast.success("Agendamento restaurado com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
      } else {
        toast.error(response.message || "Erro ao restaurar agendamento.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar agendamento.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      setCheckoutToRestore(null);
    }
  };

  const handleDeleteCheckout = async () => {
    if (!checkoutToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteCheckout(checkoutToDelete);
      if (
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        response.statusCode === 204
      ) {
        toast.success("Agendamento excluído com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
      } else {
        toast.error(response.message || "Erro ao excluir agendamento.");
      }
    } catch (error) {
      toast.error("Erro ao excluir agendamento.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setCheckoutToDelete(null);
    }
  };

  const openCheckoutDetails = ({ checkoutId }: { checkoutId: string }) => {
    if (!checkouts) return;

    const checkout = checkouts.find((c) => c.checkoutId === checkoutId);
    if (!checkout) return;

    const startDate = new Date(checkout.date);
    startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
    startDate.setMinutes(checkout.startHourInMinutes % 60);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + checkout.totalDurationInMinutes);

    setSelectedCheckout(checkout);
    setBookingDetailsDialogOpen(true);
  };

  return (
    <>
      {(user?.role === USER_ROLES.MASTER ||
        user?.role === USER_ROLES.ADMIN) && (
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="show-deleted"
            checked={ !isVisible }
            onCheckedChange={ (checked) => {
              setIsVisible(!checked);
              queryClient.invalidateQueries({
                queryKey: [ "get-all-checkouts" ],
              });
            } }
          />
          <Label htmlFor="show-deleted">Ver Excluídos</Label>
        </div>
      )}

      <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-sm">Cliente</th>
              <th className="text-left p-3 font-medium text-sm">Filial</th>
              <th className="text-left p-3 font-medium text-sm">Equipamento</th>
              <th className="text-center p-3 font-medium text-sm">Data</th>
              <th className="text-center p-3 font-medium text-sm">
                Horário inicial
              </th>
              <th className="text-center p-3 font-medium text-sm">
                Horário final
              </th>
              <th className="p-3 font-medium text-center">Status</th>
              <th className="p-3 font-medium text-center">Pagamento</th>
              <th className="p-3 font-medium text-center">Detalhes</th>
              {(user?.role === USER_ROLES.MASTER ||
                user?.role === USER_ROLES.ADMIN) && (
                <th className="p-3 font-medium text-center">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isEmpty && (
              <tr>
                <td className="text-center p-4" colSpan={ 10 }>
                  Nada a mostrar por aqui.
                </td>
              </tr>
            )}
            {checkouts ? (
              checkouts.map((checkout) => {
                return (
                  <tr
                    key={ checkout.checkoutId }
                    className="border-t hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm">
                      {checkout.Customer.fullname}
                    </td>
                    <td className="p-3 text-sm">
                      {checkout.SourceFilial?.filialName || "N/A"}
                    </td>
                    <td className="p-3 text-sm">
                      {checkout.Bookings.map((b) => b.Gear.gearName).join(", ")}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {new Date(checkout.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {minutesToHHMM(checkout.startHourInMinutes)}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {minutesToHHMM(
                        checkout.startHourInMinutes +
                          checkout.totalDurationInMinutes,
                      )}
                    </td>
                    <td className="p-3 text-center text-sm">
                      <BookingStatusBadge status={ checkout.checkoutStatus } />
                    </td>
                    <td className="p-3 text-center">
                      <BookingPaymentStatusBadge
                        status={ checkout.CheckoutPayment?.paymentStatus }
                        wasRefunded={ checkout.wasRefunded }
                        isCourtesy={ checkout.isCourtesy }
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={ () =>
                          openCheckoutDetails({
                            checkoutId: checkout.checkoutId,
                          })
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                    {(user?.role === USER_ROLES.MASTER ||
                      user?.role === USER_ROLES.ADMIN) && (
                      <td className="p-3 text-center">
                        {!isVisible ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={ () => handleRestoreCheckout(checkout) }
                            disabled={ isRestoring }
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={ () => {
                              setCheckoutToDelete(checkout.checkoutId);
                              setIsDeleteConfirmationDialogOpen(true);
                            } }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={ 10 }
                  className="p-4 text-center text-muted-foreground"
                >
                  Carregando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {isEmpty && (
          <div className="text-center p-4 text-muted-foreground bg-white rounded-lg border">
            Nada a mostrar por aqui.
          </div>
        )}
        {checkouts?.map((checkout) => (
          <ResponsiveCard
            key={ checkout.checkoutId }
            cardData={ {
              id: checkout.checkoutId,
              title: checkout.Customer.fullname,
              items: [
                {
                  itemLabel: "Equipamento: ",
                  itemInfo: checkout.Bookings.map((b) => b.Gear.gearName).join(
                    ", ",
                  ),
                },
                {
                  itemLabel: "Filial: ",
                  itemInfo: checkout.SourceFilial?.filialName || "N/A",
                },
                {
                  itemLabel: "Data: ",
                  itemInfo: new Date(checkout.date).toLocaleDateString("pt-BR"),
                },
                {
                  itemLabel: "Horário: ",
                  itemInfo: `${minutesToHHMM(
                    checkout.startHourInMinutes,
                  )} - ${minutesToHHMM(
                    checkout.startHourInMinutes +
                      checkout.totalDurationInMinutes,
                  )}`,
                },
                {
                  itemLabel: "Status: ",
                  itemInfo: (
                    <BookingStatusBadge status={ checkout.checkoutStatus } />
                  ),
                },
                {
                  itemLabel: "Pagamento: ",
                  itemInfo: (
                    <BookingPaymentStatusBadge
                      status={ checkout.CheckoutPayment?.paymentStatus }
                      wasRefunded={ checkout.wasRefunded }
                      isCourtesy={ checkout.isCourtesy }
                    />
                  ),
                },
              ],
            } }
            rawData={ checkout }
            handleToggleDialog={ () =>
              openCheckoutDetails({ checkoutId: checkout.checkoutId })
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4 px-4 bg-white border-t">
        <div className="flex-1 text-sm text-muted-foreground hidden md:block">
          {totalCheckouts} agendamento(s) encontrado(s)
        </div>
        <div className="space-x-2 flex items-center justify-center w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(1) }
            disabled={ pagination.page === 1 }
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(pagination.page - 1) }
            disabled={ pagination.page === 1 }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {(() => {
              const MAX_VISIBLE_PAGES = 5;
              const pages = [];
              let startPage = Math.max(
                1,
                pagination.page - Math.floor(MAX_VISIBLE_PAGES / 2),
              );
              const endPage = Math.min(
                totalPages,
                startPage + MAX_VISIBLE_PAGES - 1,
              );

              if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
                startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={ i }
                    variant={ pagination.page === i ? "default" : "outline" }
                    size="sm"
                    className="h-8 w-8"
                    onClick={ () => handlePageChange(i) }
                  >
                    {i}
                  </Button>,
                );
              }
              return pages;
            })()}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(pagination.page + 1) }
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(totalPages) }
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      <BookingDetailsDialog
        isOpen={ isBookingDetailsDialogOpen }
        onOpenChange={ setBookingDetailsDialogOpen }
        selectedCheckout={ selectedCheckout }
        setSelectedCheckout={ setSelectedCheckout }
      />

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ (open) => {
          setIsRestoreConfirmationDialogOpen(open);
          if (!open) {
            setCheckoutToRestore(null);
          }
        } }
        title="Restaurar Agendamento"
        description="Tem certeza que deseja restaurar este agendamento?"
        onConfirm={ confirmRestoreCheckout }
        isRestoring={ isRestoring }
        itemName={ checkoutToRestore?.Customer?.fullname || "agendamento" }
      />

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteCheckout }
        title="Excluir Agendamento"
        description="Tem certeza que deseja excluir este agendamento?"
        itemName={
          checkouts?.find((c) => c.checkoutId === checkoutToDelete)?.Customer
            ?.fullname || "agendamento"
        }
        isDeleting={ isDeleting }
      />
    </>
  );
}
