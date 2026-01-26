"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  format,
  getMonth,
  getYear,
  setMonth as setMonthFns,
  setYear,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ptBR } from "date-fns/locale";

interface TimeOption {
  value: number;
  label: string;
  disabled: boolean;
}

export function MonthYearPicker({
  value,
  minDate,
  maxDate,
  mode = "month",
  onChange,
  className,
}: {
  value: Date;
  mode: "month" | "year" | false;
  minDate?: Date;
  maxDate?: Date;
  onChange: (_value: Date, _mode: "month" | "year") => void;
  className?: string;
}) {
  const yearRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => {
    const years: TimeOption[] = [];
    for (let i = 1960; i < new Date().getFullYear() + 1; i++) {
      let disabled = false;
      const startY = startOfYear(setYear(value, i));
      const endY = endOfYear(setYear(value, i));
      if (minDate && endY < minDate) disabled = true;
      if (maxDate && startY > maxDate) disabled = true;
      years.push({ value: i, label: i.toString(), disabled });
    }
    return years;
  }, [value, minDate, maxDate]);

  const months = useMemo(() => {
    const months: TimeOption[] = [];
    for (let i = 0; i < 12; i++) {
      let disabled = false;
      const startM = startOfMonth(setMonthFns(value, i));
      const endM = endOfMonth(setMonthFns(value, i));
      if (minDate && endM < minDate) disabled = true;
      if (maxDate && startM > maxDate) disabled = true;
      const monthLabel = format(new Date(0, i), "MMMM", { locale: ptBR });
      months.push({
        value: i,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        disabled,
      });
    }
    return months;
  }, [value, minDate, maxDate]);

  const onYearChange = useCallback(
    (v: TimeOption) => {
      let newDate = setYear(value, v.value);
      if (minDate && newDate < minDate) {
        newDate = setMonthFns(newDate, getMonth(minDate));
      }
      if (maxDate && newDate > maxDate) {
        newDate = setMonthFns(newDate, getMonth(maxDate));
      }
      onChange(newDate, "year");
    },
    [onChange, value, minDate, maxDate]
  );

  useEffect(() => {
    if (mode === "year") {
      yearRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [mode, value]);

  return (
    <div className={cn("bg-popover", className)}>
      <ScrollArea className="h-full">
        {mode === "year" && (
          <div className="grid grid-cols-4">
            {years.map((year) => (
              <div
                key={year.value}
                ref={year.value === getYear(value) ? yearRef : undefined}
              >
                <Button
                  disabled={year.disabled}
                  variant={getYear(value) === year.value ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => onYearChange(year)}
                >
                  {year.label}
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === "month" && (
          <div className="grid grid-cols-3 gap-4">
            {months.map((month) => (
              <Button
                key={month.value}
                size="lg"
                disabled={month.disabled}
                variant={getMonth(value) === month.value ? "default" : "ghost"}
                className="rounded-full"
                onClick={() =>
                  onChange(setMonthFns(value, month.value), "month")
                }
              >
                {month.label}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
