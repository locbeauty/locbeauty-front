import { cn } from "@/lib/utils";
import {
    formatTime,
    getMonthDays,
    isSameDay,
    isToday,
} from "../../../../utils/bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";
import { CalendarMonthHeader } from "./CalendarMonthHeader";

interface MonthViewProps {
  currentDate: Date;
  agendamentos: Agendamento[];
  openAgendamentoDetails: (_agendamento: Agendamento) => void;
}

export function MonthView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
}: MonthViewProps) {
    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <div className="hidden md:block min-w-full">
            <CalendarMonthHeader />

            { /* Grade do mês */ }
            <div className="grid grid-cols-7">
                { daysInCurrentMonth.map((day, index) => {
                    // Filtrar agendamentos para este dia
                    const dayAgendamentos = agendamentos.filter((agendamento) =>
                        isSameDay(agendamento.startDate, day)
                    );

                    // Verificar se é do mês atual ou não
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={ index }
                            className={ cn(
                                "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
                                dayAgendamentos.length > 3 && "overflow-y-scroll",
                                isToday(day) ? "bg-primary/5" : "",
                                !isCurrentMonth ? "bg-gray-100 text-red-300" : ""
                            ) }
                        >
                            <div
                                className={ cn(
                                    "text-right p-1 font-medium text-sm",
                                    isToday(day) ? "text-primary" : ""
                                ) }
                            >
                                { day.getDate() }
                            </div>

                            <div className="space-y-1 mt-1">
                                { dayAgendamentos
                                    .sort(
                                        (item1, item2) =>
                                            item1.startDate.getHours() - item2.startDate.getHours()
                                    )
                                    .map((agendamento) => {
                                        return (
                                            <div
                                                key={ agendamento.id }
                                                className={ cn(
                                                    "text-xs p-1 rounded border-l-2 cursor-pointer truncate",
                                                    // Default colors for bookings with durations different than 4, 6 and 8-12 hours
                                                    "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                                    // Colors for 4h bookings duration
                                                    agendamento.totalDuration === 4 &&
                            "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                                    // Colors for 6h bookings duration
                                                    agendamento.totalDuration === 6 &&
                            "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                                    // Colors for 8 to 12 hours bookings duration
                                                    agendamento.totalDuration >= 8 &&
                            agendamento.totalDuration <= 12 &&
                            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                                                ) }
                                                onClick={ () => openAgendamentoDetails(agendamento) }
                                            >
                                                { formatTime(agendamento.startDate) } - { agendamento.gear }
                                            </div>
                                        );
                                    }) }
                            </div>
                        </div>
                    );
                }) }
            </div>
        </div>
    );
}
