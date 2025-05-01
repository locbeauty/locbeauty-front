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

// Função para obter os dias do mês (incluindo dias do mês anterior e próximo para preencher a grade)
export function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    // const lastDay = new Date(year, month + 1, 0);

    // Ajustar para começar na segunda-feira (0 = Domingo, 1 = Segunda, ...)
    const firstDayOfGrid = new Date(firstDay);
    const dayOfWeek = firstDay.getDay() || 7; // Converter domingo (0) para 7
    firstDayOfGrid.setDate(firstDay.getDate() - (dayOfWeek - 1));

    // Criar array com todos os dias
    const days: Date[] = [];

    // Precisamos de 6 semanas (42 dias) para garantir que cobrimos todo o mês
    for (let i = 0; i < 42; i++) {
        const currentDay = new Date(firstDayOfGrid);
        currentDay.setDate(firstDayOfGrid.getDate() + i);
        days.push(currentDay);
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

// Função para voltar para a semana anterior
export const prevWeek = (currentDate: Date, setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevDate);
};

// Função para ir para a data atual
export const goToToday = (setCurrentDate: Dispatch<SetStateAction<Date>>) => {
    setCurrentDate(new Date());
};