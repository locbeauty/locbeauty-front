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
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";

interface CalendarControlsProps {
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  currentDate: Date;
  viewType: "dia" | "semana" | "mes";
  setViewType: Dispatch<SetStateAction<"dia" | "semana" | "mes">>;
  hideViewSelect?: boolean;
  hideCanceled?: boolean;
  setHideCanceled?: Dispatch<SetStateAction<boolean>>;
  selectedFilialId?: string;
  setSelectedFilialId?: (id: string) => void;
}

export function CalendarControls({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  hideViewSelect = false,
  hideCanceled = false,
  setHideCanceled = () => {},
  selectedFilialId = "",
  setSelectedFilialId = () => {},
}: CalendarControlsProps) {
  const { user } = useAuth();

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
          {user?.role !== USER_ROLES.MOTORISTA && (
            <div className="w-[160px]">
              <SelectFilial
                value={ selectedFilialId }
                onValueChange={ setSelectedFilialId }
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
