"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { GetAllCheckouts, UpdateCheckoutStatus } from "@/services/checkouts.service";
import { Checkout } from "@/utils/@types/checkouts";
import { ApiResponse } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { centsToString } from "@/utils/centsToString";
import { Eye, Loader2, MapPin, Navigation, Truck } from "lucide-react";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
} from "@/components/shared/ListPagination";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";

export interface RoutesTableFilters {
  customerName?: string;
  /** Filiais escolhidas no filtro; lista vazia/ausente = todas as acessíveis. */
  filialIds?: string[];
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

interface RoutesTableProps {
  filters?: RoutesTableFilters;
}

function isRouteAvailableToday(routeDate: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rDate = new Date(routeDate);
  rDate.setHours(0, 0, 0, 0);
  return rDate.getTime() === today.getTime();
}

export function RoutesTable({ filters }: RoutesTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [ pagination, setPagination ] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ filters ]);

  const isMaster = user?.role === USER_ROLES.MASTER || user?.role === USER_ROLES.ADMIN;
  const isMotorista = user?.role === USER_ROLES.MOTORISTA;
  // Motorista Chefe vê todas as rotas da filial (visão de gestor), mas também
  // pode iniciar as rotas atribuídas a ele próprio
  const isMotoristaChefe = user?.role === USER_ROLES.MOTORISTA_CHEFE;
  const myId = user?.employeeId ?? user?.sub;
  // Gerente e qualquer outro cargo com acesso
  const isGestor = !isMotorista;

  // Filiais acessíveis (undefined = todas, para Master/Admin). Usa o mesmo
  // hook da agenda para que os dois escopos nunca divirjam.
  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.ROUTES);

  const finalFilialIds = useMemo(() => {
    const requested = filters?.filialIds ?? [];

    // Master/Admin não têm restrição: vale o que foi pedido (nada = todas).
    if (isMaster) return requested.length > 0 ? requested : undefined;

    // Demais cargos: o filtro da tela só pode restringir o que já é acessível,
    // nunca ampliar. Sem escolha, mostra todas as filiais liberadas.
    if (requested.length === 0) return accessibleFilialIds;

    const intersect = (accessibleFilialIds ?? []).filter((id) =>
      requested.includes(id),
    );
    return intersect.length > 0 ? intersect : [ "NO_ACCESS" ];
  }, [ isMaster, filters?.filialIds, accessibleFilialIds ]);

  const queryParams = useMemo(() => ({
    filialIds: finalFilialIds,
    customerName: filters?.customerName,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    status: filters?.status && filters.status !== "Todos" ? filters.status : undefined,
    // Motorista só enxerga as próprias rotas
    driverId: isMotorista ? (user?.employeeId ?? user?.sub) : undefined,
    // "Rota" = agendamento com motorista atribuído. Filtrar isso no servidor é
    // obrigatório: o backend pagina antes de responder, então descartar
    // agendamentos sem motorista aqui deixaria páginas inteiras vazias (o
    // sintoma de "nenhuma rota" com o filtro de filial em "Todas", quando os
    // agendamentos mais recentes ainda não têm motorista) e o total errado.
    hasDriver: true,
    page: pagination.page,
    limit: pagination.limit,
  }), [ finalFilialIds, filters, isMotorista, user, pagination ]);

  const { data, isLoading, isError } = useQuery<
    ApiResponse<{ items: Checkout[]; total: number }>,
    Error
  >({
    queryKey: [ "get-routes", queryParams ],
    queryFn: () => GetAllCheckouts({ queryParams }),
    staleTime: 1000 * 30,
    enabled: !!user,
  });

  // A seleção de "só com motorista" é feita pelo backend (`hasDriver`), então a
  // página recebida já é a lista final — nunca filtre por motorista aqui, sob
  // pena de reintroduzir páginas vazias e total divergente.
  const routes = data?.data?.items || [];

  const totalRoutes = data?.data?.total || 0;

  const { mutate: iniciarRota, isPending: isStarting } = useMutation({
    mutationFn: (checkout: Checkout) =>
      UpdateCheckoutStatus({
        checkoutId: checkout.checkoutId,
        checkoutStatus: "Em_Andamento",
        date: new Date(checkout.date).toISOString(),
      }),
    onSuccess: (_, checkout) => {
      toast.success(`Rota de ${checkout.Customer.fullname} iniciada!`);
      queryClient.invalidateQueries({ queryKey: [ "get-routes" ] });
    },
    onError: () => toast.error("Erro ao iniciar rota. Tente novamente."),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar rotas. Tente novamente.
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-14 border rounded-lg bg-muted/10">
        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhuma rota encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isMotorista
            ? "Você não possui rotas atribuídas no período selecionado."
            : "Nenhum agendamento com motorista atribuído foi encontrado."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data / Horário</TableHead>
              <TableHead>Cliente</TableHead>
              {isGestor && <TableHead>Motorista</TableHead>}
              <TableHead>Destino</TableHead>
              {(isMaster || isGestor) && <TableHead>Filial</TableHead>}
              <TableHead>Distância</TableHead>
              <TableHead>Equipamentos</TableHead>
              {isGestor && <TableHead>Status</TableHead>}
              {isGestor && <TableHead className="text-right">Valor</TableHead>}
              {(isMotorista || isMotoristaChefe) && <TableHead className="w-[140px]">Ação</TableHead>}
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => {
              const isToday = isRouteAvailableToday(route.date);
              const isPendente = route.checkoutStatus === "Pendente";
              const isEmAndamento = route.checkoutStatus === "Em_Andamento";
              const canStart = isToday && isPendente;
              const showRouteAction =
                isMotorista || (isMotoristaChefe && route.driverId === myId);

              return (
                <TableRow key={ route.checkoutId }>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">
                      {new Date(route.date).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {minutesToHHMM(route.startHourInMinutes)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium truncate max-w-[160px] block">
                      {route.Customer?.fullname}
                    </span>
                    {route.Customer?.cellphone && (
                      <span className="text-xs text-muted-foreground">
                        {route.Customer.cellphone}
                      </span>
                    )}
                  </TableCell>

                  {isGestor && (
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {route.driver?.fullname ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {route.Address
                          ? [ route.Address.street, route.Address.buildingNumber, route.Address.city, route.Address.state ]
                            .filter(Boolean)
                            .join(", ")
                          : "—"}
                      </span>
                    </div>
                  </TableCell>

                  {(isMaster || isGestor) && (
                    <TableCell className="text-sm text-muted-foreground">
                      {route.SourceFilial?.filialName ?? "—"}
                    </TableCell>
                  )}

                  <TableCell className="text-sm">
                    {route.distanceInKm ? `${route.distanceInKm} km` : "—"}
                  </TableCell>

                  <TableCell className="text-sm">
                    {route.Bookings?.map((b) => b.Gear.gearName).join(", ") || "—"}
                  </TableCell>

                  {isGestor && (
                    <TableCell>
                      <BookingStatusBadge status={ route.checkoutStatus } />
                    </TableCell>
                  )}

                  {isGestor && (
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {centsToString(route.totalPrice)}
                    </TableCell>
                  )}

                  {(isMotorista || isMotoristaChefe) && (
                    <TableCell>
                      {showRouteAction && (isPendente || isEmAndamento) ? (
                        <Button
                          size="sm"
                          disabled={ !canStart || isStarting || isEmAndamento }
                          onClick={ () => canStart && iniciarRota(route) }
                          className={ cn(
                            "gap-1.5",
                            isEmAndamento
                              ? "bg-blue-100 text-blue-800 border-blue-300 cursor-default"
                              : canStart
                                ? ""
                                : "opacity-50 cursor-not-allowed",
                          ) }
                          variant={ isEmAndamento ? "outline" : "default" }
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          {isEmAndamento ? "Em Andamento" : "Iniciar Rota"}
                        </Button>
                      ) : isMotorista ? (
                        <BookingStatusBadge status={ route.checkoutStatus } />
                      ) : null}
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={ () => router.push(`${ROUTES.ROUTES}/${route.checkoutId}`) }
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {routes.map((route) => {
          const isToday = isRouteAvailableToday(route.date);
          const isPendente = route.checkoutStatus === "Pendente";
          const isEmAndamento = route.checkoutStatus === "Em_Andamento";
          const canStart = isToday && isPendente;
          const showRouteAction =
            isMotorista || (isMotoristaChefe && route.driverId === myId);
          const address = route.Address
            ? [ route.Address.street, route.Address.buildingNumber, route.Address.city, route.Address.state ]
              .filter(Boolean)
              .join(", ")
            : "—";

          return (
            <Card
              key={ route.checkoutId }
              className="p-4 space-y-3 active:bg-muted/40 transition-colors"
            >
              {/* Row 1: Data/Hora + Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {new Date(route.date).toLocaleDateString("pt-BR")} · {minutesToHHMM(route.startHourInMinutes)}
                </span>
                <BookingStatusBadge status={ route.checkoutStatus } />
              </div>

              {/* Row 2: Cliente */}
              <div className="min-w-0">
                <p className="font-semibold truncate">{route.Customer?.fullname}</p>
                {route.Customer?.cellphone && (
                  <p className="text-xs text-muted-foreground">{route.Customer.cellphone}</p>
                )}
              </div>

              {/* Row 3: Motorista (só para gestores) */}
              {isGestor && route.driver && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{route.driver.fullname}</span>
                </div>
              )}

              {/* Row 4: Destino */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address}</span>
              </div>

              {/* Row 5: Equipamentos + Distância */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate flex-1">
                  {route.Bookings?.map((b) => b.Gear.gearName).join(", ") || "—"}
                </span>
                {route.distanceInKm ? (
                  <span className="ml-2 shrink-0 font-medium">{route.distanceInKm} km</span>
                ) : null}
              </div>

              {/* Row 6: Ações */}
              <div className="flex items-center gap-2 pt-1 border-t">
                {showRouteAction && canStart && (
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5"
                    disabled={ isStarting }
                    onClick={ () => iniciarRota(route) }
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Iniciar Rota
                  </Button>
                )}

                {isGestor && (
                  <span className="flex-1 text-sm font-semibold">{centsToString(route.totalPrice)}</span>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 ml-auto"
                  onClick={ () => router.push(`${ROUTES.ROUTES}/${route.checkoutId}`) }
                >
                  <Eye className="h-4 w-4" />
                  Detalhes
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <ListPagination
        page={ pagination.page }
        limit={ pagination.limit }
        totalItems={ totalRoutes }
        onPageChange={ (page) => setPagination((prev) => ({ ...prev, page })) }
        onLimitChange={ (limit) => setPagination({ page: 1, limit }) }
        itemLabel="rota(s)"
      />
    </>
  );
}
