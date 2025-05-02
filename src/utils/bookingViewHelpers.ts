import { Agendamento } from "@/app/(main)/bookings/page";
import { Dispatch, SetStateAction } from "react";

// Função para verificar se duas datas são do mesmo dia
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
    );
}

export function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajustar início para a segunda-feira anterior ou igual ao primeiro dia do mês
    const start = new Date(firstDayOfMonth);
    const startDay = start.getDay() === 0 ? 7 : start.getDay(); // Domingo vira 7
    start.setDate(start.getDate() - (startDay - 1));

    // Ajustar fim para o domingo seguinte ou igual ao último dia do mês
    const end = new Date(lastDayOfMonth);
    const endDay = end.getDay() === 0 ? 7 : end.getDay(); // Domingo vira 7
    end.setDate(end.getDate() + (7 - endDay));

    // Gerar os dias
    const days: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

export function isAgendamentoInWeek(agendamento: Agendamento, weekDays: Date[]): boolean {
    const agendamentoDate = agendamento.startDate;
    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    return agendamentoDate >= weekStart && agendamentoDate <= weekEnd;
}

export function getDayIndex(date: Date, weekDays: Date[]): number {
    for (let i = 0; i < weekDays.length; i++) {
        if (
            date.getDate() === weekDays[i].getDate() &&
      date.getMonth() === weekDays[i].getMonth() &&
      date.getFullYear() === weekDays[i].getFullYear()
        ) {
            return i;
        }
    }
    return -1;
}

export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    );
}

export function getWeekDays(date: Date): Date[] {
    const day = date.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para começar na segunda-feira

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

// Função auxiliar para criar datas corretamente
export function createDate(dayOffset: number, hours: number, minutes: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Função para avançar para a próxima semana
export const nextWeek = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextDate);
};

export const nextDay = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDate);
};

// Função para voltar para a semana anterior
export const prevWeek = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevDate);
};
export const prevDay = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDate);
};
export const prevMonth = ( currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>> ) => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
};

export const nextMonth = ( currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>> ) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
};

// Função para ir para a data atual
export const goToToday = (setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    setCurrentDate(new Date());
};

// Função para verificar se dois eventos se sobrepõem no tempo
export function doEventsOverlap(event1: Agendamento, event2: Agendamento): boolean {
    // Dois eventos se sobrepõem se:
    // 1. O evento1 começa antes do término do evento2, E
    // 2. O evento1 termina depois do início do evento2
    return event1.startDate < event2.endDate && event1.endDate > event2.startDate;
}

// Função para agrupar eventos que se sobrepõem no tempo
export function groupOverlappingEvents(events: Agendamento[]): Agendamento[][] {
    if (events.length === 0) return [];

    // Ordenar eventos por horário de início
    const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Array para armazenar os grupos de eventos sobrepostos
    const groups: Agendamento[][] = [];

    // Para cada evento, verificar se ele se sobrepõe com algum grupo existente
    sortedEvents.forEach((event) => {
        // Verificar se o evento se sobrepõe com algum evento em algum grupo existente
        let foundGroup = false;

        for (const group of groups) {
        // Verificar se o evento se sobrepõe com algum evento no grupo atual
            const overlapsWithGroup = group.some((groupEvent) => doEventsOverlap(event, groupEvent));

            if (overlapsWithGroup) {
                // Se sobrepõe, adicionar ao grupo
                group.push(event);
                foundGroup = true;
                break;
            }
        }

        // Se não encontrou nenhum grupo com sobreposição, criar um novo grupo
        if (!foundGroup) {
            groups.push([event]);
        }
    });

    return groups;
}

// calcular as horas do dia para exibição no calendário(expediente),
// assim como a posição dos EventBoxes automaticamente, mudando apenas o firstHourOfTheDay e o lastHourOfTheDay
const hourHeighInPixels = 64;
const firstHourOfTheDay = 5;
const lastHourOfTheDay = 22;
const workingHoursLength = lastHourOfTheDay - firstHourOfTheDay + 1;

export const workingHours = Array.from({ length: workingHoursLength }, (_, i) => i + firstHourOfTheDay);

export function getDistanceFromTop(hour: number, minute: number): number {
    // Altura de cada hora em pixels
    const hourHeight = 64;

    // Calcular a posição relativa ao início do horário de trabalho (7h)
    const hoursFromStart = hour - workingHours[0];

    // Calcular a posição considerando horas e minutos
    // Cada minuto representa 1/60 da altura de uma hora
    return hoursFromStart * hourHeight + (minute / 60) * hourHeight;
}

export function getEventBoxHeigh(durationInHours: number) {
    return durationInHours * hourHeighInPixels;
}
