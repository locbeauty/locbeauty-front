import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@/utils/@types/goals";
import { GoalStatuses } from "@/utils/constants";
import { getMonthName } from "@/utils/getMonthName";
import {
  Building2,
  Calendar,
  Clock,
  Cog,
  DollarSign,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GoalDetailsDialog } from "./GoalDetailsDialog";

export function GoalCard({ goal }: { goal: Goal }) {
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);
  const isMoney = goal.targetCents !== null;
  const target = isMoney ? goal.targetCents! : goal.targetQuantity!;
  const current = isMoney ? goal.currentCents ?? 0 : goal.currentQuantity ?? 0;
  const estimated = isMoney
    ? goal.estimatedCents ?? 0
    : goal.estimatedQuantity ?? 0;

  const formatValue = (v: number) =>
    isMoney
      ? (v / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
      : v.toLocaleString("pt-BR");

  const statusColor = (status: GoalStatuses) => {
    switch (status) {
    case "Concluida":
      return "bg-green-100 text-green-800 border-green-200";
    case "PARCIALMENTE_CONCLUIDA":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "EM_ANDAMENTO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "NAO_ATINGIDA":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const confirmedPct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const estimatedPct =
    target > 0 ? Math.min((estimated / target) * 100, 100 - confirmedPct) : 0;

  return (
    <Card
      key={ goal.goalId }
      className="overflow-hidden w-full hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        {/* Header: Month | Filial | Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col mr-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">
                {getMonthName(goal.monthIndex)}/{goal.year}
              </span>
              <Badge
                variant="outline"
                className={ `${statusColor(
                  goal.status
                )} text-[10px] px-1.5 py-0 h-5 whitespace-nowrap` }
              >
                {goal.status === "EM_ANDAMENTO"
                  ? "Em Andamento"
                  : goal.status === "Concluida"
                    ? "Atingida"
                    : goal.status === "NAO_ATINGIDA"
                      ? "Não Atingida"
                      : "Parcial"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              {goal.Filial ? (
                <>
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">
                    {goal.Filial.filialName}
                  </span>
                </>
              ) : (
                "Global"
              )}
              {goal.Gear && (
                <>
                  <span className="mx-1">•</span>
                  <Cog className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {goal.Gear.gearName}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="text-right">
              <div className="text-sm font-bold text-foreground opacity-90">
                {formatValue(target)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">
                Meta
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 -mt-1 -mr-2">
                  <span className="sr-only">Abrir menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={ () => {
                    setTimeout(() => setIsDetailsOpen(true), 0);
                  } }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 w-full rounded-full overflow-hidden bg-muted/20 border border-muted-foreground/20 mb-3">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
            style={ { width: `${confirmedPct}%` } }
          />
          <div
            className="absolute top-0 h-full bg-green-500/50 transition-all duration-300"
            style={ {
              left: `${confirmedPct}%`,
              width: `${estimatedPct}%`,
            } }
          />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title="Confirmado">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium">{confirmedPct.toFixed(0)}%</span>
            </div>
            {estimated > 0 && (
              <div
                className="flex items-center gap-1.5"
                title="Estimado (Pendente)"
              >
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="text-muted-foreground">
                  {estimatedPct.toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            {current < target && (
              <span className="text-[10px] text-muted-foreground">
                {formatValue(current)} / {formatValue(target)}
              </span>
            )}
            {current >= target && (
              <span className="text-green-600 font-medium text-[10px]">
                Meta Batida!
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
            <span>Pendente</span>
          </div>
        </div>

        <GoalDetailsDialog
          open={ isDetailsOpen }
          onOpenChange={ setIsDetailsOpen }
          goal={ goal }
        />
      </CardContent>
    </Card>
  );
}
