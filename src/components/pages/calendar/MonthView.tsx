"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatTime,
  getMonthDays,
  isSameDay,
  isToday,
  CalendarEvent,
  getEventBasicInfo,
  isDateInRange,
} from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import { MobileMonthView } from "./MobileMonthView";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function MonthView({
  currentDate,
  events,
  openDetails,
}: MonthViewProps) {
  const daysInCurrentMonth = getMonthDays(currentDate);

  return (
    <>
      <MobileMonthView
        events={ events }
        currentDate={ currentDate }
        openDetails={ openDetails }
      />
      <div className="hidden md:block min-w-full">
        <CalendarMonthHeader />

        <div className="grid grid-cols-7">
          {daysInCurrentMonth.map((day, index) => {
            const dayEvents = events.filter((event) => {
              const { startDate, endDate } = getEventBasicInfo(event);
              return isDateInRange(day, startDate, endDate);
            });

            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={ index }
                className={ cn(
                  "min-h-[200px] border-r border-b p-1 relative",
                  isToday(day) ? "bg-primary/90" : "",
                  !isCurrentMonth ? "bg-gray-100 text-red-300" : "",
                ) }
              >
                <div
                  className={ cn(
                    "text-right p-1 font-medium text-sm",
                    isToday(day) ? "text-white font-extrabold" : "",
                  ) }
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1 mt-1 max-h-[200px] overflow-y-auto">
                  {dayEvents
                    .sort((a, b) => {
                      const { startDate: dateA } = getEventBasicInfo(a);
                      const { startDate: dateB } = getEventBasicInfo(b);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((event) => {
                      const {
                        isTraining,
                        isBirthday,
                        isNotice,
                        id,
                        title,
                        city,
                        durationInHours,
                        startDate,
                        paymentStatus,
                      } = getEventBasicInfo(event);

                      const isCheckout =
                        !isTraining && !isBirthday && !isNotice;

                      // Cor da bolinha = duração do agendamento
                      let dotClass = "bg-gray-400";
                      if (durationInHours < 6) {
                        dotClass = "bg-orange-500"; // Laranja: menos de 6h
                      } else if (durationInHours < 8) {
                        dotClass = "bg-yellow-300"; // Amarelo claro: de 6h a 7h
                      } else {
                        dotClass = "bg-green-400"; // Verde claro: 8h ou mais
                      }

                      // Cor de fundo do card = status do pagamento
                      let containerClass =
                        "bg-red-700 text-white border-red-900"; // Pendente (padrão)
                      if (paymentStatus === "Pago") {
                        containerClass =
                          "bg-green-800 text-white border-green-900"; // Verde escuro: concluído
                      } else if (paymentStatus === "Parcial") {
                        containerClass =
                          "bg-yellow-600 text-white border-yellow-700"; // Amarelo escuro: parcial
                      }

                      return (
                        <div
                          key={ id }
                          className={ cn(
                            "p-1 rounded border-l-2",
                            isTraining
                              ? "bg-purple-500 dark:bg-purple-900/20 text-white dark:text-purple-300 border-purple-500 text-sm truncate cursor-pointer"
                              : isNotice
                                ? "bg-blue-800 text-white border-blue-900 text-sm truncate cursor-pointer"
                                : isBirthday
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-500 text-sm font-semibold whitespace-normal h-auto"
                                  : cn(
                                    containerClass,
                                    "flex items-start gap-1 text-sm cursor-pointer truncate",
                                  ),
                          ) }
                          onClick={ () => openDetails(event) }
                          title={ `${
                            !isBirthday ? formatTime(startDate) + " - " : ""
                          }${title}${isCheckout && city ? ` - ${city}` : ""}` }
                        >
                          {isCheckout && (
                            <div
                              className={ cn(
                                "w-2 h-2 rounded-full shrink-0 mt-1.5",
                                dotClass,
                              ) }
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className={ cn(isCheckout ? "truncate" : "") }>
                              {!isBirthday && !isNotice && (
                                <>{formatTime(startDate)} - </>
                              )}
                              {title}
                            </div>
                            {isCheckout && city && (
                              <div className="flex items-center gap-0.5 text-xs opacity-80 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{city}</span>
                              </div>
                            )}
                          </div>
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
