"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView, FlattenedBooking } from "./WeekView";
import { MonthView } from "./MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { Checkout } from "@/utils/@types/checkouts";
import { useQuery } from "@tanstack/react-query";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { useEffect } from "react";
import { ApiResponse } from "@/lib/api";

interface CalendarContentProps {
    viewType: "semana" | "dia" | "mes";
    currentDate: Date;
    openCheckoutDetails: (_agendamento: Checkout) => void;
}

export function CalendarContent({ viewType, currentDate, openCheckoutDetails }: CalendarContentProps) {
    const { user } = useAuth();

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
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
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
            return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
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

    const { data, isLoading } =useQuery<ApiResponse<Checkout[]>, Error>({
        queryKey: [ "get-all-checkouts", queryParams, startDate, endDate ],
        queryFn: () =>
            GetAllCheckouts({
                queryParams: params
            }),
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const checkouts = data?.data;

    console.log("checkouts: ", checkouts);
    // console.log("viewType: ", viewType);

    return (
        <Card className="overflow-hidden py-0">
            <CardContent className="p-0">
                {viewType === "dia" && checkouts && (
                    <DayView currentDate={ currentDate } checkouts={ checkouts } openCheckoutDetails={ openCheckoutDetails } />
                )}
                {viewType === "semana" && checkouts && (
                    <WeekView currentDate={ currentDate } checkouts={ checkouts } openCheckoutDetails={ openCheckoutDetails } />
                )}
                {viewType === "mes" && checkouts && (
                    <MonthView currentDate={ currentDate } checkouts={ checkouts } openCheckoutDetails={ openCheckoutDetails } />
                )}
                {isLoading && <div className="p-4 text-center">Carregando...</div>}
                {!isLoading && checkouts?.length === 0 && <div className="p-4 text-center">Nada a mostrar por aqui.</div>}
            </CardContent>
        </Card>
    );
}
