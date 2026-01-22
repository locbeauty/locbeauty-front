import { cn } from "@/lib/utils";
import { formatDayName, isToday } from "./bookingViewHelpers";

interface CalendarDayHeaderProps {
  currentDate: Date;
}

export function CalendarDayHeader({ currentDate }: CalendarDayHeaderProps) {
  return (
    <div className="grid grid-cols-2 border-b">
      <div className="p-2 border-r bg-muted/50"></div>
      <div
        className={ cn(
          "p-2 text-center border-r font-medium",
          isToday(currentDate) ? "bg-primary/10" : "bg-muted/50"
        ) }
      >
        <div>{ formatDayName(currentDate) }</div>
        <div
          className={ cn(
            "text-lg",
            isToday(currentDate) ? "text-primary font-bold" : ""
          ) }
        >
          { currentDate.getDate() }
        </div>
      </div>
    </div>
  );
}
