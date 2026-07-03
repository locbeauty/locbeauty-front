"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XCircle,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

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

export type DateRangePickerProps = {
  placeholder?: string;
  modal?: boolean;
  value: DateRange | undefined;
  onChange: (_range: DateRange | undefined) => void;
  disabled?: boolean;
  clearable?: boolean;
  classNames?: {
    trigger?: string;
  };
};

export function DateRangePicker({
  placeholder = "Selecione o período",
  value,
  onChange,
  disabled,
  clearable,
  classNames,
  modal = false,
}: DateRangePickerProps) {
  const [ open, setOpen ] = useState(false);
  const [ monthYearPicker, setMonthYearPicker ] = useState<
    "month" | "year" | false
  >(false);
  const [ month, setMonth ] = useState<Date>(value?.from || new Date());

  useEffect(() => {
    if (open) {
      setMonth(value?.from || new Date());
      setMonthYearPicker(false);
    }
  }, [ open, value ]);

  // O DayPicker v9 devolve { from: dia, to: dia } já no primeiro clique, então
  // a seleção é controlada aqui pelo dia clicado, ignorando o range calculado.
  const onSelect = useCallback(
    (_range: DateRange | undefined, day: Date) => {
      // 1º clique (ou recomeço após período completo): inicia novo período.
      if (!value?.from || value.to) {
        onChange({ from: day, to: undefined });
        return;
      }
      // 2º clique: completa o período (ordenando) e fecha.
      const next =
        day < value.from
          ? { from: day, to: value.from }
          : { from: value.from, to: day };
      onChange(next);
      setOpen(false);
    },
    [ value, onChange ],
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
    [ setMonth, setMonthYearPicker ],
  );

  const displayFormat = useMemo(() => {
    if (!value?.from) return placeholder;
    const from = format(value.from, "dd/MM/yyyy", { locale: ptBR });
    const to = value.to
      ? format(value.to, "dd/MM/yyyy", { locale: ptBR })
      : "...";
    return `${from} – ${to}`;
  }, [ value, placeholder ]);

  return (
    <Popover open={ open } onOpenChange={ setOpen } modal={ modal }>
      <PopoverTrigger asChild>
        <div
          className={ cn(
            "flex md:w-fit w-full justify-center cursor-pointer items-center h-9 ps-3 pe-1 font-normal border border-input rounded-md text-sm shadow-sm",
            !value?.from && "text-placeholder",
            (!clearable || !value?.from) && "pe-3",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            classNames?.trigger,
          ) }
          tabIndex={ 0 }
        >
          <div
            className={ cn(
              "flex items-center cursor-pointer",
              !value?.from && "text-placeholder",
            ) }
          >
            <CalendarIcon className="mr-2 size-4" />
            {displayFormat}
          </div>
          {clearable && value?.from && (
            <Button
              disabled={ disabled }
              variant="ghost"
              size="sm"
              role="button"
              aria-label="Clear date range"
              className="size-6 p-1 ms-1"
              onClick={ (e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange(undefined);
                setOpen(false);
              } }
            >
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <div className="flex items-center justify-between">
          <div className="text-md font-bold ms-2 flex items-center cursor-pointer">
            <div>
              <span
                onClick={ () =>
                  setMonthYearPicker(
                    monthYearPicker === "month" ? false : "month",
                  )
                }
              >
                {format(month, "MMMM")}
              </span>
              <span
                className="ms-1"
                onClick={ () =>
                  setMonthYearPicker(monthYearPicker === "year" ? false : "year")
                }
              >
                {format(month, "yyyy")}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="p-0 ml-2"
              onClick={ () =>
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
            className={ cn("flex space-x-2", monthYearPicker ? "hidden" : "") }
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={ (e) => {
                e.stopPropagation();
                setMonth(subMonths(month, 1));
              } }
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={ (e) => {
                e.stopPropagation();
                setMonth(addMonths(month, 1));
              } }
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div className="relative bg-popover">
          <Calendar
            mode="range"
            selected={ value }
            onSelect={ onSelect }
            month={ month }
            onMonthChange={ setMonth }
            classNames={ {
              caption: "hidden",
              nav: "hidden",
            } }
          />
          <div
            className={ cn(
              "absolute top-0 left-0 bottom-0 right-0",
              monthYearPicker ? "bg-popover" : "hidden",
            ) }
          ></div>
          <MonthYearPicker
            value={ month }
            mode={ monthYearPicker as "month" | "year" | false }
            onChange={ onMonthYearChanged }
            className={ cn(
              "absolute top-0 left-0 bottom-0 right-0",
              monthYearPicker ? "" : "hidden",
            ) }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
