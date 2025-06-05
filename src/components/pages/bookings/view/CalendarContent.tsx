import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { bookings } from "@/utils/mocks/bookings";
import { Booking } from "@/utils/@types/bookings";

interface CalendarContentProps {
    viewType: "semana" | "dia" | "mes"
    currentDate: Date
    openBookingDetails: (_agendamento: Booking) => void
}

export function CalendarContent({ viewType, currentDate, openBookingDetails }: CalendarContentProps) {
    return(
        <Card className="overflow-hidden py-0 ">
            <CardContent className="p-0">
                { viewType === "dia" && (
                    <DayView
                        currentDate={ currentDate }
                        bookings={ bookings }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
                { viewType === "semana" && (
                    <WeekView
                        currentDate={ currentDate }
                        bookings={ bookings }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
                { viewType === "mes" && (
                    <MonthView
                        currentDate={ currentDate }
                        bookings={ bookings }
                        openBookingDetails={ openBookingDetails }
                    />
                ) }
            </CardContent>
        </Card>
    );
}