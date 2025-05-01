import { cn } from "@/lib/utils";
import { formatCurrency, formatDayName, formatTime, getDayIndex, getWeekDays, isAgendamentoInWeek, isToday } from "./bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";

export function WeekView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (_agendamento: Agendamento) => void
}) {
    // Gerar os dias da semana a partir da data atual
    const weekDays = getWeekDays(currentDate);

    // Horas do dia para exibição
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    return (
        <div className="min-w-full">
            { /* Cabeçalho com os dias da semana */ }
            <div className="grid grid-cols-8 border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                { weekDays.map((day, index) => (
                    <div
                        key={ index }
                        className={ cn("p-2 text-center border-r font-medium", isToday(day) ? "bg-primary/10" : "bg-muted/50") }
                    >
                        <div>{ formatDayName(day) }</div>
                        <div className={ cn("text-lg", isToday(day) ? "text-primary font-bold" : "") }>{ day.getDate() }</div>
                    </div>
                )) }
            </div>

            { /* Grade de horários */ }
            <div className="relative">
                { /* Linhas de horas */ }
                { hours.map((hour) => (
                    <div key={ hour } className="grid grid-cols-8 border-b">
                        <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{ `${hour}:00` }</div>
                        { weekDays.map((_, dayIndex) => (
                            <div key={ dayIndex } className="h-16 border-r relative"></div>
                        )) }
                    </div>
                )) }

                { /* Agendamentos */ }
                { agendamentos.map((agendamento) => {
                    // Verificar se o agendamento está na semana atual
                    if (!isAgendamentoInWeek(agendamento, weekDays)) return null;

                    const dayIndex = getDayIndex(agendamento.startDate, weekDays);
                    if (dayIndex === -1) return null;

                    const startHour = agendamento.startDate.getHours();
                    const startMinute = agendamento.startDate.getMinutes();
                    const durationInHours = agendamento.totalDuration;

                    // Calcular posição e altura
                    const top = (startHour - 7) * 64 + (startMinute / 60) * 64; // 64px é a altura de cada hora
                    const height = durationInHours * 64;

                    // Determinar a cor com base na duração
                    let bgColor = "";
                    if (durationInHours === 4) {
                        bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                    } else if (durationInHours === 6) {
                        bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                    } else if (durationInHours >= 8 && durationInHours <= 12) {
                        bgColor = "bg-green-100 border-green-300 text-green-800";
                    } else {
                        bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                    }

                    return (
                        <div
                            key={ agendamento.id }
                            className={ cn(
                                "absolute rounded-md border-l-4 p-2 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                bgColor,
                            ) }
                            style={ {
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `calc(${(dayIndex + 1) * 12.5}% + 2px)`,
                                width: "calc(12.5% - 6px)",
                            } }
                            onClick={ () => openAgendamentoDetails(agendamento) }
                        >
                            <div className="font-medium text-sm truncate">{ agendamento.gear }</div>
                            <div className="flex items-center gap-1 text-xs max-w-full">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                    { agendamento.customer }
                                </span>
                            </div>
                            <div className="flex items-center text-xs gap-1 truncate">
                                <MapPin className="h-3 w-3" />
                                { agendamento.city }
                            </div>
                            <div className="flex items-center text-xs gap-1 truncate">
                                <Clock className="h-3 w-3" />
                                { formatTime(agendamento.startDate) } - { formatTime(agendamento.endDate) }
                            </div>
                            <div className="flex items-center text-xs gap-1 truncate">
                                <DollarSign className="h-3 w-3" />
                                { formatCurrency(agendamento.price) }
                            </div>
                        </div>
                    );
                }) }
            </div>
        </div>
    );
}