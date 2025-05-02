import { cn } from "@/lib/utils";
import { formatDayName, isToday } from "../../../../utils/bookingViewHelpers";

interface CalendarWeekHeaderProps {
  weekDays: Date[];
}

export function CalendarWeekHeader({ weekDays }: CalendarWeekHeaderProps) {
    return (
        <div className="grid grid-cols-8 border-b">
            <div className="p-2 border-r bg-muted/50"></div>
            { weekDays.map((day, index) => (
                <div
                    key={ index }
                    className={ cn(
                        "p-2 text-center border-r font-medium",
                        isToday(day) ? "bg-primary/10" : "bg-muted/50"
                    ) }
                >
                    <div>{ formatDayName(day) }</div>
                    <div
                        className={ cn(
                            "text-lg",
                            isToday(day) ? "text-primary font-bold" : ""
                        ) }
                    >
                        { day.getDate() }
                    </div>
                </div>
            )) }
        </div>
    );
}
