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

export function GoalCard({
  goal,
  onViewDetails,
}: {
  goal: Goal;
  onViewDetails: (goal: Goal) => void;
}) {
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
      })
      : v.toLocaleString("pt-BR");

  const statusColor = (status: GoalStatuses) => {
    switch (status) {
    case "Concluida":
      return "bg-green-200 text-green-900";
    case "PARCIALMENTE_CONCLUIDA":
      return "bg-yellow-200 text-yellow-900";
    case "EM_ANDAMENTO":
      return "bg-blue-200 text-blue-900";
    case "NAO_ATINGIDA":
      return "bg-red-200 text-red-900";
    default:
      return "bg-gray-200 text-gray-900";
    }
  };

  const confirmedPct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const estimatedPct =
    target > 0 ? Math.min((estimated / target) * 100, 100 - confirmedPct) : 0;

  return (
    <Card className="overflow-hidden w-full flex flex-col h-full">
      <CardContent className="p-4 flex flex-col h-full gap-4">
        {/* Header with Title and Actions */}
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getMonthName(goal.monthIndex)}/{goal.year}
              <Badge
                variant="outline"
                className={ `${statusColor(
                  goal.status
                )} text-[10px] px-1.5 py-0 h-5` }
              >
                {goal.status}
              </Badge>
            </h3>

            <div className="flex flex-col text-sm text-muted-foreground gap-1">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Filial {goal.Filial.filialName}
              </div>
              {goal.Gear && (
                <div className="flex items-center gap-1">
                  <Cog className="h-3 w-3" />
                  {goal.Gear.gearName}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu modal={ false }>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={ (e) => {
                  e.preventDefault();
                  onViewDetails(goal);
                } }
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress Bar Section - Takes remaining space pushing down if needed, but here structure is simple */}
        <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
          <div className="flex justify-between items-end text-sm">
            <div>
              <span className="text-muted-foreground text-xs block">
                Realizado
              </span>
              <span className="font-semibold text-green-600">
                {formatValue(current)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground text-xs block">Meta</span>
              <span className="font-semibold">{formatValue(target)}</span>
            </div>
          </div>

          <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-secondary">
            {/* Confirmed Part */}
            <div
              className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-300"
              style={ { width: `${confirmedPct}%` } }
            />
            {/* Estimated Part */}
            <div
              className="absolute top-0 h-full bg-yellow-400 transition-all duration-300"
              style={ {
                left: `${confirmedPct}%`,
                width: `${estimatedPct}%`,
              } }
            />
          </div>

          {/* Legend / Extra Info */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Pendente: {formatValue(estimated)}</span>
            </div>
            {goal.status === "EM_ANDAMENTO" && goal.remainingDays !== null && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {goal.remainingDays}d
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
