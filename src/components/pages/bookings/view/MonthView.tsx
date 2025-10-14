"use client";

import { cn } from "@/lib/utils";
import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import type { Checkout } from "@/utils/@types/checkouts";
import type { FlattenedBooking } from "./WeekView";
import { MobileMonthView } from "./MobileMonthView";

interface MonthViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openBookingDetails: (_booking: FlattenedBooking) => void;
}

export function MonthView({ currentDate, checkouts, openBookingDetails }: MonthViewProps) {
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
                gearAmount: 1,
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

    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <>
            <MobileMonthView
                bookings={ checkouts }
                currentDate={ currentDate }
                openBookingDetails={ openBookingDetails }
            />
            <div className="hidden md:block min-w-full">
                <CalendarMonthHeader />

                <div className="grid grid-cols-7">
                    {daysInCurrentMonth.map((day, index) => {
                        const dayBookings = flattenedBookings.filter((booking) =>
                            isSameDay(booking.startDate, day)
                        );

                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={ index }
                                className={ cn(
                                    "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
                                    dayBookings.length > 3 && "overflow-y-scroll",
                                    isToday(day) ? "bg-primary/90" : "",
                                    !isCurrentMonth ? "bg-gray-100 text-red-300" : ""
                                ) }
                            >
                                <div
                                    className={ cn(
                                        "text-right p-1 font-medium text-sm",
                                        isToday(day) ? "text-white font-extrabold" : ""
                                    ) }
                                >
                                    {day.getDate()}
                                </div>

                                <div className="space-y-1 mt-1">
                                    {dayBookings
                                        .sort((a, b) => a.startDate.getHours() - b.startDate.getHours())
                                        .map((booking) => {
                                            const durationInHours = booking.totalDurationInMinutes / 60;

                                            return (
                                                <div
                                                    key={ booking.id }
                                                    className={ cn(
                                                        "text-xs p-1 rounded border-l-2 cursor-pointer truncate",
                                                        "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                                        durationInHours === 4 &&
                                                            "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                                        durationInHours === 6 &&
                                                            "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                                        durationInHours >= 8 &&
                                                            durationInHours <= 12 &&
                                                            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                                                    ) }
                                                    onClick={ () => openBookingDetails(booking) }
                                                >
                                                    {formatTime(booking.startDate)} - {booking.gear.gearName}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
