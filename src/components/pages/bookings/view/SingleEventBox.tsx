import { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import {
    formatCurrency,
    formatTime,
    getDistanceFromTop,
    getEventBoxHeigh,
} from "./bookingViewHelpers";
import { cn } from "@/lib/utils";

interface SingleEventBoxProps {
  group: Agendamento[];
  dayIndex: number;
  openAgendamentoDetails: (_agendamento: Agendamento) => void;
}

export function SingleEventBox({
    group,
    dayIndex,
    openAgendamentoDetails,
}: SingleEventBoxProps) {
    // Se o grupo tem apenas um evento, use a largura total
    const hourColumnWidth = 100;
    const agendamento = group[0];
    const startHour = agendamento.startDate.getHours();
    const startMinute = agendamento.startDate.getMinutes();

    // Calcular posição e altura
    const top = getDistanceFromTop(startHour, startMinute);
    const height = getEventBoxHeigh(agendamento.totalDuration);

    // Calcular posição horizontal considerando a largura da coluna de horas
    const columnWidth = hourColumnWidth
        ? `calc((100% - ${hourColumnWidth}px) / 7)`
        : "12.5%";
    const left = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(12.5% + (${dayIndex} * ${columnWidth}))`;
    const width = `calc(${columnWidth} - 2px)`;

    return (
        <div
            key={ agendamento.id }
            className={ cn(
                "absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-y-auto",
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
                width,
            } }
            onClick={ () => openAgendamentoDetails(agendamento) }
        >
            <div className="font-medium text-sm truncate">{agendamento.gear}</div>
            <div className="flex items-center text-xs gap-1 truncate">
                <User className="h-3 w-3" />
                {agendamento.customer}
            </div>
            <div className="flex items-center text-xs gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {agendamento.city}
            </div>
            <div className="flex items-center text-xs gap-1 truncate">
                <Clock className="h-3 w-3" />
                {formatTime(agendamento.startDate)}
            </div>
            <div className="flex items-center text-xs gap-1 truncate">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(agendamento.price)}
            </div>
            <div className="flex flex-col gap-1 mt-2">
                <BookingStatusBadge status={ agendamento.bookingStatus } />
                <BookingPaymentStatusBadge status={ agendamento.paymentStatus } />
            </div>
        </div>
    );
}
