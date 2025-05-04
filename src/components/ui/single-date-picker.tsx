"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useController, type Control, type FieldValues, type Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

const years = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
  2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006,
  2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996,
  1995, 1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987, 1986,
  1985, 1984, 1983, 1982, 1981, 1980, 1979, 1978, 1977, 1976,
  1975, 1974, 1973, 1972, 1971, 1970, 1969, 1968, 1967, 1966,
  1965, 1964, 1963, 1962, 1961, 1960,
]

export function SingleDateYearTrigger({
  value,
  onChange,
}: {
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione o ano">{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface SingleDatePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  children?: React.ReactElement<{ value?: string; onChange?: (v: string) => void }>
}

export function SingleDatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder = "Selecione uma data",
  className,
  disabled = false,
  children,
}: SingleDatePickerProps<TFieldValues>) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  })

  const [calendarMonth, setCalendarMonth] = React.useState<Date>(value || new Date())
  const [open, setOpen] = React.useState(false)

  const formattedDate = React.useMemo(() => {
    return value ? format(value, "PPP", { locale: ptBR }) : null
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
      {children && (
  <div className="p-3 border-b">
    {React.cloneElement(children, {
      value: calendarMonth.getFullYear().toString(),
      onChange: (year: string) =>
        setCalendarMonth((prev) => {
          const newDate = new Date(prev)
          newDate.setFullYear(Number(year))
          return newDate
        }),
    })}
  </div>
)}
        <Calendar
          className="h-[320px]"
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

