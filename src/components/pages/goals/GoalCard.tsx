import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@/utils/@types/goals";
import { GoalStatuses } from "@/utils/constants";
import { getMonthName } from "@/utils/getMonthName";
import { Building2, Calendar, DollarSign, Clock, Cog } from "lucide-react";

export function GoalCard({ goal }: { goal: Goal }) {
    const isMoney = goal.targetCents !== null;
    const target = isMoney ? goal.targetCents! : goal.targetQuantity!;
    const current = isMoney ? goal.currentCents ?? 0 : goal.currentQuantity ?? 0;
    const estimated = isMoney ? goal.estimatedCents ?? 0 : goal.estimatedQuantity ?? 0;

    const formatValue = (v: number) =>
        isMoney
            ? (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
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
        }
    };

    const confirmedPct = target > 0 ? (current / target) * 100 : 0;
    const estimatedPct = target > 0 ? (estimated / target) * 100 : 0;

    return (
        <Card key={ goal.goalId } className="overflow-hidden w-full">
            <CardContent className="p-4 sm:p-6">

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 w-full">

                    {/* Infos da meta */}
                    <div className="flex items-start gap-3 min-w-0">

                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <DollarSign className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                                {getMonthName(goal.monthIndex)}/{goal.year}
                            </h3>

                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">

                                <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Filial {goal.filial.filialName}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Meta Mensal
                                </div>

                                {goal.status === "EM_ANDAMENTO" && goal.remainingDays !== null && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {goal.remainingDays} dias restantes
                                    </div>
                                )}

                                {/* Equipamento associado */}
                                {goal.Gear && (
                                    <div className="flex items-center gap-1">
                                        <Cog className="h-3 w-3" />
                                        {goal.Gear.gearName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex sm:block">
                        <Badge variant="outline" className={ `${statusColor(goal.status)} whitespace-nowrap` }>
                            {goal.status}
                        </Badge>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="space-y-4 max-w-full">

                    {/* Progresso Total */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progresso Total</span>
                            <span className="text-sm text-muted-foreground">
                                {formatValue(current)} / {formatValue(target)}
                            </span>
                        </div>

                        <div className="relative h-3 w-full rounded-full overflow-hidden bg-gray-200">
                            <div
                                className="absolute left-0 top-0 h-3 bg-primary transition-all duration-300"
                                style={ { width: `${confirmedPct}%` } }
                            />
                            <div
                                className="absolute top-0 h-3 bg-green-500 transition-all duration-300"
                                style={ {
                                    left: `${confirmedPct}%`,
                                    width: `${estimatedPct}%`,
                                } }
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-primary rounded-full" />
                                    {confirmedPct.toFixed(1)}% confirmado
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    {estimatedPct.toFixed(1)}% estimado
                                </div>
                            </div>

                            <span className="text-muted-foreground">
                                Faltam: {formatValue(Math.max(target - current, 0))}
                            </span>
                        </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t text-sm">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="font-medium">Confirmado</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{formatValue(current)}</div>
                                <div className="text-xs text-muted-foreground">{confirmedPct.toFixed(1)}%</div>
                            </div>
                        </div>

                        {estimated > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium">Pendente</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{formatValue(estimated)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {((estimated / target) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span className="font-medium">Meta Total</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{formatValue(target)}</div>
                            </div>
                        </div>

                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
