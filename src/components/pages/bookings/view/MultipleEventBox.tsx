import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../BookingPaymentStatusBadge";
import {
    formatCurrency,
    formatTime,
    getDistanceFromTop,
    getEventBoxHeigh,
} from "../../../../utils/bookingViewHelpers";
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
    const width = `calc((12.5% - 6px) / ${group.length})`;

    return group.map((agendamento, agendamentoIndex) => {
        const startHour = agendamento.startDate.getHours();
        const startMinute = agendamento.startDate.getMinutes();

        // Calcular posição e altura
        const top = getDistanceFromTop(startHour, startMinute);
        const height = getEventBoxHeigh(agendamento.totalDuration);

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
                    left: `calc(${
                        (dayIndex + 1) * 12.5
                    }% + 2px + (${agendamentoIndex} * ${width}))`,
                    width: width,
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
