import { Dispatch, SetStateAction } from "react";
import { FlattenedBooking } from "./WeekView";
import { Checkout } from "@/utils/@types/checkouts";

//
// ─── NAVEGAÇÃO DE DATAS ──────────────────────────────────────────────────────────
//

export const nextDay = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDate);
};

export const prevDay = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDate);
};

export const nextWeek = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextDate);
};

export const prevWeek = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevDate);
};

export const nextMonth = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
};

export const prevMonth = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
};

export const goToToday = (setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    setCurrentDate(new Date());
};

//
// ─── CÁLCULOS DE DATAS E SEMANAS ──────────────────────────────────────────────────
//

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

export function isToday(date: Date): boolean {
    const today = new Date();
    return isSameDay(date, today);
}

// export function getMonthDays(date: Date): Date[] {
//     const year = date.getFullYear();
//     const month = date.getMonth();

//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);

//     const start = new Date(firstDayOfMonth);
//     const startDay = start.getDay();
//     start.setDate(start.getDate() - startDay);

//     const end = new Date(lastDayOfMonth);
//     const endDay = end.getDay() === 0 ? 7 : end.getDay();
//     end.setDate(end.getDate() + (7 - endDay));

//     const days: Date[] = [];
//     const current = new Date(start);

//     while (current <= end) {
//         days.push(new Date(current));
//         current.setDate(current.getDate() + 1);
//     }

//     return days;
// }
export function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Calculate how many days from previous month to show
    // Adjust for Monday start (0 = Sunday becomes 6, 1 = Monday becomes 0, etc.)
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Calculate start date (first day to show in the calendar)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - daysFromPrevMonth);

    const days: Date[] = [];
    const current = new Date(startDate);

    // Always generate exactly 6 weeks (42 days) for consistent layout
    for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

export function getWeekDays(date: Date): Date[] {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const monday = new Date(date);
    monday.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + i);
        weekDays.push(nextDay);
    }
    return weekDays;
}

export function getDayIndex(bookingDate: Date, weekDays: Date[]): number {
    const bookingDay = bookingDate.toDateString();
    return weekDays.findIndex((day) => day.toDateString() === bookingDay);
}

export function isAgendamentoInWeek(booking: Checkout, weekDays: Date[]): boolean {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(weekDays[0]);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(weekDays[6]);
    endOfWeek.setHours(23, 59, 59, 999);

    return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
}

//
// ─── FORMATAÇÕES ──────────────────────────────────────────────────────────────────
//

export function formatDayName(date: Date): string {
    return (
        date.toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toUpperCase() +
        date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(1, 3)
    );
}

export function formatMonthYear(date: Date): string {
    return (
        date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).charAt(0).toUpperCase() +
        date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).slice(1)
    );
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

//
// ─── EVENTOS ──────────────────────────────────────────────────────────────────────
//

// function doEventsOverlap(event1: Checkout, event2: Checkout): boolean {
//     // Two events overlap if one starts before the other ends
//     return event1.startDate < event2.endDate && event2.startDate < event1.endDate;
// }

export function doEventsOverlap(event1: Checkout, event2: Checkout): boolean {
    const start1 = new Date(event1.date);
    start1.setHours(Math.floor(event1.startHourInMinutes / 60));
    start1.setMinutes(event1.startHourInMinutes % 60);

    const end1 = new Date(start1);
    end1.setMinutes(end1.getMinutes() + event1.totalDurationInMinutes);

    const start2 = new Date(event2.date);
    start2.setHours(Math.floor(event2.startHourInMinutes / 60));
    start2.setMinutes(event2.startHourInMinutes % 60);

    const end2 = new Date(start2);
    end2.setMinutes(end2.getMinutes() + event2.totalDurationInMinutes);

    return start1 < end2 && start2 < end1;
}

export function groupOverlappingEvents(events: Checkout[]): Checkout[][] {
    if (events.length === 0) return [];

    // const sortedEvents = [ ...events ].sort((a, b) => a.date.getTime() - b.date.getTime());
    const sortedEvents = [ ...events ].sort((a, b) => {
        const aStart = new Date(a.date);
        aStart.setHours(Math.floor(a.startHourInMinutes / 60));
        aStart.setMinutes(a.startHourInMinutes % 60);

        const bStart = new Date(b.date);
        bStart.setHours(Math.floor(b.startHourInMinutes / 60));
        bStart.setMinutes(b.startHourInMinutes % 60);

        // return aStart.getTime() - bStart.getTime();
        return (
            aStart.getTime() - bStart.getTime() ||
            a.totalDurationInMinutes - b.totalDurationInMinutes
        );
    });
    const groups: Checkout[][] = [];

    sortedEvents.forEach((event) => {
        let foundGroup = false;

        for (const group of groups) {
            const overlapsWithGroup = group.some((groupEvent) => doEventsOverlap(event, groupEvent));

            if (overlapsWithGroup) {
                group.push(event);
                foundGroup = true;
                break;
            }
        }

        if (!foundGroup) {
            groups.push([ event ]);
        }
    });

    return groups;
}

//
// ─── EXIBIÇÃO DO CALENDÁRIO ───────────────────────────────────────────────────────
//

const hourHeighInPixels = 64;
const firstHourOfTheDay = 5;
const lastHourOfTheDay = 22;
const workingHoursLength = lastHourOfTheDay - firstHourOfTheDay + 1;

export const workingHours = Array.from({ length: workingHoursLength }, (_, i) => i + firstHourOfTheDay);

export function getDistanceFromTop(hour: number, minute: number): number {
    const hourHeight = hourHeighInPixels;
    const hoursFromStart = hour - workingHours[0];
    return hoursFromStart * hourHeight + (minute / 60) * hourHeight;
}

export function getEventBoxHeigh(durationInHours: number) {
    return durationInHours * hourHeighInPixels;
}

//
// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────────────
//

export function createDate(dayOffset: number, hours: number, minutes: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
}
