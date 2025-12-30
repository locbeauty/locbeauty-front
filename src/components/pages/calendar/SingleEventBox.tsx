"use client";

import { Clock, DollarSign, MapPin, User, GraduationCap } from "lucide-react";
import {
    CalendarEvent,
    getDistanceFromTop,
    getEventBoxHeigh,
} from "./bookingViewHelpers";
import { cn } from "@/lib/utils";
import { centsToString } from "@/utils/centsToString";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";

interface SingleEventBoxProps {
  eventType?: "training" | "checkout";
  group: CalendarEvent[];
  dayIndex: number;
  openDetails: (_event: CalendarEvent) => void;
  totalColumns?: number;
}

export function SingleEventBox({
    group,
    dayIndex,
    openDetails,
    totalColumns = 7,
}: SingleEventBoxProps) {
    // If the group has only one event, use full width
    const hourColumnWidth = 100;
    const event = group[0];
    const isTraining = "trainingId" in event;
    const training = event as Training;
    const checkout = event as Checkout;

    // Common properties logic
    const startHourInMinutes = isTraining
        ? training.hourInMinutes
        : checkout.startHourInMinutes;
    const durationInHours = isTraining ? 2 : checkout.totalDurationInMinutes / 60;

    const startHour = Math.floor(startHourInMinutes / 60);
    const startMinute = startHourInMinutes % 60;

    // Calculate position and height
    const top = getDistanceFromTop(startHour, startMinute);
    const height = getEventBoxHeigh(durationInHours);

    // Calculate horizontal position considering hour column width
    const columnWidth = hourColumnWidth
        ? `calc((100% - ${hourColumnWidth}px) / ${totalColumns})`
        : `${100 / totalColumns}%`;
    const left = hourColumnWidth
        ? `calc(${hourColumnWidth}px + (${dayIndex} * ${columnWidth}))`
        : `calc(${100 / totalColumns}% + (${dayIndex} * ${columnWidth}))`;
    const width = `calc(${columnWidth} - 2px)`;

    // Convert totalDuration from minutes to hours for styling logic
    return (
        <div
            key={ isTraining ? training.trainingId : checkout.checkoutId }
            className={ cn(
                "absolute rounded-md border-l-4 p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-y-auto",
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
                width,
            } }
            onClick={ () => openDetails(event) }
        >
            <div className="font-medium text-sm truncate flex items-center gap-1">
                {isTraining && <GraduationCap className="h-3 w-3" />}
                {isTraining
                    ? training.Gear.gearName
                    : checkout.Bookings.filter((booking) => booking.status === "ACTIVE")
                        .sort((a, b) => a.Gear.gearName.localeCompare(b.Gear.gearName))
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

            {!isTraining && (
                <div
                    className={ cn(
                        "absolute bottom-0 left-0 h-1 w-full",
                        checkout.CheckoutPayment?.paymentStatus === "Pago"
                            ? "bg-green-500"
                            : new Date(checkout.date) < new Date()
                                ? "bg-red-500"
                                : "bg-yellow-500"
                    ) }
                />
            )}
            {isTraining && (
                <div
                    className={ cn(
                        "absolute bottom-0 left-0 h-1 w-full",
                        training.trainingStatus === "Concluido"
                            ? "bg-green-500"
                            : new Date(training.dueDate) < new Date()
                                ? "bg-red-500"
                                : "bg-yellow-500"
                    ) }
                />
            )}
        </div>
    );
}
