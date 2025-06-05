import { cn } from "@/lib/utils";
import {
    formatCurrency,
    formatDayName,
    formatTime,
    isSameDay,
    isToday,
} from "./bookingViewHelpers";

import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { Booking } from "@/utils/@types/bookings";

interface MobileDayViewProps {
  currentDate: Date;
  bookings: Booking[];
  openBookingDetails: (_agendamento: Booking) => void;
}

export function MobileDayView({
    bookings,
    currentDate,
    openBookingDetails,
}: MobileDayViewProps) {
    const dayAgendamentos = bookings.filter((booking) => {
        return isSameDay(booking.startDate, currentDate);
    });

    return (
        <div className="md:hidden block min-w-full">
            {/* Cabeçalho com o dia */}
            <div className="grid grid-cols-1 border-b">
                <div
                    className={ cn(
                        "p-2 text-center font-medium",
                        isToday(currentDate) ? "bg-primary/10" : "bg-muted/50"
                    ) }
                >
                    <div>{formatDayName(currentDate)}</div>
                    <div
                        className={ cn(
                            "text-lg",
                            isToday(currentDate) ? "text-primary font-bold" : ""
                        ) }
                    >
                        {currentDate.getDate()}
                    </div>
                </div>
            </div>

            {/* Lista de agendamentos do dia */}
            <div className="divide-y">
                {dayAgendamentos.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
            Nenhum agendamento para este dia
                    </div>
                ) : (
                    dayAgendamentos.map((agendamento) => {
                        return (
                            <div
                                key={ agendamento.id }
                                className={ cn(
                                    "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
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
                                onClick={ () => openBookingDetails(agendamento) }
                            >
                                <div className="font-medium">{agendamento.gear}</div>
                                <div className="text-sm text-muted-foreground mt-1 dark:text-muted">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(agendamento.startDate)} -{" "}
                                        {formatTime(agendamento.endDate)}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 max-w-[80vw]">
                                        <User className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                                            {agendamento.customer}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {agendamento.city}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {formatCurrency(agendamento.price)}
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <BookingStatusBadge status={ agendamento.bookingStatus } />
                                        <BookingPaymentStatusBadge
                                            status={ agendamento.paymentStatus }
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground dark:text-muted">
                                        {agendamento.totalDuration}h
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
