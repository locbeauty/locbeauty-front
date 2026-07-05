import { Button } from "@/components/ui/button";
import {
  formatMonthYear,
  goToToday,
  nextDay,
  nextMonth,
  nextWeek,
  prevDay,
  prevMonth,
  prevWeek,
} from "./bookingViewHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectCalendarViewType } from "./SelectCalendarViewType";
import { Dispatch, SetStateAction } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SelectFilials } from "@/components/shared/SelectFilials";
import { SelectGears } from "@/components/shared/SelectGears";
import { DateRangePicker } from "@/components/ui/DatePicker";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";

interface CalendarControlsProps {
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  currentDate: Date;
  viewType: "dia" | "semana" | "mes";
  setViewType: Dispatch<SetStateAction<"dia" | "semana" | "mes">>;
  hideViewSelect?: boolean;
  hideCanceled?: boolean;
  setHideCanceled?: Dispatch<SetStateAction<boolean>>;
  selectedFilialIds?: string[];
  setSelectedFilialIds?: (ids: string[]) => void;
  selectedGearIds?: string[];
  setSelectedGearIds?: (ids: string[]) => void;
  selectedDateRange?: DateRange;
  setSelectedDateRange?: (range: DateRange | undefined) => void;
}

export function CalendarControls({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  hideViewSelect = false,
  hideCanceled = false,
  setHideCanceled = () => {},
  selectedFilialIds = [],
  setSelectedFilialIds = () => {},
  selectedGearIds = [],
  setSelectedGearIds = () => {},
  selectedDateRange,
  setSelectedDateRange = () => {},
}: CalendarControlsProps) {
  const { user } = useAuth();
  // Não-Master/Admin só veem as máquinas das filiais a que têm acesso.
  const accessibleFilialIds = useAccessibleFilialIds();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={ () => {
            if (viewType === "dia") {
              prevDay(currentDate, setCurrentDate);
            } else if (viewType === "semana") {
              prevWeek(currentDate, setCurrentDate);
            } else if (viewType === "mes") {
              prevMonth(currentDate, setCurrentDate);
            }
          } }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={ () => goToToday(setCurrentDate) }>
          Hoje
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={ () => {
            if (viewType === "dia") {
              nextDay(currentDate, setCurrentDate);
            } else if (viewType === "semana") {
              nextWeek(currentDate, setCurrentDate);
            } else if (viewType === "mes") {
              nextMonth(currentDate, setCurrentDate);
            }
          } }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {formatMonthYear(currentDate)}
        </h2>
      </div>
      {!hideViewSelect && (
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={ selectedDateRange }
            onChange={ setSelectedDateRange }
            placeholder="Filtrar por período"
            clearable
            classNames={ { trigger: "w-[230px]" } }
          />
          {user?.role !== USER_ROLES.MOTORISTA &&
            user?.role !== USER_ROLES.MOTORISTA_CHEFE && (
            <div className="w-[200px]">
              <SelectFilials
                value={ selectedFilialIds }
                onChange={ setSelectedFilialIds }
              />
            </div>
          )}
          {user?.role !== USER_ROLES.MOTORISTA && (
            <div className="w-[200px]">
              <SelectGears
                value={ selectedGearIds }
                onChange={ setSelectedGearIds }
                filialIds={ accessibleFilialIds }
              />
            </div>
          )}
          <div className="flex items-center space-x-2 border p-2 rounded-md h-9 bg-background px-3">
            <Checkbox
              id="hide-canceled"
              checked={ hideCanceled }
              onCheckedChange={ (checked) => setHideCanceled(!!checked) }
            />
            <Label
              htmlFor="hide-canceled"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Ocultar cancelados
            </Label>
          </div>
          <SelectCalendarViewType
            viewType={ viewType }
            setViewType={ setViewType }
          />
        </div>
      )}
    </div>
  );
}
