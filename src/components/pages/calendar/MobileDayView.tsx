"use client";

import { cn } from "@/lib/utils";
import {
  formatDayName,
  formatTime,
  isSameDay,
  isToday,
  CalendarEvent,
} from "./bookingViewHelpers";
import { Clock, DollarSign, MapPin, User, GraduationCap } from "lucide-react";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { CheckoutStatuses } from "@/utils/constants";
import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";

interface MobileDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function MobileDayView({
  events,
  currentDate,
  openDetails,
}: MobileDayViewProps) {
  const dayEvents = events.filter((event) => {
    const date =
      "trainingId" in event
        ? new Date((event as Training).dueDate)
        : new Date((event as Checkout).date);
    return isSameDay(date, currentDate);
  });

  const getBookingClassNames = (
    durationInHours: number,
    isTraining: boolean
  ) => {
    if (isTraining) {
      return cn(
        "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500"
      );
    }
    return cn(
      "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
      "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
      durationInHours === 4 &&
        "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
      durationInHours === 6 &&
        "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
      durationInHours >= 8 &&
        durationInHours <= 12 &&
        "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
    );
  };

  return (
    <div className="md:hidden block min-w-full">
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

      <div className="divide-y">
        {dayEvents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhum agendamento para este dia
          </div>
        ) : (
          dayEvents.map((event) => {
            const isTraining = "trainingId" in event;
            let durationInHours = 0;
            let startDate: Date;
            let endDate: Date;
            let title = "";
            let personName = "";
            let location = "";
            let price = "";
            let status = "";
            let key = "";

            if (isTraining) {
              const training = event as Training;
              key = training.trainingId;
              durationInHours = 2; // Default for now
              startDate = new Date(training.dueDate);
              startDate.setHours(Math.floor(training.hourInMinutes / 60));
              startDate.setMinutes(training.hourInMinutes % 60);

              endDate = new Date(startDate);
              endDate.setMinutes(endDate.getMinutes() + durationInHours * 60);

              title = training.Gear.gearName;
              personName = training.Trainee?.fullname || "";
              location = training.SourceFilial.filialName;
              price = centsToStringWithCurrencyMark(
                training.TrainingPayment?.reduce((acc, payment) => acc + payment.totalPrice, 0) || 0
              );
              status = training.trainingStatus;
            } else {
              const checkout = event as Checkout;
              key = checkout.checkoutId;
              durationInHours = checkout.totalDurationInMinutes / 60;
              startDate = new Date(checkout.date);
              startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
              startDate.setMinutes(checkout.startHourInMinutes % 60);

              endDate = new Date(startDate);
              endDate.setMinutes(
                endDate.getMinutes() + checkout.totalDurationInMinutes
              );

              title = checkout.Bookings.filter((b) => b.status === "ACTIVE")
                .map((b) => b.Gear.gearName)
                .join(", ");
              personName = checkout.Customer.fullname;
              location = checkout.SourceFilial.filialName;
              price = centsToStringWithCurrencyMark(checkout.totalPrice);
              status = checkout.checkoutStatus;
            }

            return (
              <div
                key={ key }
                className={ getBookingClassNames(durationInHours, isTraining) }
                onClick={ () => openDetails(event) }
              >
                <div className="font-medium flex items-center gap-2">
                  {isTraining && <GraduationCap className="h-4 w-4" />}
                  {title}
                </div>

                <div className="text-sm text-muted-foreground mt-1 dark:text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </div>

                  <div className="flex items-center gap-1 mt-1 max-w-[80vw]">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                      {personName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {price}
                  </div>
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <div className="flex gap-2">
                    <BookingStatusBadge status={ status as CheckoutStatuses } />
                  </div>
                  <span className="text-xs text-muted-foreground dark:text-muted">
                    {durationInHours}h
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
