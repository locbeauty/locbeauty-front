import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/utils/@types/goals";
import { GoalStatuses } from "@/utils/constants";
import { getMonthName } from "@/utils/getMonthName";
import { Building2, Calendar, DollarSign, Clock, Plus } from "lucide-react";

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
            return "bg-green-200 text-green-900 hover:bg-green-300";
        case "PARCIALMENTE_CONCLUIDA":
            return "bg-yellow-200 text-yellow-900 hover:bg-yellow-300";
        case "EM_ANDAMENTO":
            return "bg-blue-200 text-blue-900 hover:bg-blue-300";
        case "NAO_ATINGIDA":
            return "bg-red-200 text-red-900 hover:bg-red-300";
        }
    };

    const confirmedPct = target > 0 ? (current / target) * 100 : 0;
    const estimatedPct = target > 0 ? (estimated / target) * 100 : 0;

    console.log("goal: ", goal);

    // console.log("estimatedPct - confirmedPct: ", estimatedPct - confirmedPct, estimatedPct, confirmedPct);

    return (
        <Card key={ goal.goalId } className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg">
                                {getMonthName(goal.monthIndex)}/{goal.year}
                            </h3>

                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Filial {goal.filialId}
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
                            </div>
                        </div>
                    </div>

                    <Badge variant="outline" className={ statusColor(goal.status) }>
                        {goal.status}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progresso Total</span>
                            <span className="text-sm text-muted-foreground">
                                {formatValue(current)} / {formatValue(target)}
                            </span>
                        </div>

                        {/* === PROGRESSO TOTAL === */}
                        <div className="relative h-3 w-full rounded-full overflow-hidden bg-gray-200">
                            {/* CONFIRMADO */}
                            <div
                                className={ `absolute left-0 top-0 h-3 bg-primary transition-all duration-300 ${estimatedPct > 0 ? "rounded-l-full" : "rounded-full"}` }
                                style={ { width: `${confirmedPct}%` } }
                            />

                            {/* PENDENTE */}
                            <div
                                className="absolute top-0 h-3 bg-green-500 rounded-r-full transition-all duration-300"
                                style={ {
                                    left: `${confirmedPct}%`,
                                    width: `${estimatedPct}%`,
                                } }
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-primary rounded-full flex items-center" />
                                {confirmedPct.toFixed(1)}% confirmado +
                                <div className="w-3 h-3 bg-green-500 rounded-full" /> {estimatedPct.toFixed(1)}% estimado
                            </div>
                            <span className="text-muted-foreground">
                                Faltam: {formatValue(Math.max(target - current, 0))}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="text-sm font-medium">Confirmado</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatValue(current)}</div>
                                <div className="text-xs text-muted-foreground">
                                    {confirmedPct.toFixed(1)}% da meta
                                </div>
                            </div>
                        </div>

                        {estimated > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Pendente</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold">{formatValue(estimated)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {((estimated / target) * 100).toFixed(1)}% da meta
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span className="text-sm font-medium">Meta Total</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatValue(target)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
