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
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { MobileDayView } from "./MobileDayView";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { CalendarDayHeader } from "./CalendarDayHeader";
import type { Checkout } from "@/utils/@types/checkouts";
import type { FlattenedBooking } from "./WeekView";

interface DayViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openBookingDetails: (_booking: FlattenedBooking) => void;
}

export function DayView({ currentDate, checkouts, openBookingDetails }: DayViewProps) {
    const flattenedBookings: FlattenedBooking[] = checkouts.flatMap((checkout) =>
        checkout.Bookings.map((booking) => {
            const startDate = new Date(checkout.date);
            startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
            startDate.setMinutes(checkout.startHourInMinutes % 60);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + checkout.totalDurationInMinutes);

            return {
                id: booking.bookingId,
                startDate,
                endDate,
                checkoutId: checkout.checkoutId,
                bookingId: booking.bookingId,
                date: checkout.date,
                gearAmount: 1, // cada booking é uma gear
                startHourInMinutes: checkout.startHourInMinutes,
                totalDurationInMinutes: checkout.totalDurationInMinutes,
                price: checkout.totalPrice / 100,
                observations: checkout.observations,
                gear: booking.gear,
                customer: checkout.customer,
                sourceFilial: checkout.sourceFilial,
                bookingStatus: checkout.checkoutStatus,
                paymentStatus: checkout.paymentStatus,
                totalPrice: checkout.totalPrice / 100,
                address: checkout.address,
            };
        })
    );

    const dayBookings = flattenedBookings.filter((booking) => isSameDay(booking.startDate, currentDate));
    const bookingGroups = groupOverlappingEvents(dayBookings);

    return (
        <>
            <MobileDayView checkouts={ checkouts } currentDate={ currentDate } openBookingDetails={ openBookingDetails } />

            <div className="hidden md:block min-w-full">
                <CalendarDayHeader currentDate={ currentDate } />

                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid grid-cols-2 border-b"
                            style={ { gridTemplateColumns: "100px repeat(1, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
                            <div className="h-16 border-r relative"></div>
                        </div>
                    ))}

                    {bookingGroups.map((group) =>
                        group.map((booking, index) => {
                            const startHour = booking.startDate.getHours();
                            const startMinute = booking.startDate.getMinutes();
                            const durationInHours = booking.totalDurationInMinutes / 60;
                            const top = getDistanceFromTop(startHour, startMinute);
                            const height = getEventBoxHeigh(durationInHours);

                            const width =
                                group.length > 1 ? `calc((100% - 100px - 6px) / ${group.length})` : "calc(100% - 100px - 6px)";
                            const baseLeft = "calc(100px + 2px)";
                            const left = group.length > 1 ? `calc(${baseLeft} + (${index} * ${width}))` : baseLeft;

                            return (
                                <div
                                    key={ booking.id }
                                    className={ cn(
                                        "absolute rounded-md border-l-4 p-2 overflow-auto shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                        "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                        durationInHours === 4 &&
                                            "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                        durationInHours === 6 &&
                                            "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                        durationInHours >= 8 &&
                                            durationInHours <= 12 &&
                                            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                                    ) }
                                    style={ {
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left,
                                        width,
                                    } }
                                    onClick={ () => openBookingDetails(booking) }
                                >
                                    <div className="font-medium text-sm truncate">{booking.gear.gearName}</div>

                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <User className="h-3 w-3" />
                                        {booking.customer.fullname}
                                    </div>

                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <MapPin className="h-3 w-3" />
                                        {booking.sourceFilial.description}
                                    </div>

                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(booking.startDate)} - {formatTime(booking.endDate)}
                                    </div>

                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(booking.price)}
                                    </div>

                                    <div className={ cn("flex gap-2 mt-2", group.length > 1 ? "flex-col" : "") }>
                                        <BookingStatusBadge status={ booking.bookingStatus } />
                                        <BookingPaymentStatusBadge status={ booking.paymentStatus } />
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
