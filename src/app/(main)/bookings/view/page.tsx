"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    Plus, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { formatMonthYear, goToToday, nextWeek, prevWeek } from "@/components/pages/bookings/view/bookingViewHelpers";
import { Agendamento } from "../page";
import { BookingDetailsDialog } from "@/components/pages/bookings/view/BookingDetailsDialog";
import { CalendarContent } from "@/components/pages/bookings/view/CalendarContent";
import { SelectCalendarViewType } from "@/components/pages/bookings/view/SelectCalendarViewType";
import { CalendarFooter } from "@/components/pages/bookings/view/CalendarFooter";

export default function AgendamentosPage() {
    // Estado para controlar a semana atual
    const [currentDate, setCurrentDate] = useState(new Date());
    // Estado para controlar o agendamento selecionado
    const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
    // Estado para controlar a abertura do diálogo
    const [isBookingDetailsDialogOpen, setBookingDetailsDialogOpen] = useState(false);
    // Adicione um novo estado para controlar o tipo de visualização
    const [viewType, setViewType] = useState<"dia" | "semana" | "mes">("semana");

    const router = useRouter();

    // Função para abrir o diálogo com os detalhes do agendamento
    const openAgendamentoDetails = (agendamento: Agendamento) => {
        setSelectedAgendamento(agendamento);
        setBookingDetailsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button onClick={ () => router.back() } variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
                        <p className="text-muted-foreground">Visualize os agendamentos de locações</p>
                    </div>
                </div>

                <div className="flex">
                    <Button className="flex justify-center items-center" asChild>
                        <Link className="flex justify-center items-center" href={ ROUTES.CREATE_BOOKING }>
                            <Plus className="" />
                            <span className="hidden md:inline">Novo Agendamento</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={ () => prevWeek(currentDate, setCurrentDate) }>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={ () => goToToday(setCurrentDate) }>
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={ () => nextWeek(currentDate, setCurrentDate) }>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">{ formatMonthYear(currentDate) }</h2>
                </div>

                <div className="flex items-center gap-2">
                    <SelectCalendarViewType viewType={ viewType } setViewType={ setViewType } />
                </div>
            </div>

            <Card className="overflow-hidden">
                <CalendarContent currentDate={ currentDate } openAgendamentoDetails={ openAgendamentoDetails } viewType={ viewType } />
            </Card>
            <CalendarFooter />

            { /* Diálogo de detalhes do agendamento */ }
            <BookingDetailsDialog isBookingDetailsDialogOpen={ isBookingDetailsDialogOpen } setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen } selectedAgendamento={ selectedAgendamento } />
        </div>
    );
}
