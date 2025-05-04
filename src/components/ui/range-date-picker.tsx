"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";

export function RangeDatePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);

    return (
        <div className={ cn(className) }>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={ "outline" }
                        className={ cn(
                            "flex",
                            !date && "text-muted-foreground"
                        ) }
                    >
                        <CalendarIcon />
                        { date?.from ? (
                            date.to ? (
                                <>
                                    { format(date.from, "PPP", { locale: ptBR }) } - { " " }
                                    { format(date.to, "PPP", { locale: ptBR }) }
                                </>
                            ) : (
                                format(date.from, "PPP", { locale: ptBR })
                            )
                        ) : (
                            <span>Escolha a data do agendamento</span>
                        ) }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 flex gap-10" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={ date?.from }
                        selected={ date }
                        onSelect={ setDate }
                        numberOfMonths={ 1 }
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
