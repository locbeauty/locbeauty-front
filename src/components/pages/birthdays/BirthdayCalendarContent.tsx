"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MonthView } from "../calendar/MonthView";
import { useAuth } from "@/contexts/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ApiResponse } from "@/lib/api";
import { CalendarEvent } from "../calendar/bookingViewHelpers";
import { GetBirthdays } from "@/services/birthdays.service";
import { BirthdayEvent } from "@/utils/@types/birthday";
import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { USER_ROLES } from "@/utils/constants";
import { Loader2 } from "lucide-react";

export function BirthdayCalendarContent({
  currentDate,
}: {
  currentDate: Date;
}) {
  const { user } = useAuth();
  const { accesses } = useAccess();

  const customerFilialIds = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.CUSTOMERS && a.canView)
      .map((a) => a.filialId);
    const unique = Array.from(new Set(permissions));
    return unique.length > 0 ? unique : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

  const employeeFilialIds = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.EMPLOYEES && a.canView)
      .map((a) => a.filialId);
    const unique = Array.from(new Set(permissions));
    return unique.length > 0 ? unique : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

  // Default to Month view logic
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const { data: birthdaysData, isLoading } = useQuery<
    ApiResponse<BirthdayEvent[]>,
    Error
  >({
    queryKey: [
      "get-birthdays",
      startDate,
      endDate,
      customerFilialIds,
      employeeFilialIds,
    ],
    queryFn: () =>
      GetBirthdays({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        customerFilialIds,
        employeeFilialIds,
      }),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const birthdays = birthdaysData?.data || [];
  const allEvents: CalendarEvent[] = [ ...birthdays ];

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-0 relative">
        <MonthView
          currentDate={ currentDate }
          events={ allEvents }
          openDetails={ () => {} }
        />
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Carregando aniversariantes...
              </p>
            </div>
          </div>
        )}
        {!isLoading && allEvents.length === 0 && (
          <div className="p-4 text-center">
            Nenhum aniversariante encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
