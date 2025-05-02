import { cn } from "@/lib/utils";
import { formatDayName, isToday } from "../../../../utils/bookingViewHelpers";

interface CalendarWeekHeaderProps {
  weekDays: Date[];
}

export function CalendarWeekHeader({ weekDays }: CalendarWeekHeaderProps) {
    return (
        <div className="grid border-b" style={ { gridTemplateColumns: "100px repeat(7, 1fr)" } }>
            <div className="p-2 border-r bg-muted/50 w-[100px]"></div>
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
