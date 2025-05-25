"use client";

import { cn } from "@/lib/utils";
import {
    formatCurrency,
    formatTime,
    getDistanceFromTop,
    getEventBoxHeigh,
    isSameDay,
    workingHours,
    groupOverlappingEvents,
} from "./bookingViewHelpers";
import type { Agendamento } from "@/app/(main)/bookings/page";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { MobileDayView } from "./MobileDayView";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { CalendarDayHeader } from "./CalendarDayHeader";

interface DayViewProps {
  currentDate: Date;
  bookings: Agendamento[];
  openBookingDetails: (_agendamento: Agendamento) => void;
}

export function DayView({
    currentDate,
    bookings,
    openBookingDetails,
}: DayViewProps) {
    // Filtrar agendamentos do dia atual
    const dayAgendamentos = bookings.filter((agendamento) =>
        isSameDay(agendamento.startDate, currentDate)
    );

    // Agrupar agendamentos que se sobrepõem
    const agendamentoGroups = groupOverlappingEvents(dayAgendamentos);

    return (
        <>
            <MobileDayView
                bookings={ bookings }
                currentDate={ currentDate }
                openBookingDetails={ openBookingDetails }
            />
            <div className="hidden md:block min-w-full">
                {/* Cabeçalho do dia */}
                <CalendarDayHeader currentDate={ currentDate } />

                {/* Grade de horários */}
                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid grid-cols-2 border-b"
                            style={ { gridTemplateColumns: "100px repeat(1, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">
                                {`${hour}:00`}
                            </div>
                            <div className="h-16 border-r relative"></div>
                        </div>
                    ))}

                    {/* Renderização dos agendamentos agrupados */}
                    {agendamentoGroups.map((group) =>
                        group.map((agendamento, index) => {
                            const startHour = agendamento.startDate.getHours();
                            const startMinute = agendamento.startDate.getMinutes();

                            const top = getDistanceFromTop(startHour, startMinute);
                            const height = getEventBoxHeigh(agendamento.totalDuration);

                            const width =
                group.length > 1
                    ? `calc((100% - 100px - 6px) / ${group.length})`
                    : "calc(100% - 100px - 6px)";
                            const baseLeft = "calc(100px + 2px)";
                            const left =
                group.length > 1
                    ? `calc(${baseLeft} + (${index} * ${width}))`
                    : baseLeft;

                            return (
                                <div
                                    key={ agendamento.id }
                                    className={ cn(
                                        "absolute rounded-md border-l-4 p-2 overflow-auto shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                        "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                        agendamento.totalDuration === 4 &&
                      "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                        agendamento.totalDuration === 6 &&
                      "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                        agendamento.totalDuration >= 8 &&
                      agendamento.totalDuration <= 12 &&
                      "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                                    ) }
                                    style={ {
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: left,
                                        width: width,
                                    } }
                                    onClick={ () => openBookingDetails(agendamento) }
                                >
                                    <div className="font-medium text-sm truncate">
                                        {agendamento.gear}
                                    </div>
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
                                        {formatTime(agendamento.startDate)} -{" "}
                                        {formatTime(agendamento.endDate)}
                                    </div>
                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(agendamento.price)}
                                    </div>
                                    <div
                                        className={ cn(
                                            "flex gap-2 mt-2",
                                            group.length > 1 ? "flex-col" : ""
                                        ) }
                                    >
                                        <BookingStatusBadge status={ agendamento.bookingStatus } />
                                        <BookingPaymentStatusBadge
                                            status={ agendamento.paymentStatus }
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
