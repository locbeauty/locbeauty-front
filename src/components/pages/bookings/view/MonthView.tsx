import { cn } from "@/lib/utils";
import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
import { Agendamento } from "@/app/(main)/bookings/page";

// Componente de visualização mensal
export function MonthView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (_agendamento: Agendamento) => void
}) {
    // Obter dias do mês atual
    const monthDays = getMonthDays(currentDate);

    return (
        <div className="min-w-full">
            { /* Cabeçalho com os dias da semana */ }
            <div className="grid grid-cols-7 border-b">
                { ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                    <div key={ index } className="p-2 text-center border-r font-medium bg-muted/50">
                        { day }
                    </div>
                )) }
            </div>

            { /* Grade do mês */ }
            <div className="grid grid-cols-7">
                { monthDays.map((day, index) => {
                    // Filtrar agendamentos para este dia
                    const dayAgendamentos = agendamentos.filter((agendamento) => isSameDay(agendamento.startDate, day));

                    // Verificar se é do mês atual ou não
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={ index }
                            className={ cn(
                                "min-h-[120px] border-r border-b p-1 relative",
                                isToday(day) ? "bg-primary/5" : "",
                                !isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "",
                            ) }
                        >
                            <div className={ cn("text-right p-1 font-medium text-sm", isToday(day) ? "text-primary" : "") }>
                                { day.getDate() }
                            </div>

                            <div className="space-y-1 mt-1">
                                { dayAgendamentos.slice(0, 3).map((agendamento) => {
                                    // Determinar a cor com base na duração
                                    let bgColor = "";
                                    if (agendamento.totalDuration === 4) {
                                        bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                                    } else if (agendamento.totalDuration === 6) {
                                        bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                                    } else if (agendamento.totalDuration >= 8 && agendamento.totalDuration <= 12) {
                                        bgColor = "bg-green-100 border-green-300 text-green-800";
                                    } else {
                                        bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                                    }

                                    return (
                                        <div
                                            key={ agendamento.id }
                                            className={ cn("text-xs p-1 rounded border-l-2 cursor-pointer truncate", bgColor) }
                                            onClick={ () => openAgendamentoDetails(agendamento) }
                                        >
                                            { formatTime(agendamento.startDate) } - { agendamento.gear }
                                        </div>
                                    );
                                }) }

                                { dayAgendamentos.length > 3 && (
                                    <div className="text-xs text-center text-muted-foreground">+{ dayAgendamentos.length - 3 } mais</div>
                                ) }
                            </div>
                        </div>
                    );
                }) }
            </div>
        </div>
    );
}