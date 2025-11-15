"use client";

import { useState, useMemo , ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuth } from "@/contexts/auth-provider";
// import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { FilterGoalsSchema, filterGoalsType, StatusMeta } from "@/lib/zod/Goals";
import { ApiResponse } from "@/lib/api";
import { Goal } from "@/utils/@types/goals";
import { GetAllGoals } from "@/services/goals.service";
import { getMonthName } from "@/utils/getMonthName";

import {
    Target,
    TrendingUp,
    Clock,
    ChevronUp,
    ChevronDown,
    History,
    Play,
    AlertTriangle,
    CheckCircle,
    LoaderCircle,
    LucideProps
} from "lucide-react";

import { CreateGoalDialog } from "@/components/pages/goals/CreateGoalDialog";
import { GoalCard } from "@/components/pages/goals/GoalCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useQuery } from "@tanstack/react-query";

export type MetaMensal = {
  filialId: string;
  goalId?: number;
  year: number;
  remainingDays: number;
  monthIndex: number;
  targetValue: number;
  currentValue: number;
  estimatedValue: number;
  status: StatusMeta;
  createdAt: Date;
  updatedAt: Date;
};

export default function MetasMensaisPage() {
    const { user } = useAuth();

    const {
        control,
        reset,
        watch,
        trigger,
        formState: { errors },
    } = useForm<filterGoalsType>({
        resolver: zodResolver(FilterGoalsSchema),
        defaultValues: {
            filterEndMonth: undefined,
            filterEndYear: undefined,
            filterStartMonth: undefined,
            filterStartYear: undefined,
        },
    });

    const watchStartYear = watch("filterStartYear");
    const watchStartMonth = watch("filterStartMonth");
    const watchEndYear = watch("filterEndYear");
    const watchEndMonth = watch("filterEndMonth");
    const watchFilial = watch("filterFilial");
    const watchStatus = watch("filterStatus");

    // Busca metas via React Query
    // const { data: goals = [], isLoading } = useQuery<Goal[], Error>({
    //     queryKey: [ "get-all-goals", user?.role, watchFilial ],
    //     queryFn: () =>
    //         GetAllGoals({
    //             filialId: user?.role === "Gerente" ? undefined : user?.sourceFilial.filialId,
    //         }),
    //     staleTime: 1000 * 60,
    // });

    const { data, isLoading } = useQuery<Goal[], Error>({
        queryKey: [ "get-all-goals" ],
        queryFn: () =>
            GetAllGoals({
                filialId: user?.role === "Gerente" ? undefined : user?.sourceFilial.filialId,
            }),
        staleTime: 1000 * 60, // 1 minuto de cache
        // cacheTime: 1000 * 60 * 5, // mantém cache 5 minutos
    });

    const goals = data;

    // Aplica filtros
    const filteredGoals = useMemo(() => {
        if(goals) {
            let filtered = [ ...goals ];

            if (watchFilial) filtered = filtered.filter((g) => g.filialId === watchFilial);
            if (watchStatus) filtered = filtered.filter((g) => g.status === watchStatus);

            if (watchStartYear && watchStartMonth && watchEndYear && watchEndMonth) {
                const start = new Date(+watchStartYear, +watchStartMonth - 1);
                const end = new Date(+watchEndYear, +watchEndMonth - 1);
                filtered = filtered.filter((g) => {
                    const d = new Date(g.year, g.monthIndex);
                    return d >= start && d <= end;
                });
            }

            return filtered;
        }
    }, [ goals, watchFilial, watchStatus, watchStartMonth, watchStartYear, watchEndMonth, watchEndYear ]);

    // Separação das metas por período
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthGoals = filteredGoals?.filter(
        (g) => g.year === currentYear && g.monthIndex === currentMonth
    );
    const pastMonthsGoals = filteredGoals?.filter(
        (g) => g.year < currentYear || (g.year === currentYear && g.monthIndex < currentMonth)
    );

    // Estatísticas
    const estatisticas = useMemo(() => ({
        total: filteredGoals?.length,
        emAndamento: filteredGoals?.filter((m) => m.status === "EM_ANDAMENTO").length,
        atingidas: filteredGoals?.filter((m) => m.status === "Concluida").length,
        naoAtingidas: filteredGoals?.filter((m) => m.status === "NAO_ATINGIDA").length,
        mediaPercentual:
      filteredGoals?.length && filteredGoals?.length > 0
          ? (filteredGoals?.filter((m) => m.status === "Concluida").length / filteredGoals?.length) * 100
          : 0,
    }), [ filteredGoals ]);

    const StatCard = ({
        title,
        value,
        icon: Icon,
        textColor = "text-foreground",
        iconColor = "text-muted-foreground",
    }: {
    title: string;
    value: number | string | undefined;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    textColor?: string;
    iconColor?: string;
  }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={ `h-4 w-4 ${iconColor}` } />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-8">
                        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className={ `text-2xl font-bold ${textColor}` }>{value}</div>
                )}
            </CardContent>
        </Card>
    );

    const [ openCurrentGoalsCollapsible, setOpenCurrentGoalsCollapsible ] = useState(true);
    const [ openPreviousGoalsCollapsible, setOpenPreviousGoalsCollapsible ] = useState(false);

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
                <StatCard title="Total de Metas" value={ estatisticas.total } icon={ Target } />
                <StatCard title="Em Andamento" value={ estatisticas.emAndamento } icon={ Clock } textColor="text-blue-600" iconColor="text-blue-600" />
                <StatCard title="Atingidas" value={ estatisticas.atingidas } icon={ CheckCircle } textColor="text-green-600" iconColor="text-green-600" />
                <StatCard title="Não Atingidas" value={ estatisticas.naoAtingidas } icon={ AlertTriangle } textColor="text-red-600" iconColor="text-red-600" />
                <StatCard title="Média de Atingimento" value={ `${estatisticas.mediaPercentual.toFixed(1)}%` } icon={ TrendingUp } textColor="text-primary" iconColor="text-primary" />
            </div>

            {/* Metas do Mês Atual */}
            <div className="space-y-4">
                <div className="grid gap-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Carregando metas...</p>
                            </CardContent>
                        </Card>
                    ) : currentMonthGoals?.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Nenhuma meta do mês atual</h3>
                                <p className="text-muted-foreground text-center">
                  Não há metas definidas para {getMonthName(new Date().getMonth())}/{currentYear}.
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
                                                <Badge variant="secondary">{currentMonthGoals?.length}</Badge>
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
                                            {currentMonthGoals?.map((meta) => (
                                                <GoalCard key={ meta.goalId } goal={ meta } />
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    )}
                </div>
            </div>

            {/* Metas Anteriores */}
            {!isLoading && pastMonthsGoals && pastMonthsGoals.length > 0 && (
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
