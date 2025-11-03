"use client";

import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { formatCurrency, formatTime, getDistanceFromTop, getEventBoxHeigh } from "./bookingViewHelpers";
import { cn } from "@/lib/utils";
import type { FlattenedBooking } from "./WeekView";
import { centsToString } from "@/utils/centsToString";

interface SingleEventBoxProps {
  group: FlattenedBooking[]
  dayIndex: number
  openCheckoutDetails: (_booking: FlattenedBooking) => void
}

export function SingleEventBox({ group, dayIndex, openCheckoutDetails }: SingleEventBoxProps) {
    // If the group has only one event, use full width
    const hourColumnWidth = 100;
    const booking = group[0];
    const startHour = booking.startDate.getHours();
    const startMinute = booking.startDate.getMinutes();
    const durationInHours = booking.totalDurationInMinutes / 60;

    // Calculate position and height
    const top = getDistanceFromTop(startHour, startMinute);
    const height = getEventBoxHeigh(durationInHours);

    // Calculate horizontal position considering hour column width
    const columnWidth = hourColumnWidth ? `calc((100% - ${hourColumnWidth}px) / 7)` : "12.5%";
    const left = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(12.5% + (${dayIndex} * ${columnWidth}))`;
    const width = `calc(${columnWidth} - 2px)`;

    // Convert totalDuration from minutes to hours for styling logic
    return (
        <div
            key={ booking.checkoutId }
            className={ cn(
                "absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-y-auto",
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
                width,
            } }
            onClick={ () => openCheckoutDetails(booking) }
        >
            <div className="font-medium text-sm truncate">{booking.bookings.map(item => item.gearName).join(", ")}</div>

            <div className="flex items-center text-xs gap-1 truncate">
                <User className="h-3 w-3" />
                {booking.customer.fullname}
            </div>

            <div className="flex items-center text-xs gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {booking.address.city.cityName}
            </div>

            <div className="flex items-center text-xs gap-1 truncate">
                <Clock className="h-3 w-3" />
                {formatTime(booking.startDate)}
            </div>

            <div className="flex items-center text-xs gap-1 truncate">
                <DollarSign className="h-3 w-3" />
                {centsToString(booking.totalPrice)}
            </div>
        </div>
    );
}
