"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { Checkout } from "@/utils/@types/checkouts";
import { useQuery } from "@tanstack/react-query";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { useState } from "react";
import { ApiResponse } from "@/lib/api";
import { Training } from "@/utils/@types/training";
import { GetAllTrainings } from "@/services/trainings.service";
import { CalendarEvent } from "./bookingViewHelpers";
import { TrainingDetailsDialog } from "../trainings/TrainingDetailsDialog";

interface CalendarContentProps {
  viewType: "semana" | "dia" | "mes";
  currentDate: Date;
  openCheckoutDetails: (_agendamento: Checkout) => void;
}

export function CalendarContent({
    viewType,
    currentDate,
    openCheckoutDetails,
}: CalendarContentProps) {
    const { user } = useAuth();
    const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
        null
    );
    const [ isTrainingDetailsDialogOpen, setIsTrainingDetailsDialogOpen ] = useState(false);

    const queryParams = user
        ? user.role === "Gerente"
            ? {}
            : { filialId: user.sourceFilial.filialId }
        : undefined;

    // Calcula startDate e endDate conforme viewType
    const startDate = (() => {
        if (!currentDate) return undefined;
        switch (viewType) {
        case "dia":
            return new Date(currentDate);
        case "semana": {
            const firstDay = new Date(currentDate);
            firstDay.setDate(currentDate.getDate() - currentDate.getDay());
            firstDay.setHours(0, 0, 0, 0);
            return firstDay;
        }
        case "mes":
            return new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1,
                0,
                0,
                0,
                0
            );
        default:
            return undefined;
        }
    })();

    const endDate = (() => {
        if (!currentDate) return undefined;
        switch (viewType) {
        case "dia":
            return new Date(currentDate);
        case "semana": {
            const lastDay = new Date(currentDate);
            lastDay.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
            lastDay.setHours(23, 59, 59, 999);
            return lastDay;
        }
        case "mes":
            return new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );
        default:
            return undefined;
        }
    })();

    const params = Object.fromEntries(
        Object.entries({
            ...(queryParams || {}),
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
        }).filter(([ _, v ]) => v !== undefined)
    ) as Record<string, string>;

    const { data, isLoading } = useQuery<ApiResponse<Checkout[]>, Error>({
        queryKey: [ "get-all-checkouts", queryParams, startDate, endDate ],
        queryFn: () =>
            GetAllCheckouts({
                queryParams: params,
            }),
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
        queryKey: [ "get-all-trainings" ],
        queryFn: GetAllTrainings,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const checkouts = data?.data || [];
    const trainings = trainingsData.data?.data || [];

    const allEvents: CalendarEvent[] = [ ...checkouts, ...trainings ];

    const openDetails = (event: CalendarEvent) => {
        if ("trainingId" in event) {
            setSelectedTraining(event as Training);
            setIsTrainingDetailsDialogOpen(true);
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
            </CardContent>
        </Card>
    );
}
