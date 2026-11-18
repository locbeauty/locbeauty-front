"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-provider";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { ApiResponse } from "@/lib/api";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { GetAllGears } from "@/services/gears.service";
import { GetAllTrainings } from "@/services/trainings.service";
import { Checkout } from "@/utils/@types/checkouts";
import { Gear } from "@/utils/@types/gears";
import { Training } from "@/utils/@types/training";
import { USER_ROLES } from "@/utils/constants";
import { gearsInEvents, mergeGearOptions } from "@/utils/gearFilter";
import { getMonthDays, getWeekDays } from "./bookingViewHelpers";

const EMPTY_CHECKOUTS: Checkout[] = [];
const EMPTY_TRAININGS: Training[] = [];

interface UseCalendarEventsParams {
  viewType: "semana" | "dia" | "mes";
  currentDate: Date;
  selectedFilialIds: string[];
}

/**
 * Agendamentos e treinamentos do período visível da agenda. Usado pela agenda
 * e pelo filtro de equipamentos: as chaves são as mesmas, então o react-query
 * faz uma requisição só e os dois enxergam os mesmos eventos.
 */
export function useCalendarEvents({
  viewType,
  currentDate,
  selectedFilialIds,
}: UseCalendarEventsParams) {
  const { user } = useAuth();
  const accessibleFilialIds = useAccessibleFilialIds();

  // Calcula startDate e endDate conforme viewType
  const { startDate, endDate } = useMemo(() => {
    if (!currentDate) return { startDate: undefined, endDate: undefined };

    let start: Date;
    let end: Date;

    if (viewType === "dia") {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    } else if (viewType === "semana") {
      const days = getWeekDays(currentDate);
      start = days[0];
      start.setHours(0, 0, 0, 0);
      end = days[days.length - 1];
      end.setHours(23, 59, 59, 999);
    } else {
      // mes
      const days = getMonthDays(currentDate);
      start = days[0];
      start.setHours(0, 0, 0, 0);
      end = days[days.length - 1];
      end.setHours(23, 59, 59, 999);
    }

    return { startDate: start, endDate: end };
  }, [ viewType, currentDate ]);

  const finalFilialIds = useMemo(() => {
    const isRestricted = accessibleFilialIds !== undefined;

    // No specific selection → "Todas" (respecting RBAC for restricted users)
    if (selectedFilialIds.length === 0) return accessibleFilialIds;

    // Restricted users: intersect selection with what they can access
    if (isRestricted && accessibleFilialIds) {
      const filtered = selectedFilialIds.filter((id) =>
        accessibleFilialIds.includes(id),
      );
      return filtered.length > 0 ? filtered : [ "NO_ACCESS" ];
    }

    return selectedFilialIds;
  }, [ selectedFilialIds, accessibleFilialIds ]);

  const isMotorista = user?.role === USER_ROLES.MOTORISTA;

  const params = Object.fromEntries(
    Object.entries({
      filialIds: finalFilialIds,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      limit: "1000",
      ...(isMotorista && user?.employeeId ? { driverId: user.employeeId } : {}),
    }).filter(([ _, v ]) => v !== undefined),
  ) as Record<string, string | string[]>;

  const checkoutsQuery = useQuery<
    ApiResponse<{ items: Checkout[]; total: number }>,
    Error
  >({
    queryKey: [ "get-all-checkouts", finalFilialIds, startDate, endDate, isMotorista ? user?.employeeId : null ],
    queryFn: () =>
      GetAllCheckouts({
        queryParams: params,
      }),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  // Treinamentos: o filtro de filial é aplicado no servidor, que inclui as
  // filiais vinculadas — como nos agendamentos. Sem seleção explícita vale o
  // escopo de acesso do próprio servidor.
  const trainingFilialIds =
    selectedFilialIds.length > 0 ? finalFilialIds : undefined;

  const trainingsQuery = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "get-all-trainings", "calendar", trainingFilialIds ?? null ],
    queryFn: () => GetAllTrainings(undefined, undefined, trainingFilialIds),
    staleTime: 1000 * 60,
  });

  return {
    startDate,
    endDate,
    finalFilialIds,
    checkouts: checkoutsQuery.data?.data?.items ?? EMPTY_CHECKOUTS,
    trainings: trainingsQuery.data?.data ?? EMPTY_TRAININGS,
    isLoading: checkoutsQuery.isLoading,
  };
}

/**
 * Opções do filtro de equipamentos da agenda: os equipamentos das filiais do
 * usuário mais os que aparecem nos eventos carregados (registro de outra
 * filial ou já excluído). Assim todo equipamento visível na agenda pode ser
 * escolhido, e todo id selecionado tem um nome conhecido.
 */
export function useCalendarGearOptions(
  checkouts: Checkout[],
  trainings: Training[],
) {
  // Não-Master/Admin só veem as máquinas das filiais a que têm acesso.
  const accessibleFilialIds = useAccessibleFilialIds();

  // Mesma chave do SelectGears: compartilha o cache.
  const { data } = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears-select", accessibleFilialIds ],
    queryFn: () => GetAllGears({ filialIds: accessibleFilialIds }),
    staleTime: 1000 * 60,
  });

  const gears = data?.data;

  return useMemo(
    () => mergeGearOptions(gears ?? [], gearsInEvents(checkouts, trainings)),
    [ gears, checkouts, trainings ],
  );
}
