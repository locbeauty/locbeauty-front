import { Booking } from "@/utils/@types/bookings";
import { Dispatch, SetStateAction } from "react";

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

export function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const start = new Date(firstDayOfMonth);
    const startDay = start.getDay() === 0 ? 7 : start.getDay();
    start.setDate(start.getDate() - (startDay - 1));

    const end = new Date(lastDayOfMonth);
    const endDay = end.getDay() === 0 ? 7 : end.getDay();
    end.setDate(end.getDate() + (7 - endDay));

    const days: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

export function getWeekDays(date: Date): Date[] {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
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

export function getDayIndex(date: Date, weekDays: Date[]): number {
    for (let i = 0; i < weekDays.length; i++) {
        if (isSameDay(date, weekDays[i])) {
            return i;
        }
    }
    return -1;
}

export function isAgendamentoInWeek(agendamento: Booking, weekDays: Date[]): boolean {
    const agendamentoDate = agendamento.startDate;
    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    return agendamentoDate >= weekStart && agendamentoDate <= weekEnd;
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

export function doEventsOverlap(event1: Booking, event2: Booking): boolean {
    return event1.startDate < event2.endDate && event1.endDate > event2.startDate;
}

export function groupOverlappingEvents(events: Booking[]): Booking[][] {
    if (events.length === 0) return [];

    const sortedEvents = [ ...events ].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const groups: Booking[][] = [];

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
