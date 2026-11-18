"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { Checkout } from "@/utils/@types/checkouts";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ApiResponse } from "@/lib/api";
import { Training } from "@/utils/@types/training";
import { CalendarEvent, getEventBasicInfo } from "./bookingViewHelpers";
import { useCalendarEvents, useCalendarGearOptions } from "./useCalendarEvents";
import {
  checkoutUsesGearNames,
  resolveSelectedGearNames,
  trainingUsesGearNames,
} from "@/utils/gearFilter";
import { startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
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
  selectedDateRange?: DateRange;
}

export function CalendarContent({
  viewType,
  currentDate,
  openCheckoutDetails,
  hideCanceled,
  selectedFilialIds,
  selectedGearIds,
  selectedDateRange,
}: CalendarContentProps) {
  const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
    null,
  );
  const [ isTrainingDetailsDialogOpen, setIsTrainingDetailsDialogOpen ] =
    useState(false);

  const [ selectedNotice, setSelectedNotice ] = useState<Notice | null>(null);
  const [ isNoticeDetailsDialogOpen, setIsNoticeDetailsDialogOpen ] =
    useState(false);

  // Agendamentos e treinamentos do período (filial já filtrada no servidor).
  const { startDate, endDate, finalFilialIds, checkouts, trainings, isLoading } =
    useCalendarEvents({ viewType, currentDate, selectedFilialIds });

  // Sem seleção explícita o escopo continua sendo o das filiais liberadas
  // (mandar `undefined` fazia a agenda listar avisos de TODAS as filiais).
  const noticeFilialIds = finalFilialIds;

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

  const notices = noticesData.data?.data || [];

  // Filtro de equipamentos (no navegador): mostra só os eventos com o(s)
  // equipamento(s) escolhido(s), comparando pelo NOME exibido no evento — o
  // mesmo equipamento tem vários registros (por filial, recadastro) e o
  // agendamento pode usar o de outra filial. Avisos não têm equipamento,
  // então são ocultados.
  const gearOptions = useCalendarGearOptions(checkouts, trainings);
  const selectedGearNames = useMemo(
    () => resolveSelectedGearNames(selectedGearIds, gearOptions),
    [ selectedGearIds, gearOptions ],
  );
  const isGearFilterActive = selectedGearIds.length > 0;

  const gearFilteredCheckouts = !isGearFilterActive
    ? checkouts
    : checkouts.filter((c) => checkoutUsesGearNames(c, selectedGearNames));

  const gearFilteredTrainings = !isGearFilterActive
    ? trainings
    : trainings.filter((t) => trainingUsesGearNames(t, selectedGearNames));

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

  // Filtro de período: mantém só eventos que sobrepõem [from, to]
  // (fim aberto quando só o início foi selecionado).
  const periodFilteredEvents = !selectedDateRange?.from
    ? allEvents
    : allEvents.filter((e) => {
      const { startDate: eventStart, endDate: eventEnd } =
          getEventBasicInfo(e);
      const from = startOfDay(selectedDateRange.from as Date);
      const to = selectedDateRange.to
        ? endOfDay(selectedDateRange.to)
        : undefined;
      return eventEnd >= from && (!to || eventStart <= to);
    });

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
            events={ periodFilteredEvents }
            openDetails={ openDetails }
          />
        )}
        {viewType === "semana" && (
          <WeekView
            currentDate={ currentDate }
            events={ periodFilteredEvents }
            openDetails={ openDetails }
          />
        )}
        {viewType === "mes" && (
          <MonthView
            currentDate={ currentDate }
            events={ periodFilteredEvents }
            openDetails={ openDetails }
          />
        )}
        {isLoading && <div className="p-4 text-center">Carregando...</div>}
        {!isLoading && periodFilteredEvents.length === 0 && (
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
