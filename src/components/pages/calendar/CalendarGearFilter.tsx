"use client";

import { SelectGears } from "@/components/shared/SelectGears";
import { useCalendarEvents, useCalendarGearOptions } from "./useCalendarEvents";

interface CalendarGearFilterProps {
  viewType: "dia" | "semana" | "mes";
  currentDate: Date;
  selectedFilialIds: string[];
  value: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Filtro de equipamentos da agenda. As opções incluem os equipamentos que
 * aparecem nos eventos do período (mesma consulta da agenda, via cache), para
 * que todo equipamento visível na agenda possa ser escolhido.
 */
export function CalendarGearFilter({
  viewType,
  currentDate,
  selectedFilialIds,
  value,
  onChange,
}: CalendarGearFilterProps) {
  const { checkouts, trainings } = useCalendarEvents({
    viewType,
    currentDate,
    selectedFilialIds,
  });
  const options = useCalendarGearOptions(checkouts, trainings);

  return <SelectGears value={ value } onChange={ onChange } options={ options } />;
}
