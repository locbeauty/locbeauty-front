import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../BookingPaymentStatusBadge";
import {
    formatCurrency,
    formatTime,
    getDistanceFromTop,
    getEventBoxHeigh,
} from "./bookingViewHelpers";
import { cn } from "@/lib/utils";

interface MultipleEventBoxProps {
  group: Agendamento[];
  dayIndex: number;
  openAgendamentoDetails: (_agendamento: Agendamento) => void;
}

export function MultipleEventBox({
    group,
    dayIndex,
    openAgendamentoDetails,
}: MultipleEventBoxProps) {
    // Se o grupo tem múltiplos eventos, divida a largura

    const hourColumnWidth = 100;
    // Pegar o primeiro agendamento para calcular a posição inicial

    // Calcular posição horizontal considerando a largura da coluna de horas
    const columnWidth = hourColumnWidth
        ? `calc((100% - ${hourColumnWidth}px) / 7)`
        : "12.5%";
    const baseLeft = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(12.5% + (${dayIndex} * ${columnWidth}))`;

    // Calcular largura para cada agendamento no grupo
    const eventWidth = `calc((${columnWidth} - 2px) / ${group.length})`;
    return group.map((agendamento, agendamentoIndex) => {
    // Calcular altura do agendamento
        const height = getEventBoxHeigh(agendamento.totalDuration);

        // Calcular posição horizontal para cada agendamento no grupo
        // Cada evento ocupa uma fração igual da largura disponível
        const left = `calc(${baseLeft} + (${agendamentoIndex} * ${eventWidth}))`;
        // Calcular posição inicial
        const top = getDistanceFromTop(
            agendamento.startDate.getHours(),
            agendamento.startDate.getMinutes()
        );

        return (
            <div
                key={ agendamento.id }
                className={ cn(
                    "overflow-y-auto absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
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
                style={ {
                    top: `${top}px`,
                    height: `${height}px`,
                    left,
                    width: eventWidth,
                    overflowX: "hidden",
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
                    { formatTime(agendamento.startDate) }
                </div>
                <div className="flex items-center text-xs gap-1 truncate">
                    <DollarSign className="h-3 w-3" />
                    { formatCurrency(agendamento.price) }
                </div>
                <div className="flex flex-col gap-1 mt-2">
                    <BookingStatusBadge
                        status={ agendamento.bookingStatus }
                        shrink={ true }
                    />
                    <BookingPaymentStatusBadge
                        shrink={ true }
                        status={ agendamento.paymentStatus }
                    />
                </div>
            </div>
        );
    });
}
