"use client";

import {
    useMemo,
    ForwardRefExoticComponent,
    RefAttributes,
    useEffect,
} from "react";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Goal } from "@/utils/@types/goals";
import { GetAllGoals } from "@/services/goals.service";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

import {
    Target,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle,
    LoaderCircle,
    LucideProps,
    FilterX,
    SearchX,
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

import { useForm, Controller } from "react-hook-form";

type FiltersForm = {
  filialId?: string;
  status?: string;
  gear?: string;
  tab?: "money" | "gear";
};

function EmptyState({
    title = "Nenhuma meta encontrada",
    description = "Tente ajustar os filtros ou crie uma nova meta.",
}: {
  title?: string;
  description?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <div className="bg-muted rounded-full p-4 mb-3">
                <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {description}
            </p>
        </div>
    );
}

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
          user?.role === USER_ROLES.GERENTE
              ? undefined
              : user?.sourceFilial.filialId,
            }),
        staleTime: 1000 * 60,
    });

    const goals = data;
    useEffect(() => {
        if (goals) {
            // Debugging or side effect if needed
            console.log("Goals loaded:", goals.length);
        }
    }, [ goals ]);

    const filteredGoals = useMemo(() => {
        if (!goals) return [];

        let filtered = [ ...goals ];

        if (filterFilial)
            filtered = filtered.filter((g) => g.Filial.filialName === filterFilial);
        if (filterStatus)
            filtered = filtered.filter((g) => g.status === filterStatus);

        return filtered;
    }, [ goals, filterFilial, filterStatus ]);

    const moneyGoals = filteredGoals.filter((g) => g.goalType === "MONEY");

    const equipmentGoals = filteredGoals
        .filter((g) => g.goalType === "GEAR")
        .filter((g) => (filterMachine ? g.Gear?.gearId === filterMachine : true));

    const gears = useMemo(() => {
        if (!filteredGoals) return [];
        const gearMap = new Map();
        filteredGoals.forEach((g) => {
            if (g.Gear) {
                gearMap.set(g.Gear.gearId, g.Gear);
            }
        });
        return Array.from(gearMap.values());
    }, [ filteredGoals ]);

    const filiaisList = useMemo(() => {
        return Array.from(new Set(goals?.map((g) => g.Filial.filialName) ?? []));
    }, [ goals ]);

    const estatisticas = useMemo(
        () => ({
            total: filteredGoals.length,
            emAndamento: filteredGoals.filter((m) => m.status === "EM_ANDAMENTO")
                .length,
            atingidas: filteredGoals.filter((m) => m.status === "Concluida").length,
            naoAtingidas: filteredGoals.filter((m) => m.status === "NAO_ATINGIDA")
                .length,
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
        description,
    }: {
    title: string;
    value: number | string | undefined;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    textColor?: string;
    iconColor?: string;
    description?: string;
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
                    <>
                        <div className={ `text-2xl font-bold ${textColor}` }>{value}</div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );

    return (
        <RouteGuard module={ SYSTEM_MODULES.GOALS }>
            <div className="space-y-6 container mx-auto p-4 md:p-6 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Metas Mensais</h1>
                        <p className="text-muted-foreground">
              Gerencie e acompanhe o desempenho de vendas e produtividade.
                        </p>
                    </div>
                    <Can module={ SYSTEM_MODULES.GOALS } action="canCreate">
                        <CreateGoalDialog />
                    </Can>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total de Metas"
                        value={ estatisticas.total }
                        icon={ Target }
                    />
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
                        textColor="text-destructive"
                        iconColor="text-destructive"
                    />
                    <StatCard
                        title="Taxa de Sucesso"
                        value={ `${estatisticas.mediaPercentual.toFixed(1)}%` }
                        icon={ TrendingUp }
                        textColor="text-primary"
                        iconColor="text-primary"
                        description="Metas concluídas vs total"
                    />
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">Filtros</CardTitle>
                        <CardDescription>Refine a visualização das metas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-[200px] space-y-2">
                                <Label>Filial</Label>
                                <Controller
                                    control={ control }
                                    name="filialId"
                                    render={ ({ field }) => (
                                        <Select onValueChange={ field.onChange } value={ field.value }>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value="all_filials_placeholder"
                                                    disabled
                                                    className="hidden"
                                                >
                          Select...
                                                </SelectItem>
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

                            <div className="w-full md:w-[200px] space-y-2">
                                <Label>Status</Label>
                                <Controller
                                    control={ control }
                                    name="status"
                                    render={ ({ field }) => (
                                        <Select onValueChange={ field.onChange } value={ field.value }>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EM_ANDAMENTO">
                          Em andamento
                                                </SelectItem>
                                                <SelectItem value="Concluida">Atingida</SelectItem>
                                                <SelectItem value="NAO_ATINGIDA">
                          Não atingida
                                                </SelectItem>
                                                <SelectItem value="PARCIALMENTE_CONCLUIDA">
                          Parcialmente atingida
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                            </div>

                            {activeTab === "gear" && (
                                <div className="w-full md:w-[250px] space-y-2">
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
                                                    <SelectValue placeholder="Todos os produtos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {gears.map((g) => (
                                                        <SelectItem key={ g.gearId } value={ g.gearId }>
                                                            {g.gearName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) }
                                    />
                                </div>
                            )}

                            <Button
                                variant="secondary"
                                onClick={ () =>
                                    reset({
                                        filialId: undefined,
                                        status: undefined,
                                        gear: "",
                                        tab: activeTab,
                                    })
                                }
                                className="w-full md:w-auto"
                            >
                                <FilterX className="mr-2 h-4 w-4" />
                Limpar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Tabs
                    defaultValue="money"
                    className="w-full"
                    onValueChange={ (v) => setValue("tab", v as "money" | "gear") }
                >
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="money">Metas Financeiras</TabsTrigger>
                        <TabsTrigger value="gear">Metas por Equipamento</TabsTrigger>
                    </TabsList>

                    <TabsContent value="money" className="mt-6">
                        <div className="space-y-4">
                            {moneyGoals.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {moneyGoals.map((meta) => (
                                        <GoalCard key={ meta.goalId } goal={ meta } />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="gear" className="mt-6">
                        <div className="space-y-4">
                            {equipmentGoals.length === 0 ? (
                                <EmptyState title="Nenhuma meta de equipamento encontrada" />
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {equipmentGoals.map((meta) => (
                                        <GoalCard key={ meta.goalId } goal={ meta } />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </RouteGuard>
    );
}
