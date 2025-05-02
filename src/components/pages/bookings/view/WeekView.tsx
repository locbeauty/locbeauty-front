import { getDayIndex, getWeekDays, groupOverlappingEvents, isAgendamentoInWeek, workingHours } from "./bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";
import { CalendarWeekHeader } from "./CalendarWeekHeader";
import { MultipleEventBox } from "./MultipleEventBox";
import { SingleEventBox } from "./SingleEventBox";

interface WeekViewProps {
    currentDate: Date
    agendamentos: Agendamento[]
    openAgendamentoDetails: (_agendamento: Agendamento) => void
}

export function WeekView({ currentDate, agendamentos, openAgendamentoDetails }: WeekViewProps) {
    // Gerar os dias da semana a partir da data atual
    const weekDays = getWeekDays(currentDate);

    // Horas do dia para exibição
    // const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5h às 23h

    return (
        <div className="hidden md:block min-w-full">
            { /* Cabeçalho com os dias da semana */ }
            <CalendarWeekHeader weekDays={ weekDays } />

            { /* Grade de horários */ }
            <div className="relative">
                { /* Linhas de horas */ }
                { workingHours.map((hour) => (
                    <div key={ hour } className="grid grid-cols-8 border-b h-[64px]">
                        <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{ `${hour}:00` }</div>
                        { weekDays.map((_, dayIndex) => (
                            <div key={ dayIndex } className="h-16 border-r relative"></div>
                        )) }
                    </div>
                )) }

                { /* Agendamentos */ }
                { (() => {
                    // Agrupar agendamentos por dia
                    const agendamentosByDay: Record<number, Agendamento[]> = {};

                    agendamentos.forEach((agendamento) => {
                        if (!isAgendamentoInWeek(agendamento, weekDays)) return;

                        const dayIndex = getDayIndex(agendamento.startDate, weekDays);
                        if (dayIndex === -1) return;

                        if (!agendamentosByDay[dayIndex]) {
                            agendamentosByDay[dayIndex] = [];
                        }

                        agendamentosByDay[dayIndex].push(agendamento);
                    });

                    // Renderizar agendamentos para cada dia
                    return Object.entries(agendamentosByDay).flatMap(([dayIndexStr, dayAgendamentos]) => {
                        const dayIndex = Number.parseInt(dayIndexStr);

                        // Agrupar agendamentos sobrepostos para este dia
                        const agendamentoGroups = groupOverlappingEvents(dayAgendamentos);

                        return agendamentoGroups.flatMap((group) => {
                            // When there is only one booking starting at the time, show him with full event box width
                            if (group.length === 1) {
                                return <SingleEventBox key={ group[0].id } dayIndex={ dayIndex } group={ group } openAgendamentoDetails={ openAgendamentoDetails } />;
                            } else {
                                // When there is more than one booking starting in the same time, show them side by side
                                return <MultipleEventBox key={ group[0].id } dayIndex={ dayIndex } group={ group } openAgendamentoDetails={ openAgendamentoDetails } />;
                            }
                        });
                    });
                })() }
            </div>
        </div>
    );
}