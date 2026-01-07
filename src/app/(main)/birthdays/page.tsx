"use client";

import { useEffect, useState } from "react";
import { CalendarControls } from "@/components/pages/calendar/CalendarControls";
import { BirthdayCalendarContent } from "@/components/pages/birthdays/BirthdayCalendarContent";
import { CalendarFooter } from "@/components/pages/calendar/CalendarFooter";

export default function BirthdaysPage() {
    const [ currentDate, setCurrentDate ] = useState(new Date());
    const viewType = "mes";
    const setViewType = () => {}; // No-op

    // ... (keep useEffect for mobile)

    return (
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

            <CalendarControls
                currentDate={ currentDate }
                setCurrentDate={ setCurrentDate }
                viewType="mes"
                setViewType={ setViewType as any }
                hideViewSelect={ true }
            />
            <BirthdayCalendarContent currentDate={ currentDate } />
            <CalendarFooter />
        </div>
    );
}
