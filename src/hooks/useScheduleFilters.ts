"use client";

import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { DateRange } from "react-day-picker";

type CalendarViewType = "dia" | "semana" | "mes";

// Datas guardadas como ISO string (JSON não serializa Date).
interface StoredScheduleFilters {
  selectedFilialIds: string[];
  selectedGearIds: string[];
  hideCanceled: boolean;
  viewType: CalendarViewType;
  dateRange: { from?: string; to?: string } | null;
}

const DEFAULT_FILTERS: StoredScheduleFilters = {
  selectedFilialIds: [],
  selectedGearIds: [],
  hideCanceled: true,
  viewType: "mes",
  dateRange: null,
};

// Versionada: mudou o shape, troca o sufixo para invalidar o storage antigo.
const STORAGE_KEY = "schedule-filters-v1";

function parseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Filtros da agenda persistidos em localStorage — sobrevivem à navegação e ao
 * reload. initializeWithValue: false mantém a hidratação do Next consistente
 * (defaults no primeiro render, valor salvo aplicado pós-mount).
 */
export function useScheduleFilters() {
  const [ stored, setStored ] = useLocalStorage<StoredScheduleFilters>(
    STORAGE_KEY,
    DEFAULT_FILTERS,
    { initializeWithValue: false },
  );

  // Storage de versão antiga/corrompido → completa com defaults.
  const filters = useMemo(
    () => ({ ...DEFAULT_FILTERS, ...stored }),
    [ stored ],
  );

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDate(filters.dateRange?.from);
    if (!from) return undefined;
    return { from, to: parseDate(filters.dateRange?.to) };
  }, [ filters.dateRange ]);

  const setSelectedFilialIds = useCallback(
    (ids: string[]) => {
      setStored((prev) => ({
        ...DEFAULT_FILTERS,
        ...prev,
        selectedFilialIds: ids,
      }));
    },
    [ setStored ],
  );

  const setSelectedGearIds = useCallback(
    (ids: string[]) => {
      setStored((prev) => ({
        ...DEFAULT_FILTERS,
        ...prev,
        selectedGearIds: ids,
      }));
    },
    [ setStored ],
  );

  const setSelectedDateRange = useCallback(
    (range: DateRange | undefined) => {
      setStored((prev) => ({
        ...DEFAULT_FILTERS,
        ...prev,
        dateRange: range?.from
          ? { from: range.from.toISOString(), to: range.to?.toISOString() }
          : null,
      }));
    },
    [ setStored ],
  );

  // Compatíveis com Dispatch<SetStateAction<T>> (props do CalendarControls).
  const setHideCanceled = useCallback<Dispatch<SetStateAction<boolean>>>(
    (action) => {
      setStored((prev) => {
        const base = { ...DEFAULT_FILTERS, ...prev };
        return {
          ...base,
          hideCanceled:
            typeof action === "function" ? action(base.hideCanceled) : action,
        };
      });
    },
    [ setStored ],
  );

  const setViewType = useCallback<Dispatch<SetStateAction<CalendarViewType>>>(
    (action) => {
      setStored((prev) => {
        const base = { ...DEFAULT_FILTERS, ...prev };
        return {
          ...base,
          viewType:
            typeof action === "function" ? action(base.viewType) : action,
        };
      });
    },
    [ setStored ],
  );

  return {
    selectedFilialIds: filters.selectedFilialIds,
    setSelectedFilialIds,
    selectedGearIds: filters.selectedGearIds,
    setSelectedGearIds,
    selectedDateRange,
    setSelectedDateRange,
    hideCanceled: filters.hideCanceled,
    setHideCanceled,
    viewType: filters.viewType,
    setViewType,
  };
}
