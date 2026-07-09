"use client";

import { useMemo, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-provider";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Goal } from "@/utils/@types/goals";
import { GetAllGoals } from "@/services/goals.service";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

import { USER_ROLES } from "@/utils/constants";
import {
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
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
  const [ isVisible, setIsVisible ] = useState(false);
  // Removed unused ViewDetails state for now

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
    queryKey: [ "get-all-goals", isVisible ],
    queryFn: () =>
      GetAllGoals({
        filialId:
          filterFilial === "GLOBAL" || !filterFilial
            ? undefined
            : filterFilial,
        isVisible: isVisible ? "false" : undefined,
      }),
    staleTime: 1000 * 60,
  });

  const goals = data;

  const filteredGoals = useMemo(() => {
    if (!goals) return [];

    let filtered = [ ...goals ];

    if (filterFilial && filterFilial !== "GLOBAL") {
      filtered = filtered.filter((g) => g.Filial?.filialId === filterFilial);
    }
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
    const map = new Map<string, string>();
    goals?.forEach((g) => {
      if (g.Filial) map.set(g.Filial.filialId, g.Filial.filialName);
    });
    return Array.from(map, ([ filialId, filialName ]) => ({
      filialId,
      filialName,
    }));
  }, [ goals ]);

  const estatisticas = useMemo(() => {
    const atingidas = filteredGoals.filter(
      (m) => m.status === "Concluida",
    ).length;
    const naoAtingidas = filteredGoals.filter(
      (m) => m.status === "NAO_ATINGIDA",
    ).length;
    // Taxa de sucesso considera apenas metas já decididas (atingidas ou
    // não atingidas); metas em andamento não contam como fracasso.
    const decididas = atingidas + naoAtingidas;

    return {
      total: filteredGoals.length,
      emAndamento: filteredGoals.filter((m) => m.status === "EM_ANDAMENTO")
        .length,
      atingidas,
      naoAtingidas,
      mediaPercentual: decididas > 0 ? (atingidas / decididas) * 100 : 0,
    };
  }, [ filteredGoals ]);

  return (
    <RouteGuard module={ SYSTEM_MODULES.GOALS }>
      <div className="space-y-6 container mx-auto md:p-6">
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
          {(user?.role === USER_ROLES.MASTER ||
            user?.role === USER_ROLES.ADMIN) && (
            <div className="flex items-center space-x-2">
              <Switch
                id="view-deleted-goals"
                checked={ isVisible }
                onCheckedChange={ setIsVisible }
              />
              <Label htmlFor="view-deleted-goals">Ver Excluídos</Label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Total
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{estatisticas.total}</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Em Andamento
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {estatisticas.emAndamento}
              </span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Atingidas
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {estatisticas.atingidas}
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Não Atingidas
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-destructive">
                {estatisticas.naoAtingidas}
              </span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Taxa de Sucesso
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {estatisticas.mediaPercentual.toFixed(1)}%
              </span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-end bg-muted/40 p-3 rounded-lg border">
          <div className="w-full md:w-[200px] space-y-1">
            <Label className="text-xs">Filial</Label>
            <Controller
              control={ control }
              name="filialId"
              render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">
                      Global (Todas as Filiais)
                    </SelectItem>
                    {filiaisList.map((f) => (
                      <SelectItem key={ f.filialId } value={ f.filialId }>
                        {f.filialName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) }
            />
          </div>

          <div className="w-full md:w-[150px] space-y-1">
            <Label className="text-xs">Status</Label>
            <Controller
              control={ control }
              name="status"
              render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                    <SelectItem value="Concluida">Atingida</SelectItem>
                    <SelectItem value="NAO_ATINGIDA">Não atingida</SelectItem>
                    <SelectItem value="PARCIALMENTE_CONCLUIDA">
                      Parcial
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) }
            />
          </div>

          {activeTab === "gear" && (
            <div className="w-full md:w-[200px] space-y-1">
              <Label className="text-xs">Equipamento</Label>
              <Controller
                control={ control }
                name="gear"
                render={ ({ field }) => (
                  <Select
                    value={ field.value ?? "" }
                    onValueChange={ field.onChange }
                  >
                    <SelectTrigger className="h-8">
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
            variant="ghost"
            size="sm"
            onClick={ () =>
              reset({
                filialId: undefined,
                status: undefined,
                gear: "",
                tab: activeTab,
              })
            }
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Limpar Filtros"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>

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
