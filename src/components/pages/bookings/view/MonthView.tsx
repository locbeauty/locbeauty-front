"use client";

import { cn } from "@/lib/utils";
import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import type { Checkout } from "@/utils/@types/checkouts";
import { MobileMonthView } from "./MobileMonthView";

interface MonthViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openCheckoutDetails: (_booking: Checkout) => void;
}

export function MonthView({ currentDate, checkouts, openCheckoutDetails }: MonthViewProps) {
    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <>
            {/* <MobileMonthView
                bookings={ checkouts }
                currentDate={ currentDate }
                openCheckoutDetails={ openCheckoutDetails }
            /> */}
            <div className="hidden md:block min-w-full">
                <CalendarMonthHeader />

                <div className="grid grid-cols-7">
                    {daysInCurrentMonth.map((day, index) => {
                        const dayBookings = checkouts.filter((checkout) =>
                            isSameDay(new Date(checkout.date), day)
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
                                        .sort((a, b) => {
                                            const aDate = new Date(a.date);
                                            aDate.setHours(Math.floor(a.startHourInMinutes / 60));
                                            const bDate = new Date(b.date);
                                            bDate.setHours(Math.floor(b.startHourInMinutes / 60));
                                            return aDate.getHours() - bDate.getHours();
                                        })
                                        .map((checkout) => {
                                            const durationInHours = checkout.totalDurationInMinutes / 60;
                                            const bookingDate = new Date(checkout.date);
                                            bookingDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
                                            bookingDate.setMinutes(checkout.startHourInMinutes % 60);

                                            return (
                                                <div
                                                    key={ checkout.checkoutId }
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
                                                    onClick={ () => openCheckoutDetails(checkout) }
                                                >
                                                    {formatTime(bookingDate)} - {checkout.Bookings.filter((b) => b.status === "ACTIVE").map((b) => b.Gear.gearName).join(", ")}
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
