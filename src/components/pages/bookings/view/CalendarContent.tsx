// import { Card, CardContent } from "@/components/ui/card";
// import { DayView } from "./DayView";
// import { FlattenedBooking, WeekView } from "./WeekView";
// import { MonthView } from "./MonthView";
// import { useAuth } from "@/contexts/auth-provider";
// import { useEffect, useState } from "react";
// import { Checkout } from "@/utils/@types/checkouts";
// import { fetchWithToken } from "@/utils/fetchWithToken";

// interface CalendarContentProps {
//     viewType: "semana" | "dia" | "mes"
//     currentDate: Date
//     openBookingDetails: (_agendamento: FlattenedBooking) => void
// }

// export function CalendarContent({ viewType, currentDate, openBookingDetails }: CalendarContentProps) {
//     const { user } = useAuth();
//     const [ checkouts, setCheckouts ] = useState<Checkout[]>();

//     useEffect(() => {
//         async function handleGetAllCheckouts() {
//             const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/checkouts`);
//             if(user && user?.role !== "Gerente") {
//                 url.searchParams.append("filialId", user?.sourceFilial.filialId);
//             }
//             if(viewType === "dia") {
//                 url.searchParams.append("startDate", currentDate.toString());
//                 url.searchParams.append("endDate", currentDate.toString());
//             }
//             if(viewType === "semana") {
//                 const today = currentDate;
//                 const firstDayOfWeek = new Date(currentDate);
//                 firstDayOfWeek.setDate(today.getDate() - today.getDay());

//                 const lastDayOfWeek = new Date(today);
//                 lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay()));
//                 lastDayOfWeek.setHours(23, 59, 59, 999);

//                 url.searchParams.append("startDate", firstDayOfWeek.toString());
//                 url.searchParams.append("endDate", lastDayOfWeek.toString());
//             }

//             if(viewType === "mes") {
//                 // Primeiro dia do mês
//                 const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//                 firstDayOfMonth.setHours(0, 0, 0, 0);

//                 // Último dia do mês
//                 const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
//                 lastDayOfMonth.setHours(23, 59, 59, 999);
//                 url.searchParams.append("startDate", firstDayOfMonth.toString());
//                 url.searchParams.append("endDate", lastDayOfMonth.toString());
//             }

//             const response = await fetchWithToken(url, {
//                 credentials: "include",
//             });
//             const { data }: { data: Checkout[] } = await response.json();
//             setCheckouts(data);
//         }
//         handleGetAllCheckouts();
//     }, [ user, currentDate, viewType ]);

//     return(
//         <Card className="overflow-hidden py-0 ">
//             <CardContent className="p-0">
//                 { viewType === "dia" && checkouts && (
//                     <DayView
//                         currentDate={ currentDate }
//                         checkouts={ checkouts }
//                         openBookingDetails={ openBookingDetails }
//                     />
//                 ) }
//                 { viewType === "semana" && checkouts && (
//                     <WeekView
//                         currentDate={ currentDate }
//                         checkouts={ checkouts }
//                         openBookingDetails={ openBookingDetails }
//                     />
//                 ) }
//                 { viewType === "mes" && checkouts && (
//                     <MonthView
//                         currentDate={ currentDate }
//                         checkouts={ checkouts }
//                         openBookingDetails={ openBookingDetails }
//                     />
//                 ) }
//             </CardContent>
//         </Card>
//     );
// }

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
    openBookingDetails: (_agendamento: FlattenedBooking) => void;
}

export function CalendarContent({ viewType, currentDate, openBookingDetails }: CalendarContentProps) {
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

    const { data, isLoading } =useQuery<ApiResponse<Checkout[]>, Error>({
        queryKey: [ "get-all-checkouts", queryParams, startDate, endDate ],
        queryFn: () =>
            GetAllCheckouts({
                queryParams: {
                    ...(queryParams || {}),
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                },
            }),
        enabled: !!user,
        staleTime: 1000 * 60,
    });

    const checkouts = data?.data;

    return (
        <Card className="overflow-hidden py-0">
            <CardContent className="p-0">
                {viewType === "dia" && checkouts && (
                    <DayView currentDate={ currentDate } checkouts={ checkouts } openBookingDetails={ openBookingDetails } />
                )}
                {viewType === "semana" && checkouts && (
                    <WeekView currentDate={ currentDate } checkouts={ checkouts } openBookingDetails={ openBookingDetails } />
                )}
                {viewType === "mes" && checkouts && (
                    <MonthView currentDate={ currentDate } checkouts={ checkouts } openBookingDetails={ openBookingDetails } />
                )}
                {isLoading && <div className="p-4 text-center">Carregando...</div>}
                {!isLoading && checkouts?.length === 0 && <div className="p-4 text-center">Nada a mostrar por aqui.</div>}
            </CardContent>
        </Card>
    );
}
