"use client";

import { useMemo, ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Goal } from "@/utils/@types/goals";
import { GetAllGoals } from "@/services/goals.service";

import {
    Target,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle,
    LoaderCircle,
    LucideProps,
} from "lucide-react";

import { CreateGoalDialog } from "@/components/pages/goals/CreateGoalDialog";
import { GoalCard } from "@/components/pages/goals/GoalCard";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { useForm, Controller, FormProvider } from "react-hook-form";
import { SelectGear } from "@/components/pages/bookings/create/SelectGear";
import { Gear } from "@/utils/@types/gears";

type FiltersForm = {
  filialId?: string;
  status?: string;
  gear?: string;
  tab?: "money" | "gear";
};

export default function MetasMensaisPage() {
    const { user } = useAuth();

    const filterMethods = useForm<FiltersForm>({
        defaultValues: {
            filialId: undefined,
            status: undefined,
            gear: undefined,
            tab: "money",
        },
    });

    const { control, watch, reset, setValue } = filterMethods;

    const filterFilial = watch("filialId");
    const filterStatus = watch("status");
    const filterMachine = watch("gear");
    const activeTab = watch("tab");

    const { data, isLoading } = useQuery<Goal[]>({
        queryKey: [ "get-all-goals" ],
        queryFn: () =>
            GetAllGoals({
                filialId:
          user?.role === "Gerente"
              ? undefined
              : user?.sourceFilial.filialId,
            }),
        staleTime: 1000 * 60,
    });

    const goals = data;

    const filteredGoals = useMemo(() => {
        if (!goals) return [];

        let filtered = [ ...goals ];

        if (filterFilial)
            filtered = filtered.filter((g) => g.filial.filialId === filterFilial);
        if (filterStatus) filtered = filtered.filter((g) => g.status === filterStatus);

        return filtered;
    }, [ goals, filterFilial, filterStatus ]);

    const moneyGoals = filteredGoals.filter((g) => g.goalType === "MONEY");

    const equipmentGoals = filteredGoals
        .filter((g) => g.goalType === "GEAR")
        .filter((g) =>
            filterMachine ? g.Gear?.gearId === filterMachine : true
        );

    // supondo que você já tenha "goals" carregado
    const gears = Array.from(
        new Map(
            filteredGoals
                .filter((g) => g.Gear) // só goals com engrenagem
                .map((g) => [ g.Gear!.gearId, g.Gear ]) // chave = gearId
        ).values()
    );

    const filiaisList = Array.from(new Set(goals?.map((g) => g.filial.filialName) ?? []));

    const estatisticas = useMemo(
        () => ({
            total: filteredGoals.length,
            emAndamento: filteredGoals.filter((m) => m.status === "EM_ANDAMENTO").length,
            atingidas: filteredGoals.filter((m) => m.status === "Concluida").length,
            naoAtingidas: filteredGoals.filter((m) => m.status === "NAO_ATINGIDA").length,
            mediaPercentual:
        filteredGoals.length > 0
            ? (filteredGoals.filter((m) => m.status === "Concluida").length /
              filteredGoals.length) *
            100
            : 0,
        }),
        [ filteredGoals ]
    );

    const StatCard = ({
        title,
        value,
        icon: Icon,
        textColor = "text-foreground",
        iconColor = "text-muted-foreground",
    }: {
    title: string;
    value: number | string | undefined;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metas Mensais de Vendas</h1>
                    <p className="text-muted-foreground">
            Acompanhe metas financeiras e de equipamentos
                    </p>
                </div>
                <CreateGoalDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total de Metas" value={ estatisticas.total } icon={ Target } />
                <StatCard
                    title="Em Andamento"
                    value={ estatisticas.emAndamento }
                    icon={ Clock }
                    textColor="text-blue-600"
                    iconColor="text-blue-600"
                />
                <StatCard
                    title="Atingidas"
                    value={ estatisticas.atingidas }
                    icon={ CheckCircle }
                    textColor="text-green-600"
                    iconColor="text-green-600"
                />
                <StatCard
                    title="Não Atingidas"
                    value={ estatisticas.naoAtingidas }
                    icon={ AlertTriangle }
                    textColor="text-red-600"
                    iconColor="text-red-600"
                />
                <StatCard
                    title="Média de Atingimento"
                    value={ `${estatisticas.mediaPercentual.toFixed(1)}%` }
                    icon={ TrendingUp }
                    textColor="text-primary"
                    iconColor="text-primary"
                />
            </div>

            <Card className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Filial</Label>
                        <Controller
                            control={ control }
                            name="filialId"
                            render={ ({ field }) => (
                                <Select onValueChange={ field.onChange } value={ field.value }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filiaisList.map((f) => (
                                            <SelectItem key={ f } value={ f }>
                                                {f}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) }
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Status</Label>
                        <Controller
                            control={ control }
                            name="status"
                            render={ ({ field }) => (
                                <Select onValueChange={ field.onChange } value={ field.value }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                                        <SelectItem value="Concluida">Atingida</SelectItem>
                                        <SelectItem value="NAO_ATINGIDA">Não atingida</SelectItem>
                                        <SelectItem value="PARCIALMENTE_CONCLUIDA">
                      Parcialmente atingida
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) }
                        />
                    </div>

                    {activeTab === "gear" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Equipamento</Label>
                                <Controller
                                    control={ control }
                                    name="gear"
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value ?? "" }
                                            onValueChange={ field.onChange }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o produto" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {gears.map((g) => (
                                                    <SelectItem key={ g.gearId } value={ g.gearId }>
                                                        {g.gearName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        // <Select onValueChange={ field.onChange } value={ field.value }>
                                        //     <SelectTrigger>
                                        //         <SelectValue placeholder="Selecione" />
                                        //     </SelectTrigger>
                                        //     <SelectContent>
                                        //         {machinesList.map((m) => (
                                        //             <SelectItem key={ m } value={ m ?? "" }>
                                        //                 {m}
                                        //             </SelectItem>
                                        //         ))}
                                        //     </SelectContent>
                                        // </Select>
                                    ) }
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={ () =>
                        reset({
                            filialId: undefined,
                            status: undefined,
                            gear: "",
                            tab: activeTab,
                        })
                    }
                >
          Limpar filtros
                </Button>
            </Card>

            <Tabs
                defaultValue="money"
                className="w-full"
                onValueChange={ (v) => setValue("tab", v as "money" | "gear") }
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="money">Metas Financeiras</TabsTrigger>
                    <TabsTrigger value="gear">Metas de Equipamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="money">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex gap-2 items-center">
                                <Target className="h-5 w-5" />
                Metas Financeiras
                                <Badge variant="secondary">{moneyGoals.length}</Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {moneyGoals.length === 0 ? (
                                <p className="text-muted-foreground">Nenhuma meta encontrada.</p>
                            ) : (
                                moneyGoals.map((meta) => (
                                    <GoalCard key={ meta.goalId } goal={ meta } />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gear">
                    {/* <Card className="p-4 mb-4">

                    </Card> */}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex gap-2 items-center">
                                <Target className="h-5 w-5" />
                Metas de Equipamentos
                                <Badge variant="secondary">{equipmentGoals.length}</Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {equipmentGoals.length === 0 ? (
                                <p className="text-muted-foreground">Nenhuma meta encontrada.</p>
                            ) : (
                                equipmentGoals.map((meta) => (
                                    <GoalCard key={ meta.goalId } goal={ meta } />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
