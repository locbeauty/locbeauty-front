
import { MetaMensal, StatusMeta } from "@/app/(main)/goals/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMonthName } from "@/utils/getMonthName";
import {
    Building2,
    Calendar,
    DollarSign, Clock
} from "lucide-react";

export function GoalCard({ goal }: { goal: MetaMensal }) {

    const getStatusColor = (status: StatusMeta): string => {
        switch (status) {
        case "Concluida":
            return "bg-green-200 text-green-900 hover:bg-green-300";
        case "PARCIALMENTE_CONCLUIDA":
            return "bg-yellow-200 text-yellow-900 hover:bg-yellow-300";
        case "EM_ANDAMENTO":
            return "bg-blue-200 text-blue-900 hover:bg-blue-300";
        case "NAO_ATINGIDA":
            return "bg-red-200 text-red-900 hover:bg-red-300";
        default:
            return "bg-gray-200 text-gray-900 hover:bg-gray-300";
        }
    };

    const centsToReal = (valorInCents: number): number => {
        return valorInCents / 100;
    };

    // Função para formatar valor
    const formatarValor = (valor: number): string => {
        return centsToReal(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const confirmedPercentage = (goal.currentValue / goal.targetValue) * 100;
    const estimatedPercentage = (goal.estimatedValue / goal.targetValue) * 100;
    const pendingValue = goal.estimatedValue;

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
                  Filial Recife
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                  Meta Mensal
                                </div>
                                {goal.status === "EM_ANDAMENTO" && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {goal.remainingDays} dias restantes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={ getStatusColor(goal.status) }>
                            {goal.status}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Progress Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progresso Total</span>
                            <span className="text-sm text-muted-foreground">
                                {formatarValor(goal.currentValue)} / {formatarValor(goal.targetValue)}
                            </span>
                        </div>

                        {/* Main Progress Bar - Estimated Value */}
                        <div className="relative">
                            <Progress value={ estimatedPercentage } className="h-3" />
                            {/* Overlay for Confirmed Value */}
                            <div className="absolute inset-0 flex">
                                <div
                                    className="bg-primary rounded-full h-3 transition-all duration-300"
                                    style={ { width: `${Math.min(confirmedPercentage, 100)}%` } }
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span>
                                {estimatedPercentage.toFixed(1)}% estimado / {confirmedPercentage.toFixed(1)}% confirmado
                            </span>
                            <span className="text-muted-foreground">
                Faltam: {formatarValor(Math.max(goal.targetValue - goal.currentValue, 0))}
                            </span>
                        </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="text-sm font-medium">Confirmado</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatarValor(goal.currentValue)}</div>
                                <div className="text-xs text-muted-foreground">{confirmedPercentage.toFixed(1)}% da meta</div>
                            </div>
                        </div>

                        {pendingValue > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Pendente</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold">{formatarValor(pendingValue)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {((pendingValue / goal.targetValue) * 100).toFixed(1)}% da meta
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
                                <div className="text-sm font-semibold">{formatarValor(goal.targetValue)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}