"use client";

import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, getYear, setYear, addMonths, subMonths } from "date-fns";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XCircle,
} from "lucide-react";
import { TZDate } from "react-day-picker";
import type { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MonthYearPicker } from "./month-year-picker";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export type CalendarProps = Omit<React.ComponentProps<typeof Calendar>, "mode">;

export type DatePickerProps = {
  placeholder?: string;
  modal?: boolean;
  value: Date | null;
  onChange: (_date: Date | undefined) => void;
  min?: Date;
  max?: Date;
  timezone?: string;
  disabled?: boolean;
  clearable?: boolean;
  renderTrigger?: (_props: DateRenderTriggerProps) => React.ReactNode;
  classNames?: {
    trigger?: string;
  };
};

export type DateRenderTriggerProps = {
  value: Date | null;
  open: boolean;
  timezone?: string;
  disabled?: boolean;
  setOpen: (_open: boolean) => void;
};

export function DatePicker({
  placeholder = "Pick a date",
  value,
  onChange,
  renderTrigger,
  min,
  max,
  timezone,
  disabled,
  clearable,
  classNames,
  modal = false,
  ...props
}: DatePickerProps & CalendarProps) {
  const [open, setOpen] = useState(false);
  const [monthYearPicker, setMonthYearPicker] = useState<
    "month" | "year" | false
  >(false);
  const initDate = useMemo(
    () => (value ? new TZDate(value, timezone) : null),
    [value, timezone],
  );

  const [month, setMonth] = useState<Date>(initDate || new Date());
  const [date, setDate] = useState<Date | null>(initDate);

  const minDate = useMemo(
    () => (min ? new TZDate(min, timezone) : undefined),
    [min, timezone],
  );
  const maxDate = useMemo(
    () => (max ? new TZDate(max, timezone) : undefined),
    [max, timezone],
  );

  const onDayChanged = useCallback(
    (d: Date | undefined) => {
      if (d) {
        setDate(d);
        onChange(new Date(d));
        setOpen(false);
      }
    },
    [setDate, onChange, setOpen],
  );

  const onMonthYearChanged = useCallback(
    (d: Date, mode: "month" | "year") => {
      setMonth(d);
      if (mode === "year") {
        setMonthYearPicker("month");
      } else {
        setMonthYearPicker(false);
      }
    },
    [setMonth, setMonthYearPicker],
  );

  const onNextMonth = useCallback(() => {
    setMonth(addMonths(month, 1));
  }, [month]);

  const onPrevMonth = useCallback(() => {
    setMonth(subMonths(month, 1));
  }, [month]);

  useEffect(() => {
    if (open) {
      setDate(initDate);
      setMonth(initDate || new Date());
      setMonthYearPicker(false);
    }
  }, [open, initDate]);

  const displayValue = useMemo(() => {
    if (!open && !value) return value;
    return open ? date : initDate;
  }, [date, value, open, initDate]);

  const displayFormat = useMemo(() => {
    if (!displayValue) return placeholder;
    return format(displayValue, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [displayValue, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger({
            value: displayValue,
            open,
            timezone,
            disabled,
            setOpen,
          })
        ) : (
          <div
            className={cn(
              "flex md:w-fit w-full justify-center cursor-pointer items-center h-9 ps-3 pe-1 font-normal border border-input rounded-md text-sm shadow-sm",
              !displayValue && "text-placeholder",
              (!clearable || !value) && "pe-3",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              classNames?.trigger,
            )}
            tabIndex={0}
          >
            <div
              className={cn(
                "flex items-center cursor-pointer",
                !value && "text-placeholder",
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {displayFormat}
            </div>
            {clearable && value && (
              <Button
                disabled={disabled}
                variant="ghost"
                size="sm"
                role="button"
                aria-label="Clear date"
                className="size-6 p-1 ms-1"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                <XCircle className="size-4" />
              </Button>
            )}
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex items-center justify-between">
          <div className="text-md font-bold ms-2 flex items-center cursor-pointer">
            <div>
              <span
                onClick={() =>
                  setMonthYearPicker(
                    monthYearPicker === "month" ? false : "month",
                  )
                }
              >
                {format(month, "MMMM")}
              </span>
              <span
                className="ms-1"
                onClick={() =>
                  setMonthYearPicker(
                    monthYearPicker === "year" ? false : "year",
                  )
                }
              >
                {format(month, "yyyy")}
              </span>
            </div>
            <Button
              variant="ghost"
              className="p-0 ml-2"
              onClick={() =>
                setMonthYearPicker(monthYearPicker ? false : "year")
              }
            >
              {monthYearPicker ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
            </Button>
          </div>
          <div
            className={cn("flex space-x-2", monthYearPicker ? "hidden" : "")}
          >
            <Button variant="ghost" size="icon" onClick={onPrevMonth}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNextMonth}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div className="relative bg-popover">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={onDayChanged}
            month={month}
            onMonthChange={setMonth}
            disabled={
              [
                maxDate ? { after: maxDate } : null,
                minDate ? { before: minDate } : null,
              ].filter(Boolean) as any
            }
            classNames={{
              caption: "hidden",
              nav: "hidden",
            }}
            {...props}
          />
          <div
            className={cn(
              "absolute top-0 left-0 bottom-0 right-0",
              monthYearPicker ? "bg-popover" : "hidden",
            )}
          ></div>
          <MonthYearPicker
            value={month}
            mode={monthYearPicker as "month" | "year" | false}
            onChange={onMonthYearChanged}
            minDate={minDate}
            maxDate={maxDate}
            className={cn(
              "absolute top-0 left-0 bottom-0 right-0",
              monthYearPicker ? "" : "hidden",
            )}
          />
        </div>
        {timezone && (
          <div className="flex justify-end mt-2">
            <div className="text-sm">
              <span>Timezone:</span>
              <span className="font-semibold ms-1">{timezone}</span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
