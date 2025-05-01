import { cn } from "@/lib/utils";
import { formatCurrency, formatDayName, formatTime, isSameDay, isToday } from "./bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../BookingStatusBadge";

interface MobileDayViewProps {
    currentDate: Date
    agendamentos: Agendamento[]
    openAgendamentoDetails: (_agendamento: Agendamento) => void
}

export function MobileDayView({ agendamentos, currentDate, openAgendamentoDetails }: MobileDayViewProps) {

    const dayAgendamentos = agendamentos.filter((agendamento) => {
        return isSameDay(agendamento.startDate, currentDate);
    });

    return (
        <div className="min-w-full">
            { /* Cabeçalho com o dia */ }
            <div className="grid grid-cols-1 border-b">
                <div className={ cn("p-2 text-center font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }>
                    <div>{ formatDayName(currentDate) }</div>
                    <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
                        { currentDate.getDate() }
                    </div>
                </div>
            </div>

            { /* Lista de agendamentos do dia */ }
            <div className="divide-y">
                { dayAgendamentos.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Nenhum agendamento para este dia</div>
                ) : (
                    dayAgendamentos.map((agendamento) => {
                        // Determinar a cor com base na duração
                        let bgColor = "";
                        if (agendamento.totalDuration === 4) {
                            bgColor = "border-yellow-300 bg-yellow-50";
                        } else if (agendamento.totalDuration === 6) {
                            bgColor = "border-pink-300 bg-pink-50";
                        } else if (agendamento.totalDuration >= 8 && agendamento.totalDuration <= 12) {
                            bgColor = "border-green-300 bg-green-50";
                        } else {
                            bgColor = "border-blue-300 bg-blue-50";
                        }

                        return (
                            <div
                                key={ agendamento.id }
                                className={ cn("p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors", bgColor) }
                                onClick={ () => openAgendamentoDetails(agendamento) }
                            >
                                <div className="font-medium">{ agendamento.gear }</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        { formatTime(agendamento.startDate) } - { formatTime(agendamento.endDate) }
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 max-w-[80vw]">
                                        <User className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate whitespace-nowrap max-w-full overflow-hidden text-ellipsis">{ agendamento.customer }</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        { agendamento.city }
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        { formatCurrency(agendamento.price) }
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <BookingStatusBadge status={ agendamento.bookingStatus } />
                                    <span className="text-xs text-muted-foreground">{ agendamento.totalDuration }h</span>
                                </div>
                            </div>
                        );
                    })
                ) }
            </div>
        </div>
    );
}