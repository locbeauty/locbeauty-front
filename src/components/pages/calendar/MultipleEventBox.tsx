"use client";

import { Clock, DollarSign, MapPin, User, GraduationCap } from "lucide-react";
import {
    CalendarEvent,
    getDistanceFromTop,
    getEventBoxHeigh,
} from "./bookingViewHelpers";
import { cn } from "@/lib/utils";
import { Checkout } from "@/utils/@types/checkouts";
import { centsToString } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";

interface MultipleEventBoxProps {
  group: CalendarEvent[];
  dayIndex: number;
  openDetails: (_event: CalendarEvent) => void;
  totalColumns?: number;
}

export function MultipleEventBox({
    group,
    dayIndex,
    openDetails,
    totalColumns = 7,
}: MultipleEventBoxProps) {
    // If the group has multiple events, divide the width
    const hourColumnWidth = 100;

    // Calculate horizontal position considering hour column width
    const columnWidth = hourColumnWidth
        ? `calc((100% - ${hourColumnWidth}px) / ${totalColumns})`
        : `${100 / totalColumns}%`;
    const baseLeft = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(${100 / totalColumns}% + (${dayIndex} * ${columnWidth}))`;

    // Calculate width for each booking in the group
    const eventWidth = `calc((${columnWidth} - 2px) / ${group.length})`;

    return group.map((event, bookingIndex) => {
        const isTraining = "trainingId" in event;
        const training = event as Training;
        const checkout = event as Checkout;

        const durationInHours = isTraining
            ? 2
            : checkout.totalDurationInMinutes / 60;

        // Calculate booking height
        const height = getEventBoxHeigh(durationInHours);

        // Calculate horizontal position for each booking in the group
        // Each event occupies an equal fraction of the available width
        const left = `calc(${baseLeft} + (${bookingIndex} * ${eventWidth}))`;

        // Calculate initial position
        const startHourInMinutes = isTraining
            ? training.hourInMinutes
            : checkout.startHourInMinutes;
        const startHour = Math.floor(startHourInMinutes / 60);
        const startMinute = startHourInMinutes % 60;

        const top = getDistanceFromTop(startHour, startMinute);

        return (
            <div
                key={ isTraining ? training.trainingId : checkout.checkoutId }
                className={ cn(
                    "overflow-y-auto absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                    // Training specific styling
                    isTraining &&
            "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-500",
                    !isTraining &&
            "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                    // Colors for 4h bookings duration
                    !isTraining &&
            durationInHours === 4 &&
            "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                    // Colors for 6h bookings duration
                    !isTraining &&
            durationInHours === 6 &&
            "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                    // Colors for 8 to 12 hours bookings duration
                    !isTraining &&
            durationInHours >= 8 &&
            durationInHours <= 12 &&
            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
                ) }
                style={ {
                    top: `${top}px`,
                    height: `${height}px`,
                    left,
                    width: eventWidth,
                    overflowX: "hidden",
                } }
                onClick={ () => openDetails(event) }
            >
                <div className="font-medium text-sm truncate flex items-center gap-1">
                    {isTraining && <GraduationCap className="h-3 w-3" />}
                    {isTraining
                        ? training.Gear.gearName
                        : checkout.Bookings.filter((booking) => booking.status === "ACTIVE")
                            .map((item) => item.Gear.gearName)
                            .join(", ")}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <User className="h-3 w-3" />
                    {isTraining ? training.Trainee.name : checkout.Customer.fullname}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <MapPin className="h-3 w-3" />
                    {isTraining
                        ? training.SourceFilial.filialName
                        : checkout.SourceFilial?.filialName ||
              checkout.Address?.City?.cityName}
                </div>

                <div className="flex items-center text-xs gap-1 truncate">
                    <Clock className="h-3 w-3" />
                    {String(startHour).padStart(2, "0")}:
                    {String(startMinute).padStart(2, "0")}
                </div>

                {!isTraining && (
                    <div className="flex items-center text-xs gap-1 truncate">
                        <DollarSign className="h-3 w-3" />
                        {centsToString(checkout.totalPrice)}
                    </div>
                )}
            </div>
        );
    });
}
