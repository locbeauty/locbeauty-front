import { CardContent } from "@/components/ui/card";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { agendamentos } from "@/utils/mocks/bookings";
import { Agendamento } from "@/app/(main)/bookings/page";

interface CalendarContentProps {
    viewType: "semana" | "dia" | "mes"
    currentDate: Date
    openAgendamentoDetails: (_agendamento: Agendamento) => void
    isMobile: boolean
}

export function CalendarContent({ viewType, currentDate, openAgendamentoDetails, isMobile }: CalendarContentProps) {
    return(
        <CardContent className="p-0">
            { viewType === "dia" && (
                <DayView
                    currentDate={ currentDate }
                    agendamentos={ agendamentos }
                    openAgendamentoDetails={ openAgendamentoDetails }
                    isMobile={ isMobile }
                />
            ) }
            { viewType === "semana" && !isMobile && (
                <WeekView
                    currentDate={ currentDate }
                    agendamentos={ agendamentos }
                    openAgendamentoDetails={ openAgendamentoDetails }
                />
            ) }
            { viewType === "mes" && !isMobile && (
                <MonthView
                    currentDate={ currentDate }
                    agendamentos={ agendamentos }
                    openAgendamentoDetails={ openAgendamentoDetails }
                />
            ) }
        </CardContent>
    );
}