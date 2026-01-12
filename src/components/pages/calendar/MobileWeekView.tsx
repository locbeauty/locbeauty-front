"use client";

import { cn } from "@/lib/utils";
import {
  formatTime,
  formatDayName,
  getWeekDays,
  isSameDay,
  isToday,
  formatCurrency,
  CalendarEvent,
} from "./bookingViewHelpers";
import { Clock, User, MapPin, DollarSign, GraduationCap } from "lucide-react";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";

interface MobileWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  openDetails: (_event: CalendarEvent) => void;
}

export function MobileWeekView({
  currentDate,
  events,
  openDetails,
}: MobileWeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="md:hidden block min-w-full">
      {/* Cabeçalho da semana */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 mb-4">
        {weekDays.map((day, index) => (
          <div
            key={ index }
            className={ cn(
              "bg-white p-2 text-center",
              isToday(day) ? "bg-primary/10" : ""
            ) }
          >
            <div className="text-xs font-medium text-gray-600 mb-1">
              {formatDayName(day)}
            </div>
            <div
              className={ cn(
                "text-lg font-bold",
                isToday(day) ? "text-primary" : ""
              ) }
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Dias e agendamentos */}
      <div className="space-y-4">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = events
            .filter((event) => {
              const date =
                "trainingId" in event
                  ? new Date((event as Training).dueDate)
                  : new Date((event as Checkout).date);
              return isSameDay(date, day);
            })
            .sort((a, b) => {
              const dateA =
                "trainingId" in a
                  ? new Date((a as Training).dueDate)
                  : new Date((a as Checkout).date);
              const dateB =
                "trainingId" in b
                  ? new Date((b as Training).dueDate)
                  : new Date((b as Checkout).date);
              return dateA.getTime() - dateB.getTime();
            });

          return (
            <div
              key={ dayIndex }
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div
                className={ cn(
                  "px-4 py-3 border-b border-gray-200",
                  isToday(day) ? "bg-primary/5" : "bg-gray-50"
                ) }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={ cn(
                        "font-semibold",
                        isToday(day) ? "text-primary" : "text-gray-900"
                      ) }
                    >
                      {day.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    {isToday(day) && (
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                        Hoje
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {dayEvents.length} agendamento
                    {dayEvents.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {dayEvents.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
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
                      startDate.setHours(
                        Math.floor(training.hourInMinutes / 60)
                      );
                      startDate.setMinutes(training.hourInMinutes % 60);

                      endDate = new Date(startDate);
                      endDate.setMinutes(
                        endDate.getMinutes() + durationInHours * 60
                      );

                      title = training.Gear.gearName;
                      personName = training.Trainee.name;
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
                      startDate.setHours(
                        Math.floor(checkout.startHourInMinutes / 60)
                      );
                      startDate.setMinutes(checkout.startHourInMinutes % 60);

                      endDate = new Date(startDate);
                      endDate.setMinutes(
                        endDate.getMinutes() + checkout.totalDurationInMinutes
                      );

                      title = checkout.Bookings.filter(
                        (b) => b.status === "ACTIVE"
                      )
                        .map((b) => b.Gear.gearName)
                        .join(", ");
                      personName = checkout.Customer.fullname;
                      location = checkout.SourceFilial.filialName;
                      price = centsToStringWithCurrencyMark(
                        checkout.totalPrice
                      );
                      status = checkout.checkoutStatus;
                    }

                    const getBookingClassNames = () => {
                      if (isTraining) {
                        return cn(
                          "p-4 cursor-pointer hover:bg-muted/20 transition-colors border-l-4",
                          "border-blue-400 bg-blue-50/30"
                        );
                      }
                      return cn(
                        "p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4",
                        "border-gray-400",
                        durationInHours === 4 &&
                          "border-blue-400 bg-blue-50/30",
                        durationInHours === 6 &&
                          "border-green-400 bg-green-50/30",
                        durationInHours >= 8 &&
                          durationInHours <= 12 &&
                          "border-purple-400 bg-purple-50/30"
                      );
                    };

                    return (
                      <div
                        key={ key }
                        className={ getBookingClassNames() }
                        onClick={ () => openDetails(event) }
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-900 flex-1 flex items-center gap-2">
                              {isTraining && (
                                <GraduationCap className="h-4 w-4" />
                              )}
                              {title}
                            </div>
                            <div className="text-sm text-gray-500 ml-2">
                              {durationInHours}h
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>
                                {formatTime(startDate)} - {formatTime(endDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{personName}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {price}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <div
                              className={ cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                status === "Concluido" &&
                                  "bg-green-100 text-green-800",
                                status === "Pendente" &&
                                  "bg-yellow-100 text-yellow-800",
                                status === "Cancelado" &&
                                  "bg-red-100 text-red-800",
                                isTraining &&
                                  "bg-blue-100 text-blue-800 capitalize"
                              ) }
                            >
                              {isTraining ? status.toLowerCase() : status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo da semana */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Resumo da Semana
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total de Agendamentos</div>
            <div className="font-semibold text-lg">
              {
                events.filter((event) => {
                  const date =
                    "trainingId" in event
                      ? new Date((event as Training).dueDate)
                      : new Date((event as Checkout).date);
                  return weekDays.some((day) => isSameDay(date, day));
                }).length
              }
            </div>
          </div>
          <div>
            <div className="text-gray-600">Receita Estimada</div>
            <div className="font-semibold text-lg">
              {formatCurrency(
                events
                  .filter((event) => {
                    const date =
                      "trainingId" in event
                        ? new Date((event as Training).dueDate)
                        : new Date((event as Checkout).date);
                    return weekDays.some((day) => isSameDay(date, day));
                  })
                  .reduce((total, event) => {
                    if ("trainingId" in event) {
                      return (
                        total +
                        ((event as Training).TrainingPayment?.reduce((acc, payment) => acc + payment.totalPrice, 0) || 0)
                      );
                    }
                    return total + (event as Checkout).totalPrice;
                  }, 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="text-xs font-medium text-gray-700 mb-2">
          Legenda de Duração:
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded border-l-4 border-blue-500"></div>
            <span className="text-gray-600">Treinamento</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 rounded border-l-4 border-blue-400"></div>
            <span className="text-gray-600">4 horas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 rounded border-l-4 border-green-400"></div>
            <span className="text-gray-600">6 horas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-50 rounded border-l-4 border-purple-400"></div>
            <span className="text-gray-600">8-12 horas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-50 rounded border-l-4 border-gray-400"></div>
            <span className="text-gray-600">Outras durações</span>
          </div>
        </div>
      </div>
    </div>
  );
}
