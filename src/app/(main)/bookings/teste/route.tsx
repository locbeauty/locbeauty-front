"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    DollarSign,
    User,
    Calendar,
    ClipboardList,
    Package,
    Building,
    Phone,
    Mail,
    Edit,
    Trash2,
    List,
    CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Tipos para os agendamentos
type Agendamento = {
  id: number
  maquina: string
  cliente: string
  clienteEmail?: string
  clienteTelefone?: string
  local: string
  endereco?: string
  dataInicio: Date
  dataFim: Date
  duracao: number // em horas
  valor: number
  status: "confirmado" | "pendente" | "concluido" | "cancelado"
  observacoes?: string
  responsavel?: string
}

// Função para verificar se dois agendamentos se sobrepõem
function doEventsOverlap(event1: Agendamento, event2: Agendamento): boolean {
    return event1.dataInicio < event2.dataFim && event2.dataInicio < event1.dataFim;
}

// Função para agrupar agendamentos sobrepostos
function groupOverlappingEvents(events: Agendamento[]): Agendamento[][] {
    if (events.length === 0) return [];

    // Ordenar agendamentos por hora de início
    const sortedEvents = [...events].sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());

    const groups: Agendamento[][] = [];
    const currentGroup: Agendamento[] = [];

    // Para cada agendamento
    sortedEvents.forEach((event) => {
    // Se o grupo atual estiver vazio ou se o evento não se sobrepõe a nenhum evento no grupo atual
        if (currentGroup.length === 0 || !currentGroup.some((groupEvent) => doEventsOverlap(groupEvent, event))) {
            // Adicionar ao grupo atual
            currentGroup.push(event);
        } else {
            // Caso contrário, criar um novo grupo para eventos sobrepostos
            const overlappingGroup = currentGroup.filter((groupEvent) => doEventsOverlap(groupEvent, event));

            // Se já existe um grupo com eventos sobrepostos, adicionar a ele
            const existingGroupIndex = groups.findIndex((group) =>
                group.some((groupEvent) => overlappingGroup.includes(groupEvent)),
            );

            if (existingGroupIndex !== -1) {
                groups[existingGroupIndex].push(event);
            } else {
                // Caso contrário, criar um novo grupo
                groups.push([...overlappingGroup, event]);
            }
        }
    });

    // Adicionar o grupo atual se não estiver vazio e não estiver já incluído nos grupos
    if (
        currentGroup.length > 0 &&
    !groups.some((group) => group.some((groupEvent) => currentGroup.includes(groupEvent)))
    ) {
        groups.push(currentGroup);
    }

    // Se não houver grupos sobrepostos, retornar cada evento em seu próprio grupo
    if (groups.length === 0) {
        return sortedEvents.map((event) => [event]);
    }

    // Verificar eventos que não estão em nenhum grupo
    const eventsInGroups = new Set(groups.flat().map((event) => event.id));
    const ungroupedEvents = sortedEvents.filter((event) => !eventsInGroups.has(event.id));

    // Adicionar eventos não agrupados como grupos individuais
    ungroupedEvents.forEach((event) => {
        groups.push([event]);
    });

    return groups;
}

export default function AgendamentosPage() {
    // Estado para controlar a semana atual
    const [currentDate, setCurrentDate] = useState(new Date());
    // Estado para controlar o agendamento selecionado
    const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
    // Estado para controlar a abertura do diálogo
    const [dialogOpen, setDialogOpen] = useState(false);
    // Estado para controlar o tipo de visualização
    const [viewType, setViewType] = useState<"dia" | "semana" | "mes" | "lista">("semana");
    // Estado para controlar se está em modo mobile
    const [isMobile, setIsMobile] = useState(false);

    // Detectar se é mobile ao carregar e quando a janela for redimensionada
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Verificar inicialmente
        checkIfMobile();

        // Adicionar listener para redimensionamento
        window.addEventListener("resize", checkIfMobile);

        // Limpar listener ao desmontar
        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    // Ajustar visualização padrão para mobile
    // useEffect(() => {
    //     if (isMobile && viewType === "semana") {
    //         setViewType("dia");
    //     }
    // }, [isMobile, viewType]);

    // Função para abrir o diálogo com os detalhes do agendamento
    const openAgendamentoDetails = (agendamento: Agendamento) => {
        setSelectedAgendamento(agendamento);
        setDialogOpen(true);
    };

    // Função para avançar para o próximo período
    const nextPeriod = () => {
        const nextDate = new Date(currentDate);
        if (viewType === "dia") {
            nextDate.setDate(currentDate.getDate() + 1);
        } else if (viewType === "semana") {
            nextDate.setDate(currentDate.getDate() + 7);
        } else {
            nextDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(nextDate);
    };

    // Função para voltar para o período anterior
    const prevPeriod = () => {
        const prevDate = new Date(currentDate);
        if (viewType === "dia") {
            prevDate.setDate(currentDate.getDate() - 1);
        } else if (viewType === "semana") {
            prevDate.setDate(currentDate.getDate() - 7);
        } else {
            prevDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(prevDate);
    };

    // Função para ir para a data atual
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Gerar os dias da semana a partir da data atual
    const weekDays = getWeekDays(currentDate);

    // Formatar o título do período atual
    const getPeriodTitle = () => {
        if (viewType === "dia") {
            return formatDate(currentDate);
        } else if (viewType === "semana") {
            const firstDay = weekDays[0];
            const lastDay = weekDays[6];
            if (firstDay.getMonth() === lastDay.getMonth()) {
                return `${firstDay.getDate()} - ${lastDay.getDate()} de ${formatMonthName(firstDay)}`;
            } else {
                return `${firstDay.getDate()} ${formatMonthName(firstDay)} - ${lastDay.getDate()} ${formatMonthName(lastDay)}`;
            }
        } else {
            return formatMonthYear(currentDate);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agendamentos</h1>
                    <p className="text-muted-foreground">Visualize e gerencie os agendamentos de locações</p>
                </div>
                <Button asChild size={ isMobile ? "sm" : "default" }>
                    <Link href="/dashboard/agendamentos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        { isMobile ? "Novo" : "Novo Agendamento" }
                    </Link>
                </Button>
            </div>

            { /* Controles de navegação e visualização */ }
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={ prevPeriod }>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={ goToToday }>
              Hoje
                        </Button>
                        <Button variant="outline" size="icon" onClick={ nextPeriod }>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <h2 className="text-base sm:text-xl font-semibold">{ getPeriodTitle() }</h2>
                </div>

                { /* Tabs para visualização em dispositivos móveis */ }
                { isMobile ? (
                    <Tabs
                        value={ viewType }
                        onValueChange={ (value) => setViewType(value as "dia" | "semana" | "mes" | "lista") }
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="dia">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="sr-only sm:not-sr-only">Dia</span>
                            </TabsTrigger>
                            <TabsTrigger value="semana">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                <span className="sr-only sm:not-sr-only">Semana</span>
                            </TabsTrigger>
                            <TabsTrigger value="mes">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                <span className="sr-only sm:not-sr-only">Mês</span>
                            </TabsTrigger>
                            <TabsTrigger value="lista">
                                <List className="h-4 w-4 mr-1" />
                                <span className="sr-only sm:not-sr-only">Lista</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                ) : (
                    <div className="flex justify-end">
                        <Select
                            value={ viewType }
                            onValueChange={ (value) => setViewType(value as "dia" | "semana" | "mes" | "lista") }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Visualização" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dia">Dia</SelectItem>
                                <SelectItem value="semana">Semana</SelectItem>
                                <SelectItem value="mes">Mês</SelectItem>
                                <SelectItem value="lista">Lista</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ) }
            </div>

            <Card className="overflow-hidden">
                <CardContent className={ cn("p-0", isMobile && "overflow-x-auto") }>
                    { viewType === "dia" && (
                        <DayView
                            currentDate={ currentDate }
                            agendamentos={ agendamentos }
                            openAgendamentoDetails={ openAgendamentoDetails }
                            isMobile={ isMobile }
                        />
                    ) }
                    { viewType === "semana" && (
                        <WeekView
                            currentDate={ currentDate }
                            agendamentos={ agendamentos }
                            openAgendamentoDetails={ openAgendamentoDetails }
                            isMobile={ isMobile }
                        />
                    ) }
                    { viewType === "mes" && (
                        <MonthView
                            currentDate={ currentDate }
                            agendamentos={ agendamentos }
                            openAgendamentoDetails={ openAgendamentoDetails }
                            isMobile={ isMobile }
                        />
                    ) }
                    { viewType === "lista" && (
                        <ListView
                            currentDate={ currentDate }
                            agendamentos={ agendamentos }
                            openAgendamentoDetails={ openAgendamentoDetails }
                        />
                    ) }
                </CardContent>
            </Card>

            { viewType !== "lista" && (
                <div className="flex items-center gap-4 justify-center flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300"></div>
                        <span className="text-sm">4 horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-pink-100 border border-pink-300"></div>
                        <span className="text-sm">6 horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></div>
                        <span className="text-sm">8-12 horas</span>
                    </div>
                </div>
            ) }

            { /* Diálogo de detalhes do agendamento */ }
            <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    { selectedAgendamento && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Detalhes do Agendamento</DialogTitle>
                                <DialogDescription>Informações completas sobre a locação do equipamento</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                { /* Cabeçalho com informações principais */ }
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold">{ selectedAgendamento.maquina }</h3>
                                    </div>
                                    <StatusBadge status={ selectedAgendamento.status } />
                                </div>

                                <Separator />

                                { /* Informações do cliente */ }
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">CLIENTE</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.cliente }</span>
                                        </div>
                                        { selectedAgendamento.clienteEmail && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="break-all">{ selectedAgendamento.clienteEmail }</span>
                                            </div>
                                        ) }
                                        { selectedAgendamento.clienteTelefone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{ selectedAgendamento.clienteTelefone }</span>
                                            </div>
                                        ) }
                                    </div>
                                </div>

                                { /* Informações de local */ }
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">LOCAL</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.local }</span>
                                        </div>
                                        { selectedAgendamento.endereco && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{ selectedAgendamento.endereco }</span>
                                            </div>
                                        ) }
                                    </div>
                                </div>

                                { /* Informações de data e hora */ }
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">DATA E HORA</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{ formatDate(selectedAgendamento.dataInicio) }</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                { formatTime(selectedAgendamento.dataInicio) } - { formatTime(selectedAgendamento.dataFim) }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>Duração: { selectedAgendamento.duracao } horas</span>
                                        </div>
                                    </div>
                                </div>

                                { /* Informações financeiras */ }
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">INFORMAÇÕES FINANCEIRAS</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span>Valor: { formatCurrency(selectedAgendamento.valor) }</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span>
                        Valor por hora: { formatCurrency(selectedAgendamento.valor / selectedAgendamento.duracao) }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                { /* Observações */ }
                                { selectedAgendamento.observacoes && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">OBSERVAÇÕES</h4>
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="flex items-start gap-2">
                                                <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{ selectedAgendamento.observacoes }</span>
                                            </div>
                                        </div>
                                    </div>
                                ) }

                                { /* Responsável */ }
                                { selectedAgendamento.responsavel && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">RESPONSÁVEL</h4>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.responsavel }</span>
                                        </div>
                                    </div>
                                ) }
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                <Button variant="outline" className="sm:w-auto w-full" asChild>
                                    <Link href={ `/dashboard/agendamentos/editar/${selectedAgendamento.id}` }>
                                        <Edit className="mr-2 h-4 w-4" />
                    Editar
                                    </Link>
                                </Button>
                                <Button variant="destructive" className="sm:w-auto w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                  Cancelar Agendamento
                                </Button>
                            </DialogFooter>
                        </>
                    ) }
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Componente para exibir o status com a cor apropriada
function StatusBadge({ status }: { status: string }) {
    switch (status) {
    case "confirmado":
        return (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Confirmado
            </Badge>
        );
    case "pendente":
        return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pendente
            </Badge>
        );
    case "concluido":
        return (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Concluído
            </Badge>
        );
    case "cancelado":
        return (
            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Cancelado
            </Badge>
        );
    default:
        return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                { status }
            </Badge>
        );
    }
}

// Componente de visualização diária
function DayView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
    isMobile,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (agendamento: Agendamento) => void
  isMobile: boolean
}) {
    // Horas do dia para exibição
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    // Filtrar agendamentos para o dia atual
    const dayAgendamentos = agendamentos.filter((agendamento) => {
        return isSameDay(agendamento.dataInicio, currentDate);
    });

    if (isMobile) {
        return (
            <div className="min-w-full">
                { /* Cabeçalho com o dia */ }
                <div className="grid grid-cols-1 border-b">
                    <div className={ cn("p-2 text-center font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }>
                        <div>{ formatDayName(currentDate, true) }</div>
                        <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
                            { currentDate.getDate() }
                        </div>
                    </div>
                </div>

                { /* Lista de agendamentos do dia */ }
                <div className="divide-y">
                    { dayAgendamentos.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Nenhum agendamento para este dia</div>
                    ) : (
                        dayAgendamentos.map((agendamento) => {
                            // Determinar a cor com base na duração
                            let bgColor = "";
                            if (agendamento.duracao === 4) {
                                bgColor = "border-yellow-300 bg-yellow-50";
                            } else if (agendamento.duracao === 6) {
                                bgColor = "border-pink-300 bg-pink-50";
                            } else if (agendamento.duracao >= 8 && agendamento.duracao <= 12) {
                                bgColor = "border-green-300 bg-green-50";
                            } else {
                                bgColor = "border-blue-300 bg-blue-50";
                            }

                            return (
                                <div
                                    key={ agendamento.id }
                                    className={ cn("p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors", bgColor) }
                                    onClick={ () => openAgendamentoDetails(agendamento) }
                                >
                                    <div className="font-medium">{ agendamento.maquina }</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            { formatTime(agendamento.dataInicio) } - { formatTime(agendamento.dataFim) }
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <User className="h-3.5 w-3.5" />
                                            { agendamento.cliente }
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            { agendamento.local }
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            { formatCurrency(agendamento.valor) }
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <StatusBadge status={ agendamento.status } />
                                        <span className="text-xs text-muted-foreground">{ agendamento.duracao }h</span>
                                    </div>
                                </div>
                            );
                        })
                    ) }
                </div>
            </div>
        );
    }

    return (
        <div className="min-w-full">
            { /* Cabeçalho com o dia */ }
            <div className="grid grid-cols-2 border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                <div
                    className={ cn("p-2 text-center border-r font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }
                >
                    <div>{ formatDayName(currentDate) }</div>
                    <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
                        { currentDate.getDate() }
                    </div>
                </div>
            </div>

            { /* Grade de horários */ }
            <div className="relative">
                { /* Linhas de horas */ }
                { hours.map((hour) => (
                    <div key={ hour } className="grid grid-cols-2 border-b">
                        <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{ `${hour}:00` }</div>
                        <div className="h-16 border-r relative"></div>
                    </div>
                )) }

                { /* Agendamentos */ }
                { (() => {
                    // Agrupar agendamentos sobrepostos
                    const agendamentoGroups = groupOverlappingEvents(dayAgendamentos);

                    return agendamentoGroups.flatMap((group, groupIndex) => {
                        // Calcular a largura para cada agendamento no grupo
                        const width = `calc((50% - 6px) / ${group.length})`;

                        return group.map((agendamento, agendamentoIndex) => {
                            const startHour = agendamento.dataInicio.getHours();
                            const startMinute = agendamento.dataInicio.getMinutes();
                            const durationInHours = agendamento.duracao;

                            // Calcular posição e altura
                            const top = (startHour - 7) * 64 + (startMinute / 60) * 64; // 64px é a altura de cada hora
                            const height = durationInHours * 64;

                            // Determinar a cor com base na duração
                            let bgColor = "";
                            if (durationInHours === 4) {
                                bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                            } else if (durationInHours === 6) {
                                bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                            } else if (durationInHours >= 8 && durationInHours <= 12) {
                                bgColor = "bg-green-100 border-green-300 text-green-800";
                            } else {
                                bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                            }

                            return (
                                <div
                                    key={ agendamento.id }
                                    className={ cn(
                                        "absolute rounded-md border-l-4 p-2 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                        bgColor,
                                    ) }
                                    style={ {
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `calc(50% + 2px + (${agendamentoIndex} * ${width}))`,
                                        width: width,
                                    } }
                                    onClick={ () => openAgendamentoDetails(agendamento) }
                                >
                                    <div className="font-medium text-sm truncate">{ agendamento.maquina }</div>
                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <User className="h-3 w-3" />
                                        { agendamento.cliente }
                                    </div>
                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <MapPin className="h-3 w-3" />
                                        { agendamento.local }
                                    </div>
                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <Clock className="h-3 w-3" />
                                        { formatTime(agendamento.dataInicio) } - { formatTime(agendamento.dataFim) }
                                    </div>
                                    <div className="flex items-center text-xs gap-1 truncate">
                                        <DollarSign className="h-3 w-3" />
                                        { formatCurrency(agendamento.valor) }
                                    </div>
                                </div>
                            );
                        });
                    });
                })() }
            </div>
        </div>
    );
}

// Componente de visualização semanal
function WeekView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
    isMobile,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (agendamento: Agendamento) => void
  isMobile: boolean
}) {
    // Gerar os dias da semana a partir da data atual
    const weekDays = getWeekDays(currentDate);

    // Horas do dia para exibição
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    // Se for mobile, mostrar uma versão simplificada
    if (isMobile) {
        return (
            <div className="min-w-[700px]">
                { " " }
                { /* Largura mínima para garantir que caiba na tela */ }
                { /* Cabeçalho com os dias da semana */ }
                <div className="grid grid-cols-8 border-b">
                    <div className="p-2 border-r bg-muted/50 text-xs"></div>
                    { weekDays.map((day, index) => (
                        <div
                            key={ index }
                            className={ cn(
                                "p-1 text-center border-r font-medium text-xs",
                                isToday(day) ? "bg-primary/10" : "bg-muted/50",
                            ) }
                        >
                            <div>{ formatDayName(day, true) }</div>
                            <div className={ cn("", isToday(day) ? "text-primary font-bold" : "") }>{ day.getDate() }</div>
                        </div>
                    )) }
                </div>
                { /* Grade de horários simplificada */ }
                <div className="relative">
                    { /* Linhas de horas */ }
                    { hours.map((hour) => (
                        <div key={ hour } className="grid grid-cols-8 border-b">
                            <div className="p-1 border-r text-xs text-muted-foreground text-right pr-2">{ `${hour}:00` }</div>
                            { weekDays.map((_, dayIndex) => (
                                <div key={ dayIndex } className="h-12 border-r relative"></div>
                            )) }
                        </div>
                    )) }

                    { /* Agendamentos */ }
                    { agendamentos.map((agendamento) => {
                        // Verificar se o agendamento está na semana atual
                        if (!isAgendamentoInWeek(agendamento, weekDays)) return null;

                        const dayIndex = getDayIndex(agendamento.dataInicio, weekDays);
                        if (dayIndex === -1) return null;

                        const startHour = agendamento.dataInicio.getHours();
                        const startMinute = agendamento.dataInicio.getMinutes();
                        const durationInHours = agendamento.duracao;

                        // Calcular posição e altura
                        const top = (startHour - 7) * 48 + (startMinute / 60) * 48; // 48px é a altura de cada hora em mobile
                        const height = durationInHours * 48;

                        // Determinar a cor com base na duração
                        let bgColor = "";
                        if (durationInHours === 4) {
                            bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                        } else if (durationInHours === 6) {
                            bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                        } else if (durationInHours >= 8 && durationInHours <= 12) {
                            bgColor = "bg-green-100 border-green-300 text-green-800";
                        } else {
                            bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                        }

                        return (
                            <div
                                key={ agendamento.id }
                                className={ cn(
                                    "absolute rounded-md border-l-4 p-1 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow text-xs",
                                    bgColor,
                                ) }
                                style={ {
                                    top: `${top}px`,
                                    height: `${height}px`,
                                    left: `calc(${(dayIndex + 1) * 12.5}% + 2px)`,
                                    width: "calc(12.5% - 6px)",
                                } }
                                onClick={ () => openAgendamentoDetails(agendamento) }
                            >
                                <div className="font-medium truncate">{ agendamento.maquina }</div>
                                <div className="truncate">{ formatTime(agendamento.dataInicio) }</div>
                            </div>
                        );
                    }) }
                </div>
            </div>
        );
    }

    return (
        <div className="min-w-full">
            { /* Cabeçalho com os dias da semana */ }
            <div className="grid grid-cols-8 border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                { weekDays.map((day, index) => (
                    <div
                        key={ index }
                        className={ cn("p-2 text-center border-r font-medium", isToday(day) ? "bg-primary/10" : "bg-muted/50") }
                    >
                        <div>{ formatDayName(day) }</div>
                        <div className={ cn("text-lg", isToday(day) ? "text-primary font-bold" : "") }>{ day.getDate() }</div>
                    </div>
                )) }
            </div>

            { /* Grade de horários */ }
            <div className="relative">
                { /* Linhas de horas */ }
                { hours.map((hour) => (
                    <div key={ hour } className="grid grid-cols-8 border-b">
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

                        const dayIndex = getDayIndex(agendamento.dataInicio, weekDays);
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

                        return agendamentoGroups.flatMap((group, groupIndex) => {
                            // Calcular a largura para cada agendamento no grupo
                            const width = `calc((12.5% - 6px) / ${group.length})`;

                            return group.map((agendamento, agendamentoIndex) => {
                                const startHour = agendamento.dataInicio.getHours();
                                const startMinute = agendamento.dataInicio.getMinutes();
                                const durationInHours = agendamento.duracao;

                                // Calcular posição e altura
                                const top = (startHour - 7) * 64 + (startMinute / 60) * 64; // 64px é a altura de cada hora
                                const height = durationInHours * 64;

                                // Determinar a cor com base na duração
                                let bgColor = "";
                                if (durationInHours === 4) {
                                    bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                                } else if (durationInHours === 6) {
                                    bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                                } else if (durationInHours >= 8 && durationInHours <= 12) {
                                    bgColor = "bg-green-100 border-green-300 text-green-800";
                                } else {
                                    bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                                }

                                return (
                                    <div
                                        key={ agendamento.id }
                                        className={ cn(
                                            "absolute rounded-md border-l-4 p-2 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                            bgColor,
                                        ) }
                                        style={ {
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            left: `calc(${(dayIndex + 1) * 12.5}% + 2px + (${agendamentoIndex} * ${width}))`,
                                            width: width,
                                        } }
                                        onClick={ () => openAgendamentoDetails(agendamento) }
                                    >
                                        <div className="font-medium text-sm truncate">{ agendamento.maquina }</div>
                                        <div className="flex items-center text-xs gap-1 truncate">
                                            <User className="h-3 w-3" />
                                            { agendamento.cliente }
                                        </div>
                                        <div className="flex items-center text-xs gap-1 truncate">
                                            <MapPin className="h-3 w-3" />
                                            { agendamento.local }
                                        </div>
                                        <div className="flex items-center text-xs gap-1 truncate">
                                            <Clock className="h-3 w-3" />
                                            { formatTime(agendamento.dataInicio) }
                                        </div>
                                        <div className="flex items-center text-xs gap-1 truncate">
                                            <DollarSign className="h-3 w-3" />
                                            { formatCurrency(agendamento.valor) }
                                        </div>
                                    </div>
                                );
                            });
                        });
                    });
                })() }
            </div>
        </div>
    );
}

// Componente de visualização mensal
function MonthView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
    isMobile,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (agendamento: Agendamento) => void
  isMobile: boolean
}) {
    // Obter dias do mês atual
    const monthDays = getMonthDays(currentDate);

    return (
        <div className={ cn("min-w-full", isMobile && "min-w-[700px]") }>
            { /* Cabeçalho com os dias da semana */ }
            <div className="grid grid-cols-7 border-b">
                { ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                    <div key={ index } className="p-2 text-center border-r font-medium bg-muted/50 text-xs sm:text-sm">
                        { day }
                    </div>
                )) }
            </div>

            { /* Grade do mês */ }
            <div className="grid grid-cols-7">
                { monthDays.map((day, index) => {
                    // Filtrar agendamentos para este dia
                    const dayAgendamentos = agendamentos.filter((agendamento) => isSameDay(agendamento.dataInicio, day));

                    // Verificar se é do mês atual ou não
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    // Limitar o número de agendamentos mostrados em mobile
                    const maxAgendamentos = isMobile ? 2 : 3;

                    return (
                        <div
                            key={ index }
                            className={ cn(
                                "border-r border-b p-1 relative",
                                isMobile ? "min-h-[80px]" : "min-h-[120px]",
                                isToday(day) ? "bg-primary/5" : "",
                                !isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "",
                            ) }
                        >
                            <div className={ cn("text-right p-1 font-medium text-xs", isToday(day) ? "text-primary" : "") }>
                                { day.getDate() }
                            </div>

                            <div className="space-y-1 mt-1">
                                { dayAgendamentos.slice(0, maxAgendamentos).map((agendamento) => {
                                    // Determinar a cor com base na duração
                                    let bgColor = "";
                                    if (agendamento.duracao === 4) {
                                        bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                                    } else if (agendamento.duracao === 6) {
                                        bgColor = "bg-pink-100 border-pink-300 text-pink-800";
                                    } else if (agendamento.duracao >= 8 && agendamento.duracao <= 12) {
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
                                            { formatTime(agendamento.dataInicio) } - { agendamento.maquina }
                                        </div>
                                    );
                                }) }

                                { dayAgendamentos.length > maxAgendamentos && (
                                    <div className="text-xs text-center text-muted-foreground">
                    +{ dayAgendamentos.length - maxAgendamentos } mais
                                    </div>
                                ) }
                            </div>
                        </div>
                    );
                }) }
            </div>
        </div>
    );
}

// Componente de visualização em lista
function ListView({
    currentDate,
    agendamentos,
    openAgendamentoDetails,
}: {
  currentDate: Date
  agendamentos: Agendamento[]
  openAgendamentoDetails: (agendamento: Agendamento) => void
}) {
    // Filtrar agendamentos para o mês atual
    const monthAgendamentos = agendamentos.filter((agendamento) => {
        return (
            agendamento.dataInicio.getMonth() === currentDate.getMonth() &&
      agendamento.dataInicio.getFullYear() === currentDate.getFullYear()
        );
    });

    // Ordenar por data
    const sortedAgendamentos = [...monthAgendamentos].sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());

    // Agrupar por dia
    const agendamentosByDay: Record<string, Agendamento[]> = {};

    sortedAgendamentos.forEach((agendamento) => {
        const dateKey = formatDate(agendamento.dataInicio);
        if (!agendamentosByDay[dateKey]) {
            agendamentosByDay[dateKey] = [];
        }
        agendamentosByDay[dateKey].push(agendamento);
    });

    return (
        <div className="min-w-full">
            { Object.keys(agendamentosByDay).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">Nenhum agendamento para este mês</div>
            ) : (
                Object.entries(agendamentosByDay).map(([dateKey, dayAgendamentos]) => (
                    <div key={ dateKey } className="border-b last:border-b-0">
                        <div className="p-2 bg-muted/30 font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            { dateKey }
                            <Badge className="ml-2">{ dayAgendamentos.length }</Badge>
                        </div>
                        <div className="divide-y">
                            { dayAgendamentos.map((agendamento) => {
                                // Determinar a cor com base na duração
                                let borderColor = "";
                                if (agendamento.duracao === 4) {
                                    borderColor = "border-yellow-300";
                                } else if (agendamento.duracao === 6) {
                                    borderColor = "border-pink-300";
                                } else if (agendamento.duracao >= 8 && agendamento.duracao <= 12) {
                                    borderColor = "border-green-300";
                                } else {
                                    borderColor = "border-blue-300";
                                }

                                return (
                                    <div
                                        key={ agendamento.id }
                                        className={ cn("p-3 cursor-pointer hover:bg-muted/20 transition-colors border-l-4", borderColor) }
                                        onClick={ () => openAgendamentoDetails(agendamento) }
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium">{ agendamento.maquina }</div>
                                            <StatusBadge status={ agendamento.status } />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                { formatTime(agendamento.dataInicio) } - { formatTime(agendamento.dataFim) }
                                                <span className="text-xs ml-1 text-muted-foreground">({ agendamento.duracao }h)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                { agendamento.cliente }
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                { agendamento.local }
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                                { formatCurrency(agendamento.valor) }
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) }
                        </div>
                    </div>
                ))
            ) }
        </div>
    );
}

// Funções auxiliares
function getWeekDays(date: Date): Date[] {
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

function formatDayName(date: Date, short = false): string {
    if (short) {
    // Retorna apenas as três primeiras letras
        return date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3).toUpperCase();
    }
    return (
        date.toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toUpperCase() +
    date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(1, 3)
    );
}

function formatMonthName(date: Date): string {
    return (
        date.toLocaleDateString("pt-BR", { month: "short" }).charAt(0).toUpperCase() +
    date.toLocaleDateString("pt-BR", { month: "short" }).slice(1)
    );
}

function formatMonthYear(date: Date): string {
    return (
        date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).charAt(0).toUpperCase() +
    date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).slice(1)
    );
}

function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    );
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isAgendamentoInWeek(agendamento: Agendamento, weekDays: Date[]): boolean {
    const agendamentoDate = agendamento.dataInicio;
    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    return agendamentoDate >= weekStart && agendamentoDate <= weekEnd;
}

function getDayIndex(date: Date, weekDays: Date[]): number {
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

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
    );
}

// Função para obter os dias do mês (incluindo dias do mês anterior e próximo para preencher a grade)
function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);

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

// Função auxiliar para criar datas corretamente
function createDate(dayOffset: number, hours: number, minutes: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Dados simulados de agendamentos
const agendamentos: Agendamento[] = [
    {
        id: 1,
        maquina: "Escavadeira Hidráulica",
        cliente: "João Silva",
        clienteEmail: "joao.silva@email.com",
        clienteTelefone: "(11) 98765-4321",
        local: "São Paulo - Centro",
        endereco: "Av. Paulista, 1000, São Paulo - SP",
        dataInicio: createDate(0, 9, 0), // Hoje às 9h
        dataFim: createDate(0, 13, 0), // Hoje às 13h
        duracao: 4,
        valor: 1200.0,
        status: "confirmado",
        observacoes: "Cliente solicitou entrega do equipamento no local. Acesso pela entrada lateral do terreno.",
        responsavel: "Carlos Oliveira",
    },
    {
        id: 2,
        maquina: "Compressor de Ar",
        cliente: "Empresa ABC Ltda",
        clienteEmail: "contato@empresaabc.com",
        clienteTelefone: "(11) 3456-7890",
        local: "Campinas",
        endereco: "Rua das Indústrias, 500, Campinas - SP",
        dataInicio: createDate(0, 14, 0), // Hoje às 14h
        dataFim: createDate(0, 20, 0), // Hoje às 20h
        duracao: 6,
        valor: 800.0,
        status: "pendente",
        observacoes: "Aguardando confirmação de pagamento. Cliente é recorrente.",
    },
    {
        id: 3,
        maquina: "Furadeira Industrial",
        cliente: "Maria Oliveira",
        clienteEmail: "maria@email.com",
        clienteTelefone: "(11) 91234-5678",
        local: "Guarulhos",
        endereco: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        dataInicio: createDate(1, 8, 0), // Amanhã às 8h
        dataFim: createDate(1, 16, 0), // Amanhã às 16h
        duracao: 8,
        valor: 650.0,
        status: "confirmado",
    },
    {
        id: 4,
        maquina: "Betoneira",
        cliente: "Construtora XYZ",
        clienteEmail: "obras@construtoraxyz.com",
        clienteTelefone: "(11) 2345-6789",
        local: "Santo André",
        endereco: "Rua das Obras, 123, Santo André - SP",
        dataInicio: createDate(2, 10, 0), // Depois de amanhã às 10h
        dataFim: createDate(2, 22, 0), // Depois de amanhã às 22h
        duracao: 12,
        valor: 1500.0,
        status: "confirmado",
        responsavel: "Ana Souza",
    },
    {
        id: 5,
        maquina: "Andaime",
        cliente: "Pedro Santos",
        clienteEmail: "pedro@email.com",
        clienteTelefone: "(11) 97654-3210",
        local: "Osasco",
        endereco: "Rua das Torres, 50, Osasco - SP",
        dataInicio: createDate(-1, 13, 0), // Ontem às 13h
        dataFim: createDate(-1, 17, 0), // Ontem às 17h
        duracao: 4,
        valor: 350.0,
        status: "concluido",
    },
    {
        id: 6,
        maquina: "Martelete",
        cliente: "Reformas Rápidas ME",
        clienteEmail: "contato@reformasrapidas.com",
        clienteTelefone: "(11) 3333-4444",
        local: "São Bernardo",
        endereco: "Av. Industrial, 789, São Bernardo do Campo - SP",
        dataInicio: createDate(3, 9, 30), // Daqui a 3 dias às 9:30h
        dataFim: createDate(3, 15, 30), // Daqui a 3 dias às 15:30h
        duracao: 6,
        valor: 420.0,
        status: "pendente",
        observacoes: "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7,
        maquina: "Gerador Industrial",
        cliente: "Eventos Especiais Ltda",
        clienteEmail: "contato@eventosespeciais.com",
        clienteTelefone: "(11) 5555-6666",
        local: "São Paulo - Zona Sul",
        endereco: "Av. Santo Amaro, 1500, São Paulo - SP",
        dataInicio: createDate(0, 10, 0), // Hoje às 10h (sobrepõe com Escavadeira)
        dataFim: createDate(0, 14, 0), // Hoje às 14h
        duracao: 4,
        valor: 950.0,
        status: "confirmado",
    },
    {
        id: 8,
        maquina: "Empilhadeira",
        cliente: "Logística Express",
        clienteEmail: "operacoes@logisticaexpress.com",
        clienteTelefone: "(11) 7777-8888",
        local: "Guarulhos",
        endereco: "Rodovia Presidente Dutra, km 210, Guarulhos - SP",
        dataInicio: createDate(1, 9, 0), // Amanhã às 9h (sobrepõe com Furadeira)
        dataFim: createDate(1, 15, 0), // Amanhã às 15h
        duracao: 6,
        valor: 1100.0,
        status: "pendente",
    },
];
