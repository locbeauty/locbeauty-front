"use client";

import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { formatCurrency, formatTime, getDistanceFromTop, getEventBoxHeigh } from "./bookingViewHelpers";
import { cn } from "@/lib/utils";
import type { FlattenedBooking } from "./WeekView";
import { Checkout } from "@/utils/@types/checkouts";
import { centsToString } from "@/utils/centsToString";

interface MultipleEventBoxProps {
  group: Checkout[]
  dayIndex: number
  openCheckoutDetails: (_checkout: Checkout) => void
}

export function MultipleEventBox({ group, dayIndex, openCheckoutDetails }: MultipleEventBoxProps) {
    // If the group has multiple events, divide the width
    const hourColumnWidth = 100;

    // Calculate horizontal position considering hour column width
    const columnWidth = hourColumnWidth ? `calc((100% - ${hourColumnWidth}px) / 7)` : "12.5%";
    const baseLeft = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(12.5% + (${dayIndex} * ${columnWidth}))`;

    // Calculate width for each booking in the group
    const eventWidth = `calc((${columnWidth} - 2px) / ${group.length})`;

    return group.map((checkout, bookingIndex) => {
        const durationInHours = checkout.totalDurationInMinutes / 60;

        // Calculate booking height
        const height = getEventBoxHeigh(durationInHours);

        // Calculate horizontal position for each booking in the group
        // Each event occupies an equal fraction of the available width
        const left = `calc(${baseLeft} + (${bookingIndex} * ${eventWidth}))`;

        // Calculate initial position
        // const top = getDistanceFromTop(booking.startDate.getHours(), booking.startDate.getMinutes());
        const startHour = Math.floor(checkout.startHourInMinutes / 60);
        const startMinute = checkout.startHourInMinutes % 60;

        const top = getDistanceFromTop(startHour, startMinute);

        // Convert totalDuration from minutes to hours for styling logic

        return (
            <div
                key={ checkout.checkoutId }
                className={ cn(
                    "overflow-y-auto absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                    // Default colors for bookings with durations different than 4, 6 and 8-12 hours
                    "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                    // Colors for 4h bookings duration
                    durationInHours === 4 && "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                    // Colors for 6h bookings duration
                    durationInHours === 6 && "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                    // Colors for 8 to 12 hours bookings duration
                    durationInHours >= 8 &&
            durationInHours <= 12 &&
            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border",
                ) }
                style={ {
                    top: `${top}px`,
                    height: `${height}px`,
                    left,
                    width: eventWidth,
                    overflowX: "hidden",
                } }
                onClick={ () => openCheckoutDetails(checkout) }
            >
                <div className="font-medium text-sm truncate">{checkout.Bookings.filter(booking => booking.status === "ACTIVE").map(item => item.gear.gearName).join(", ")}</div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <User className="h-3 w-3" />
                    {checkout.customer.fullname}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <MapPin className="h-3 w-3" />
                    {checkout.sourceFilial.filialName}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <Clock className="h-3 w-3" />
                    {formatTime(checkout.date)}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <DollarSign className="h-3 w-3" />
                    {centsToString(checkout.totalPrice)}
                </div>

                <div
                    className={ cn(
                        "absolute bottom-0 left-0 h-1 w-full",
                        checkout.CheckoutPayment.paymentStatus === "Pago"
                            ? "bg-green-500"
                            : checkout.date < new Date()
                                ? "bg-red-500"
                                : "bg-yellow-500"
                    ) }
                />
            </div>

        );
    });
}
