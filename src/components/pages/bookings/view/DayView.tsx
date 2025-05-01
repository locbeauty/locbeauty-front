import { cn } from "@/lib/utils";
import { formatCurrency, formatDayName, formatTime, isSameDay, isToday } from "./bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";

// Componente de visualização diária
export function DayView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (_agendamento: Agendamento) => void
}) {
    // Horas do dia para exibição
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    // Filtrar agendamentos para o dia atual
    const dayAgendamentos = agendamentos.filter((agendamento) => {
        return isSameDay(agendamento.startDate, currentDate);
    });

    return (
        <div className="min-w-full">
            { /* Cabeçalho com o dia */ }
            <div className="grid grid-cols-2 border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                <div
                    className={ cn("p-2 text-center border-r font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }
                >
                    <div>{ formatDayName(currentDate) }</div>
                    <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
                        { currentDate.getDate() }
                    </div>
                </div>
            </div>

            { /* Grade de horários */ }
            <div className="relative">
                { /* Linhas de horas */ }
                { hours.map((hour) => (
                    <div key={ hour } className="grid grid-cols-2 border-b">
                        <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{ `${hour}:00` }</div>
                        <div className="h-16 border-r relative"></div>
                    </div>
                )) }

                { /* Agendamentos */ }
                { dayAgendamentos.map((agendamento) => {
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
                                left: "calc(50% + 2px)",
                                width: "calc(50% - 6px)",
                            } }
                            onClick={ () => openAgendamentoDetails(agendamento) }
                        >
                            <div className="font-medium text-sm truncate">{ agendamento.gear }</div>
                            <div className="flex items-center text-xs gap-1 truncate">
                                <User className="h-3 w-3" />
                                { agendamento.customer }
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