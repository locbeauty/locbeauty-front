"use client";

import { useState } from "react";
import { CalendarControls } from "@/components/pages/calendar/CalendarControls";
import {
  BirthdayCalendarContent,
  BirthdayUserType,
} from "@/components/pages/birthdays/BirthdayCalendarContent";
import { CalendarFooter } from "@/components/pages/calendar/CalendarFooter";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BirthdaysPage() {
  const [ currentDate, setCurrentDate ] = useState(new Date());
  const [ userType, setUserType ] = useState<BirthdayUserType>("all");
  const viewType = "mes";
  const setViewType = () => {}; // No-op

  return (
    <RouteGuard module={ SYSTEM_MODULES.BIRTHDAYS }>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Aniversariantes
              </h1>
              <p className="text-muted-foreground">
                Visualize aniversários de clientes e colaboradores
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CalendarControls
            currentDate={ currentDate }
            setCurrentDate={ setCurrentDate }
            viewType="mes"
            setViewType={ (view) => setViewType() }
            hideViewSelect={ true }
          />
          <Select
            value={ userType }
            onValueChange={ (value) => setUserType(value as BirthdayUserType) }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="customers">Clientes</SelectItem>
              <SelectItem value="employees">Colaboradores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <BirthdayCalendarContent
          currentDate={ currentDate }
          userType={ userType }
        />
        <CalendarFooter />
      </div>
    </RouteGuard>
  );
}
