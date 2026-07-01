"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { Checkout } from "@/utils/@types/checkouts";
import { useQuery } from "@tanstack/react-query";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { useState, useMemo } from "react";
import { ApiResponse } from "@/lib/api";
import { Training } from "@/utils/@types/training";
import { GetAllTrainings } from "@/services/trainings.service";
import { CalendarEvent, getMonthDays, getWeekDays } from "./bookingViewHelpers";
import { TrainingDetailsDialog } from "../trainings/TrainingDetailsDialog";
import { GetNotices } from "@/services/notices.service";
import { Notice } from "@/utils/@types/notice";
import { NoticeDetailsDialog } from "./DetailsDialog/NoticeDetailsDialog";

interface CalendarContentProps {
  viewType: "semana" | "dia" | "mes";
  currentDate: Date;
  openCheckoutDetails: (_agendamento: Checkout) => void;
  hideCanceled: boolean;
  selectedFilialIds: string[];
  selectedGearIds: string[];
}

export function CalendarContent({
  viewType,
  currentDate,
  openCheckoutDetails,
  hideCanceled,
  selectedFilialIds,
  selectedGearIds,
}: CalendarContentProps) {
  const { user } = useAuth();
  const { accesses } = useAccess();

  const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
    null,
  );
  const [ isTrainingDetailsDialogOpen, setIsTrainingDetailsDialogOpen ] =
    useState(false);

  const [ selectedNotice, setSelectedNotice ] = useState<Notice | null>(null);
  const [ isNoticeDetailsDialogOpen, setIsNoticeDetailsDialogOpen ] =
    useState(false);

  const accessibleFilialIds = useMemo(() => {
    // Admin/Master can see all
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    // Motorista/Logistica: derive filial access from CALENDAR module (not BOOKINGS)
    const moduleFilter =
      user?.role === USER_ROLES.MOTORISTA || user?.role === USER_ROLES.LOGISTICA
        ? SYSTEM_MODULES.CALENDAR
        : SYSTEM_MODULES.BOOKINGS;

    const permissions = accesses
      .filter((a) => a.module === moduleFilter && a.canView)
      .map((a) => a.filialId);

    const uniquePermissions = Array.from(new Set(permissions));

    // Fail-safe: if restricted user has no permissions, ensures NO_ACCESS
    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

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

  const { data, isLoading } = useQuery<
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

  // Notices/trainings only support a single filial server-side, so we fetch
  // them all and apply the multi-filial filter on the client.
  const noticeFilialIds =
    selectedFilialIds.length === 0
      ? undefined
      : finalFilialIds ?? selectedFilialIds;

  const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "get-all-trainings" ],
    queryFn: () => GetAllTrainings(),
    staleTime: 1000 * 60,
  });

  const noticesData = useQuery<ApiResponse<Notice[]>, Error>({
    queryKey: [ "get-notices", startDate, endDate, noticeFilialIds ],
    queryFn: () =>
      GetNotices({
        startDate: startDate?.toISOString() || "",
        endDate: endDate?.toISOString() || "",
        filialIds: noticeFilialIds,
      }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60,
  });

  const checkouts = data?.data?.items || [];
  const trainings = trainingsData.data?.data || [];
  const notices = noticesData.data?.data || [];

  const filialFilteredTrainings =
    selectedFilialIds.length === 0
      ? trainings
      : trainings.filter((t) =>
        (finalFilialIds ?? selectedFilialIds).includes(t.sourceFilialId),
      );

  // Filtro de máquinas (client-side): quando ativo, mostra só eventos que usam
  // a(s) máquina(s) selecionada(s). Avisos não têm máquina, então são ocultados.
  const isGearFilterActive = selectedGearIds.length > 0;

  const gearFilteredCheckouts = !isGearFilterActive
    ? checkouts
    : checkouts.filter((c) =>
      c.Bookings.some(
        (b) => b.status === "ACTIVE" && selectedGearIds.includes(b.Gear.gearId),
      ),
    );

  const gearFilteredTrainings = !isGearFilterActive
    ? filialFilteredTrainings
    : filialFilteredTrainings.filter((t) => selectedGearIds.includes(t.gearId));

  const gearFilteredNotices = isGearFilterActive ? [] : notices;

  const filteredCheckouts = hideCanceled
    ? gearFilteredCheckouts.filter((c) => c.checkoutStatus !== "Cancelado")
    : gearFilteredCheckouts;
  const filteredTrainings = hideCanceled
    ? gearFilteredTrainings.filter((t) => t.trainingStatus !== "Cancelado")
    : gearFilteredTrainings;

  const allEvents: CalendarEvent[] = [
    ...filteredCheckouts,
    ...filteredTrainings,
    ...gearFilteredNotices,
  ];

  const openDetails = (event: CalendarEvent) => {
    if ("trainingId" in event) {
      setSelectedTraining(event as Training);
      setIsTrainingDetailsDialogOpen(true);
    } else if ("noticeId" in event) {
      setSelectedNotice(event as Notice);
      setIsNoticeDetailsDialogOpen(true);
    } else {
      openCheckoutDetails(event as Checkout);
    }
  };

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-0">
        {viewType === "dia" && (
          <DayView
            currentDate={ currentDate }
            events={ allEvents }
            openDetails={ openDetails }
          />
        )}
        {viewType === "semana" && (
          <WeekView
            currentDate={ currentDate }
            events={ allEvents }
            openDetails={ openDetails }
          />
        )}
        {viewType === "mes" && (
          <MonthView
            currentDate={ currentDate }
            events={ allEvents }
            openDetails={ openDetails }
          />
        )}
        {isLoading && <div className="p-4 text-center">Carregando...</div>}
        {!isLoading && allEvents.length === 0 && (
          <div className="p-4 text-center">Nada a mostrar por aqui.</div>
        )}

        {selectedTraining && (
          <TrainingDetailsDialog
            open={ isTrainingDetailsDialogOpen }
            onOpenChange={ setIsTrainingDetailsDialogOpen }
            selectedTraining={ selectedTraining }
            setSelectedTraining={ setSelectedTraining }
          />
        )}

        {selectedNotice && (
          <NoticeDetailsDialog
            open={ isNoticeDetailsDialogOpen }
            onOpenChange={ setIsNoticeDetailsDialogOpen }
            notice={ selectedNotice }
          />
        )}
      </CardContent>
    </Card>
  );
}
