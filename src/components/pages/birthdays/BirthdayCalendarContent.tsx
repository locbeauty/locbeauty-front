"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DayView } from "../calendar/DayView";
import { WeekView } from "../calendar/WeekView";
import { MonthView } from "../calendar/MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ApiResponse } from "@/lib/api";
import { CalendarEvent } from "../calendar/bookingViewHelpers";
import { GetBirthdays } from "@/services/birthdays.service";
import { BirthdayEvent } from "@/utils/@types/birthday";

interface BirthdayCalendarContentProps {
  viewType: "semana" | "dia" | "mes";
  currentDate: Date;
}

export function BirthdayCalendarContent({
  currentDate,
}: {
  currentDate: Date;
}) {
  const { user } = useAuth();

  // Default to Month view logic
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const { data: birthdaysData, isLoading } = useQuery<
    ApiResponse<BirthdayEvent[]>,
    Error
  >({
    queryKey: [ "get-birthdays", startDate, endDate ],
    queryFn: () =>
      GetBirthdays({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      }),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const birthdays = birthdaysData?.data || [];
  const allEvents: CalendarEvent[] = [ ...birthdays ];

  const openDetails = (event: CalendarEvent) => {
    console.log("Birthday clicked:", event);
  };

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-0">
        <MonthView
          currentDate={ currentDate }
          events={ allEvents }
          openDetails={ openDetails }
        />
        {isLoading && <div className="p-4 text-center">Carregando...</div>}
        {!isLoading && allEvents.length === 0 && (
          <div className="p-4 text-center">
            Nenhum aniversariante encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
