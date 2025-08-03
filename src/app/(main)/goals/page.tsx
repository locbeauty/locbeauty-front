"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMonthName } from "@/utils/getMonthName";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Target, TrendingUp, Clock,
    ChevronUp,
    ChevronDown,
    History,
    Play,
    AlertTriangle,
    CheckCircle
} from "lucide-react";
import { CreateGoalDialog } from "@/components/pages/goals/CreateGoalDialog";
import { GoalCard } from "@/components/pages/goals/GoalCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const FilterGoalsSchema = z
    .object({
        filterFilial: z.string().optional(),
        filterStatus: z.string().optional(),
        filterStartYear: z.string().optional(),
        filterStartMonth: z.string().optional(),
        filterEndYear: z.string().optional(),
        filterEndMonth: z.string().optional(),
    })
    .refine((data) => {
        if (!data.filterStartYear || !data.filterStartMonth) return true;
        if (!data.filterEndYear || !data.filterEndMonth) return true;

        const startYear = parseInt(data.filterStartYear, 10);
        const endYear = parseInt(data.filterEndYear, 10);
        const startMonth = parseInt(data.filterStartMonth, 10);
        const endMonth = parseInt(data.filterEndMonth, 10);

        if (isNaN(startYear) || isNaN(endYear) || isNaN(startMonth) || isNaN(endMonth)) {
            return false;
        }

        if (startYear > endYear) return false;
        if (startYear === endYear && startMonth > endMonth) return false;

        return true;
    }, {
        message: "A data inicial não pode ser posterior à data final.",
        path: [ "filterStartYear" ],
    });

type filterGoalsType = z.infer<typeof FilterGoalsSchema>

export type StatusMeta = "Concluida" | "EM_ANDAMENTO" | "NAO_ATINGIDA" | "PARCIALMENTE_CONCLUIDA"

export type MetaMensal = {
    filialId: string;
    goalId?: number;
    year: number;
    remainingDays: number,
    monthIndex: number;
    targetValue: number;
    currentValue: number;
    estimatedValue: number,
    status: StatusMeta
    createdAt: Date;
    updatedAt: Date;
}

export default function MetasMensaisPage() {

    const { control, reset, trigger, watch, formState: { errors } } = useForm<filterGoalsType>({
        resolver: zodResolver(FilterGoalsSchema),
        defaultValues: {
            filterEndMonth: undefined,
            filterEndYear: undefined,
            filterStartMonth: undefined,
            filterStartYear: undefined,
        }
    });

    const watchStartYear = watch("filterStartYear");
    const watchStartMonth = watch("filterStartMonth");

    const watchEndYear = watch("filterEndYear");
    const watchEndMonth = watch("filterEndMonth");

    const watchFilial = watch("filterFilial");
    const watchStatus = watch("filterStatus");

    useEffect(() => {
        async function GetAllGoals() {
            const response = await fetch("http://localhost:3333/api/goals", { credentials: "include" });
            const { data }: { data: MetaMensal[] } = await response.json();

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const currentGoals = data.filter(goal => goal.year === currentYear && goal.monthIndex === currentMonth);
            const pastGoals = data.filter(goal => goal.year < currentYear || (goal.year === currentYear && goal.monthIndex < currentMonth));

            setCurrentMonthGoals(currentGoals);
            setPastMonthsGoals(pastGoals);
            setGoals(data);
        }

        GetAllGoals();
    }, []);

    const [ goals, setGoals ] = useState<MetaMensal[]>([]);
    const [ currentMonthGoals, setCurrentMonthGoals ] = useState<MetaMensal[]>([]);
    const [ pastMonthsGoals, setPastMonthsGoals ] = useState<MetaMensal[]>([]);
    const [ filteredGoals, setFilteredGoals ] = useState<MetaMensal[]>([]);

    const [ openPreviousGoalsCollapsible, setOpenPreviousGoalsCollapsible ] = useState(false);
    const [ openCurrentGoalsCollapsible, setOpenCurrentGoalsCollapsible ] = useState(true);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = [ ...goals ];

            // Filtro por filial
            if (watchFilial) {
                filtered = filtered.filter((goal) => goal.filialId === watchFilial);
            }

            // Filtro por status
            if (watchStatus) {
                filtered = filtered.filter((goal) => goal.status === watchStatus);
            }

            // Filtro por intervalo de datas (ano/mês)
            if (watchStartYear && watchStartMonth && watchEndYear && watchEndMonth) {
                const startDate = new Date(parseInt(watchStartYear), parseInt(watchStartMonth) - 1);
                const endDate = new Date(parseInt(watchEndYear), parseInt(watchEndMonth) - 1);

                filtered = filtered.filter((goal) => {
                    const goalDate = new Date(goal.year, goal.monthIndex);
                    return goalDate >= startDate && goalDate <= endDate;
                });
            }

            setFilteredGoals(filtered);
        };

        const run = async () => {
            const isValid = await trigger();
            if (isValid && watchStartMonth && watchStartYear) {
                applyFilters();
            }
        };

        run();
    }, [ goals, watchStartYear, watchStartMonth, watchEndYear, watchEndMonth, watchFilial, watchStatus, trigger ]);

    // Calcular estatísticas
    const estatisticas = {
        total: goals.length,
        emAndamento: goals.filter((m) => m.status === "EM_ANDAMENTO").length,
        atingidas: goals.filter((m) => m.status === "Concluida").length,
        naoAtingidas: goals.filter((m) => m.status === "NAO_ATINGIDA").length,
        mediaPercentual: goals.length > 0 ? (goals.filter((m) => m.status === "Concluida").length / goals.length) * 100 : 0
    };

    // Gerar opções de mês/ano para filtro
    const generateYearOptions = () => {
        const yearOptions: string[] = [];

        goals.forEach(goal => {
            if(!yearOptions.includes(String(goal.year))) {
                yearOptions.push(String(goal.year));
            }
        });

        return yearOptions;
    };

    const generateMonthOptions = () => {
        const monthOptions: {monthLabel: string, monthIndex: string}[] = [];

        for(let i=0; i<12; i++) {
            monthOptions.push({
                monthLabel: getMonthName(i),
                monthIndex: String(i)
            });
        }

        return monthOptions;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metas Mensais de Vendas</h1>
                    <p className="text-muted-foreground">Acompanhe as metas da sua filial por aqui</p>
                </div>
                <div className="flex gap-2">
                    <CreateGoalDialog />
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estatisticas.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atingidas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{estatisticas.atingidas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Não Atingidas</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{estatisticas.naoAtingidas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média de Atingimento</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{estatisticas.mediaPercentual.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="">
                            <div className="space-y-2">
                                <Label>Filial</Label>
                                <SelectFilial control={ control } name="filterFilial" />
                            </div>
                            <div className="h-3" />
                        </div>

                        <div className="">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Controller
                                    name="filterStatus"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Select value={ field.value ?? "" } onValueChange={ field.onChange }>
                                            <SelectTrigger className="w-full md:w-[90%] data-[placeholder]:text-placeholder">
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[ "EM_ANDAMENTO", "Concluida", "NAO_ATINGIDA" ].map((status) => (
                                                    <SelectItem key={ status } value={ status }>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                            </div>
                            <div className="h-3" />
                        </div>

                        <div className="">
                            <div className="flex gap-4">
                                <div className="space-y-2">
                                    <Label>Início</Label>
                                    <div className="flex gap-1 items-center">
                                        <Controller
                                            name="filterStartMonth"
                                            control={ control }
                                            render={ ({ field }) => (
                                                <Select value={ field.value ?? "" } onValueChange={ field.onChange }>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="mês" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <Separator />
                                                        {generateMonthOptions().map((month) => (
                                                            <SelectItem key={ month.monthIndex } value={ month.monthIndex }>
                                                                {month.monthLabel}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) }
                                        />
                                        <span>/</span>
                                        <Controller
                                            name="filterStartYear"
                                            control={ control }
                                            render={ ({ field }) => (
                                                <Select value={ field.value ?? "" } onValueChange={ field.onChange }>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="ano" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <Separator />
                                                        {generateYearOptions().map((year) => (
                                                            <SelectItem key={ year } value={ year }>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Fim</Label>
                                    <div className="flex gap-1 items-center">
                                        <Controller
                                            name="filterEndMonth"
                                            control={ control }
                                            render={ ({ field }) => (
                                                <Select value={ field.value ?? "" } onValueChange={ field.onChange }>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="mês" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <Separator />
                                                        {generateMonthOptions().map((month) => (
                                                            <SelectItem key={ month.monthIndex } value={ month.monthIndex }>
                                                                {month.monthLabel}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) }
                                        />
                                        <span>/</span>
                                        <Controller
                                            name="filterEndYear"
                                            control={ control }
                                            render={ ({ field }) => (
                                                <Select value={ field.value ?? "" } onValueChange={ field.onChange }>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="ano" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <Separator />
                                                        {generateYearOptions().map((year) => (
                                                            <SelectItem key={ year } value={ year }>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="h-3">
                                {errors.filterStartYear && (
                                    <p className="text-xs font-medium text-destructive">
                                        {errors.filterStartYear.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={ () => reset() }
                                className="w-full"
                            >
        Limpar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>

            </Card>

            {/* Metas do Mês Atual */}
            <div className="space-y-4">
                <div className="grid gap-4">
                    {currentMonthGoals.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Nenhuma meta do mês atual</h3>
                                <p className="text-muted-foreground text-center">
                  Não há metas definidas para {getMonthName(new Date().getMonth())}/2025 com os filtros selecionados.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <Collapsible open={ openCurrentGoalsCollapsible } onOpenChange={ setOpenCurrentGoalsCollapsible }>
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Play className="h-5 w-5 text-muted-foreground" />
                                                <CardTitle className="text-lg">Metas do mês atual</CardTitle>
                                                <Badge variant="secondary">{currentMonthGoals.length}</Badge>
                                            </div>
                                            {openCurrentGoalsCollapsible ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="grid gap-4">
                                            {currentMonthGoals.slice(0, 1).map((meta) => <GoalCard key={ meta.goalId } goal={ meta } />)}
                                            {/* {(filteredGoals.length > 0 ? filteredGoals : currentMonthGoals).map((meta) => <GoalCard key={ meta.goalId } goal={ meta } />)} */}

                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    )}
                </div>
            </div>

            {/* Metas Anteriores - Collapsible */}
            {pastMonthsGoals.length > 0 && (
                <Collapsible open={ openPreviousGoalsCollapsible } onOpenChange={ setOpenPreviousGoalsCollapsible }>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle className="text-lg">Metas Anteriores</CardTitle>
                                        <Badge variant="secondary">{pastMonthsGoals.length}</Badge>
                                    </div>
                                    {openPreviousGoalsCollapsible ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-0">
                                <div className="grid gap-4">
                                    {pastMonthsGoals.map((meta) => (
                                        <GoalCard key={ meta.goalId } goal={ meta } />
                                    ))}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            )}
        </div>
    );
}
