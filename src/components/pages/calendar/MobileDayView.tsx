"use client";

import { cn } from "@/lib/utils";
import {
  formatDayName,
  formatTime,
  isSameDay,
  isToday,
  CalendarEvent,
  getEventBasicInfo,
  getCheckoutColorClasses,
} from "./bookingViewHelpers";
import {
  Clock,
  DollarSign,
  MapPin,
  User,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";
import { Notice } from "@/utils/@types/notice";
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
  const dayEvents = events.filter((event) =>
    isSameDay(getEventBasicInfo(event).startDate, currentDate)
  );

  const getBookingClassNames = (params: {
    durationInHours: number;
    isTraining: boolean;
    isNotice: boolean;
    paymentStatus?: string | null;
    isPast: boolean;
  }) => {
    const { durationInHours, isTraining, isNotice, paymentStatus, isPast } =
      params;
    if (isNotice) {
      return cn(
        "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
        "bg-blue-800 text-white border-blue-900"
      );
    }
    if (isTraining) {
      return cn(
        "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500"
      );
    }
    // Checkout: duração antes da locação passar, pagamento depois
    return cn(
      "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
      getCheckoutColorClasses({ durationInHours, paymentStatus, isPast })
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
            const isNotice = "noticeId" in event;
            let durationInHours = 0;
            let startDate: Date;
            let endDate: Date;
            let title = "";
            let personName = "";
            let location = "";
            let price = "";
            let status = "";
            let key = "";
            let paymentStatus: string | null | undefined = null;

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
            } else if (isNotice) {
              const notice = event as Notice;
              key = notice.noticeId;
              durationInHours = Math.max(
                (notice.endHourInMinutes - notice.startHourInMinutes) / 60,
                0.5
              );
              startDate = new Date(notice.startDate);
              startDate.setHours(Math.floor(notice.startHourInMinutes / 60));
              startDate.setMinutes(notice.startHourInMinutes % 60);

              endDate = new Date(startDate);
              endDate.setMinutes(endDate.getMinutes() + durationInHours * 60);

              title = notice.description;
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
              paymentStatus = checkout.CheckoutPayment?.paymentStatus;
            }

            const isPast = endDate < new Date();

            return (
              <div
                key={ key }
                className={ getBookingClassNames({
                  durationInHours,
                  isTraining,
                  isNotice,
                  paymentStatus,
                  isPast,
                }) }
                onClick={ () => openDetails(event) }
              >
                <div className="font-medium flex items-center gap-2">
                  {isTraining && <GraduationCap className="h-4 w-4" />}
                  {isNotice && <Megaphone className="h-4 w-4 shrink-0" />}
                  {title}
                </div>

                <div
                  className={ cn(
                    "text-sm mt-1",
                    isNotice
                      ? "text-white/80"
                      : "text-muted-foreground dark:text-muted"
                  ) }
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </div>

                  {!isNotice && (
                    <>
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
                    </>
                  )}
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <div className="flex gap-2">
                    {!isNotice && (
                      <BookingStatusBadge
                        status={ status as CheckoutStatuses }
                      />
                    )}
                  </div>
                  <span
                    className={ cn(
                      "text-xs",
                      isNotice
                        ? "text-white/80"
                        : "text-muted-foreground dark:text-muted"
                    ) }
                  >
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
