"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getMonthName } from "@/utils/getMonthName";

// Anos oferecidos: do ano corrente até 4 anos atrás.
const AVAILABLE_YEARS_COUNT = 5;

interface ReferenceMonthYearSelectProps {
  /** Mês de referência, 1-12. */
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  /** Classes extras dos dois seletores (ex.: altura). */
  triggerClassName?: string;
}

/**
 * Seletores de mês e ano de referência dos segmentos de clientes, usados no
 * card do dashboard e na aba Clientes.
 */
export function ReferenceMonthYearSelect({
  month,
  year,
  onMonthChange,
  onYearChange,
  triggerClassName,
}: ReferenceMonthYearSelectProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: AVAILABLE_YEARS_COUNT },
    (_, index) => currentYear - index,
  );
  // Um ano fora da faixa (vindo da URL) continua aparecendo como selecionado.
  if (!availableYears.includes(year)) {
    availableYears.push(year);
    availableYears.sort((a, b) => b - a);
  }

  return (
    <>
      <Select
        value={ String(month) }
        onValueChange={ (value) => onMonthChange(Number(value)) }
      >
        <SelectTrigger className={ cn("w-[130px]", triggerClassName) }>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, index) => (
            <SelectItem key={ index } value={ String(index + 1) }>
              {getMonthName(index)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={ String(year) }
        onValueChange={ (value) => onYearChange(Number(value)) }
      >
        <SelectTrigger className={ cn("w-[100px]", triggerClassName) }>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((availableYear) => (
            <SelectItem key={ availableYear } value={ String(availableYear) }>
              {availableYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
