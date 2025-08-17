import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { FlattenedBooking, WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { useEffect, useState } from "react";
import { Checkout } from "@/utils/@types/checkouts";
import { fetchWithToken } from "@/utils/fetchWithToken";

interface CalendarContentProps {
    viewType: "semana" | "dia" | "mes"
    currentDate: Date
    openBookingDetails: (_agendamento: FlattenedBooking) => void
}

export function CalendarContent({ viewType, currentDate, openBookingDetails }: CalendarContentProps) {
    const { user } = useAuth();
    const [ checkouts, setCheckouts ] = useState<Checkout[]>();

    useEffect(() => {
        async function handleGetAllCheckouts() {
            const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/checkouts`);
            if(user && user?.role !== "Gerente") {
                url.searchParams.append("filialId", user?.sourceFilial.filialId);
            }
            if(viewType === "dia") {
                url.searchParams.append("startDate", currentDate.toString());
                url.searchParams.append("endDate", currentDate.toString());
            }
            if(viewType === "semana") {
                const today = currentDate;
                const firstDayOfWeek = new Date(currentDate);
                firstDayOfWeek.setDate(today.getDate() - today.getDay());

                const lastDayOfWeek = new Date(today);
                lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay()));
                lastDayOfWeek.setHours(23, 59, 59, 999);

                url.searchParams.append("startDate", firstDayOfWeek.toString());
                url.searchParams.append("endDate", lastDayOfWeek.toString());
            }

            if(viewType === "mes") {
                // Primeiro dia do mês
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                firstDayOfMonth.setHours(0, 0, 0, 0);

                // Último dia do mês
                const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                lastDayOfMonth.setHours(23, 59, 59, 999);
                url.searchParams.append("startDate", firstDayOfMonth.toString());
                url.searchParams.append("endDate", lastDayOfMonth.toString());
            }

            const response = await fetchWithToken(url, {
                credentials: "include",
            });
            const { data }: { data: Checkout[] } = await response.json();
            setCheckouts(data);
        }
        handleGetAllCheckouts();
    }, [ user, currentDate, viewType ]);

    return(
        <Card className="overflow-hidden py-0 ">
            <CardContent className="p-0">
                { viewType === "dia" && checkouts && (
                    <DayView
                        currentDate={ currentDate }
                        checkouts={ checkouts }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
                { viewType === "semana" && checkouts && (
                    <WeekView
                        currentDate={ currentDate }
                        checkouts={ checkouts }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
                { viewType === "mes" && checkouts && (
                    <MonthView
                        currentDate={ currentDate }
                        checkouts={ checkouts }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
            </CardContent>
        </Card>
    );
}