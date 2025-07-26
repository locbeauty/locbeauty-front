import { Clock, FileText, Calendar, TrendingUp, AlertTriangle, CheckCircle, Settings, MapPin, Settings2, ClockAlert, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Gear } from "@/utils/@types/gears";

interface GearDetailsCardProps {
    selectedGear: Gear | null
}

export function GearDetailsCard({ selectedGear }: GearDetailsCardProps) {
    if (!selectedGear) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Selecione um equipamento para ver os detalhes
                </CardContent>
            </Card>
        );
    }

    // Cálculos para estatísticas

    const availabilityPercentage = (selectedGear.availableUnits / selectedGear.totalUnits) * 100; // 50%
    const utilizationPercentage = ((selectedGear.totalUnits - selectedGear.availableUnits - selectedGear.outOfServiceUnits) / selectedGear.totalUnits) * 100; // 20%

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {selectedGear.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {selectedGear.description}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Informações Básicas */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Informações Básicas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Filial:</Label>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-mono text-sm">{selectedGear.filialId}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Data de Aquisição:</Label>
                                {/* <span className="font-mono text-sm">{selectedGear.acquisitionDate ? selectedGear.acquisitionDate.toLocaleDateString() : "Não informado"}</span> */}
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Transferível:</Label>
                                {selectedGear.transferable ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Sim
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Não
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Disponibilidade
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Unidades Totais:</Label>
                                <span className="font-mono text-sm font-semibold">{selectedGear.totalUnits}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Unidades Disponíveis:</Label>
                                <span className="font-mono text-sm font-semibold text-green-600">{selectedGear.availableUnits}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Unidades em Uso:</Label>
                                <span className="font-mono text-sm font-semibold text-orange-600">
                                    {selectedGear.totalUnits - selectedGear.availableUnits}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-sm text-muted-foreground">Taxa de Disponibilidade</Label>
                                    <span className="text-sm font-medium">{availabilityPercentage}%</span>
                                </div>
                                <Progress value={ availabilityPercentage } className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-sm text-muted-foreground">Taxa de Utilização</Label>
                                    <span className="text-sm font-medium">{utilizationPercentage}%</span>
                                </div>
                                <Progress value={ utilizationPercentage } className="h-2" />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Estatísticas de Uso */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Estatísticas de Uso
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{utilizationPercentage}%</div>
                            <div className="text-sm text-muted-foreground">Taxa de Utilização</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{availabilityPercentage}%</div>
                            <div className="text-sm text-muted-foreground">Disponibilidade</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">90</div>
                            <div className="text-sm text-muted-foreground">Agendamentos/Ano</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Informações Operacionais */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informações Operacionais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Média de uso mensal: 7.5 agendamentos</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Último agendamento: há 3 dias</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>Tendência: Uso crescente (+15%)</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                <span>Taxa de cancelamento: 5%</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Tempo médio de uso: 4.2 horas</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Informações sobre manutenções */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Manutenções:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Check className="h-4 w-4" />
                                <span>Última manutenção: {selectedGear.lastMaintenance?.toLocaleString() ?? "Não informado"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ClockAlert className="h-4 w-4" />
                                <span>Próxima manutenção: {selectedGear.nextMaintenance?.toLocaleString() ?? "Não informado"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status do Equipamento */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                            Equipamento Operacional - Todas as unidades funcionando normalmente
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}