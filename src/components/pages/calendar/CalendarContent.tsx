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
  selectedFilialId: string;
}

export function CalendarContent({
  viewType,
  currentDate,
  openCheckoutDetails,
  hideCanceled,
  selectedFilialId,
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

    // Strict access control: derived only from EmployeeAccess permissions
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.BOOKINGS && a.canView)
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
    if (selectedFilialId === "ALL") return accessibleFilialIds;
    return [ selectedFilialId ];
  }, [ selectedFilialId, accessibleFilialIds ]);

  const params = Object.fromEntries(
    Object.entries({
      filialIds: finalFilialIds,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      limit: "1000",
    }).filter(([ _, v ]) => v !== undefined),
  ) as Record<string, string | string[]>;

  const { data, isLoading } = useQuery<
    ApiResponse<{ items: Checkout[]; total: number }>,
    Error
  >({
    queryKey: [ "get-all-checkouts", finalFilialIds, startDate, endDate ],
    queryFn: () =>
      GetAllCheckouts({
        queryParams: params,
      }),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "get-all-trainings", selectedFilialId ],
    queryFn: () =>
      GetAllTrainings(
        undefined,
        selectedFilialId === "ALL" ? undefined : selectedFilialId,
      ),
    staleTime: 1000 * 60,
  });

  const noticesData = useQuery<ApiResponse<Notice[]>, Error>({
    queryKey: [ "get-notices", startDate, endDate, selectedFilialId ],
    queryFn: () =>
      GetNotices({
        startDate: startDate?.toISOString() || "",
        endDate: endDate?.toISOString() || "",
        filialId: selectedFilialId === "ALL" ? undefined : selectedFilialId,
      }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60,
  });

  const checkouts = data?.data?.items || [];
  const trainings = trainingsData.data?.data || [];
  const notices = noticesData.data?.data || [];

  const filteredCheckouts = hideCanceled
    ? checkouts.filter((c) => c.checkoutStatus !== "Cancelado")
    : checkouts;
  const filteredTrainings = hideCanceled
    ? trainings.filter((t) => t.trainingStatus !== "Cancelado")
    : trainings;

  const allEvents: CalendarEvent[] = [
    ...filteredCheckouts,
    ...filteredTrainings,
    ...notices,
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
