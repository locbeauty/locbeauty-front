"use client";

import { cn } from "@/lib/utils";
import { formatTime, formatDayName, getWeekDays, isSameDay, isToday , formatCurrency } from "./bookingViewHelpers";
import { Clock, User, MapPin, DollarSign } from "lucide-react";
import type { Checkout } from "@/utils/@types/checkouts";
import type { FlattenedBooking } from "./WeekView";

interface MobileWeekViewProps {
  currentDate: Date
  bookings: Checkout[]
  openBookingDetails: (booking: FlattenedBooking) => void
}

export function MobileWeekView({ currentDate, bookings, openBookingDetails }: MobileWeekViewProps) {
    // Flatten bookings from checkouts
    const flattenedBookings: FlattenedBooking[] = bookings.flatMap((checkout) =>
        checkout.Bookings.map((booking) => {
            // Convert startHourInMinutes to actual start and end dates
            const startDate = new Date(booking.date);
            startDate.setHours(Math.floor(booking.startHourInMinutes / 60));
            startDate.setMinutes(booking.startHourInMinutes % 60);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + booking.totalDurationInMinutes);

            return {
                id: booking.bookingId,
                startDate,
                endDate,
                checkoutId: checkout.checkoutId,
                bookingId: booking.bookingId,
                date: booking.date,
                gearAmount: booking.gearAmount,
                startHourInMinutes: booking.startHourInMinutes,
                totalDurationInMinutes: booking.totalDurationInMinutes,
                price: booking.price,
                observations: booking.observations,
                gear: booking.gear,
                customer: checkout.customer,
                sourceFilial: checkout.sourceFilial,
                bookingStatus: checkout.bookingStatus,
                paymentStatus: checkout.paymentStatus,
                totalPrice: checkout.totalPrice,
                address: checkout.address,
            };
        }),
    );

    const weekDays = getWeekDays(currentDate);

    return (
        <div className="md:hidden block min-w-full">
            {/* Week header with days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 mb-4">
                {weekDays.map((day, index) => (
                    <div key={ index } className={ cn("bg-white p-2 text-center", isToday(day) ? "bg-primary/10" : "") }>
                        <div className="text-xs font-medium text-gray-600 mb-1">{formatDayName(day)}</div>
                        <div className={ cn("text-lg font-bold", isToday(day) ? "text-primary" : "") }>{day.getDate()}</div>
                    </div>
                ))}
            </div>

            {/* Week days with bookings */}
            <div className="space-y-4">
                {weekDays.map((day, dayIndex) => {
                    const dayBookings = flattenedBookings
                        .filter((booking) => isSameDay(booking.startDate, day))
                        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                    return (
                        <div key={ dayIndex } className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Day header */}
                            <div className={ cn("px-4 py-3 border-b border-gray-200", isToday(day) ? "bg-primary/5" : "bg-gray-50") }>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={ cn("font-semibold", isToday(day) ? "text-primary" : "text-gray-900") }>
                                            {day.toLocaleDateString("pt-BR", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </div>
                                        {isToday(day) && (
                                            <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                        Hoje
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {dayBookings.length} agendamento{dayBookings.length !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            </div>

                            {/* Day bookings */}
                            <div className="divide-y divide-gray-100">
                                {dayBookings.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum agendamento para este dia</div>
                                ) : (
                                    dayBookings.map((booking) => {
                                        const durationInHours = booking.totalDurationInMinutes / 60;

                                        return (
                                            <div
                                                key={ booking.id }
                                                className={ cn(
                                                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4",
                                                    // Default colors for bookings with durations different than 4, 6 and 8-12 hours
                                                    "border-gray-400",
                                                    // Colors for 4h bookings duration
                                                    durationInHours === 4 && "border-blue-400 bg-blue-50/30",
                                                    // Colors for 6h bookings duration
                                                    durationInHours === 6 && "border-green-400 bg-green-50/30",
                                                    // Colors for 8 to 12 hours bookings duration
                                                    durationInHours >= 8 && durationInHours <= 12 && "border-purple-400 bg-purple-50/30",
                                                ) }
                                                onClick={ () => openBookingDetails(booking) }
                                            >
                                                <div className="space-y-2">
                                                    {/* Booking header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="font-medium text-gray-900 flex-1">{booking.gear.gearName}</div>
                                                        <div className="text-sm text-gray-500 ml-2">{durationInHours}h</div>
                                                    </div>

                                                    {/* Booking details */}
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span>
                                                                {formatTime(booking.startDate)} - {formatTime(booking.endDate)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="truncate">{booking.customer.fullname}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                            <span className="truncate">{booking.sourceFilial.description}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium text-gray-900">{formatCurrency(booking.price)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Status indicators */}
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <div
                                                            className={ cn(
                                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                                booking.bookingStatus === "Concluido" && "bg-green-100 text-green-800",
                                                                booking.bookingStatus === "Pendente" && "bg-yellow-100 text-yellow-800",
                                                                booking.bookingStatus === "Cancelado" && "bg-red-100 text-red-800",
                                                            ) }
                                                        >
                                                            {booking.bookingStatus}
                                                        </div>
                                                        <div
                                                            className={ cn(
                                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                                booking.paymentStatus === "Pago" && "bg-green-100 text-green-800",
                                                                booking.paymentStatus === "Pendente" && "bg-yellow-100 text-yellow-800",
                                                                booking.paymentStatus === "Parcial" && "bg-red-100 text-red-800",
                                                            ) }
                                                        >
                                                            {booking.paymentStatus}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Week summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Resumo da Semana</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-gray-600">Total de Agendamentos</div>
                        <div className="font-semibold text-lg">
                            {flattenedBookings.filter((booking) => weekDays.some((day) => isSameDay(booking.startDate, day))).length}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-600">Receita Estimada</div>
                        <div className="font-semibold text-lg">
                            {formatCurrency(
                                flattenedBookings
                                    .filter((booking) => weekDays.some((day) => isSameDay(booking.startDate, day)))
                                    .reduce((total, booking) => total + booking.price, 0),
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Legenda de Duração:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-400 rounded border-l-4 border-blue-400"></div>
                        <span className="text-gray-600">4 horas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-400 rounded border-l-4 border-green-400"></div>
                        <span className="text-gray-600">6 horas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-400 rounded border-l-4 border-purple-400"></div>
                        <span className="text-gray-600">8-12 horas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded border-l-4 border-gray-400"></div>
                        <span className="text-gray-600">Outras durações</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
