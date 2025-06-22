import { Clock, FileText, Mail, Phone, User, MapPin, Building, Users, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Regional } from "@/utils/@types/regionals";

interface RegionalDetailsCardProps {
    selectedRegional: Regional | null
}

export function RegionalDetailsCard({ selectedRegional }: RegionalDetailsCardProps) {
    if (!selectedRegional) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Selecione uma regional para ver os detalhes
                </CardContent>
            </Card>
        );
    }

    // Endereço completo formatado
    const fullAddress = `${selectedRegional.address.street}, ${selectedRegional.address.buildingNumber}${selectedRegional.address.addressComplement ? ` - ${selectedRegional.address.addressComplement}` : ""}, ${selectedRegional.address.neighborhood}, ${selectedRegional.address.city}/${selectedRegional.address.state.UF}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Regional {selectedRegional.description}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {selectedRegional.address.state.stateName} - {selectedRegional.address.city}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Informações Básicas */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Informações Corporativas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">ID Regional:</Label>
                                <span className="font-mono text-sm font-semibold">{selectedRegional.regionalId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">CNPJ:</Label>
                                <span className="font-mono text-sm">{selectedRegional.CNPJ}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Estado:</Label>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {selectedRegional.address.state.UF} - {selectedRegional.address.state.stateName}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Cidade:</Label>
                                <span className="text-sm">{selectedRegional.address.city}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Bairro:</Label>
                                <span className="text-sm">{selectedRegional.address.neighborhood}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Status:</Label>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Ativa
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Endereço Completo */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Localização
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">
                            <MapPin className="h-4 w-4 inline mr-1 text-muted-foreground" />
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Informações de Contato */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Responsável e Contato
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {/* TODO: fetch employee data */}
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Gerente:</Label>
                                <span className="text-sm font-semibold">{selectedRegional.managerEmployeeId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Telefone:</Label>
                                <span className="text-sm">{selectedRegional.cellphone}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Email:</Label>
                                <span className="text-sm text-blue-600">{selectedRegional.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Estatísticas Operacionais */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Estatísticas Operacionais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">45</div>
                            <div className="text-xs text-muted-foreground">Equipamentos Totais</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">38</div>
                            <div className="text-xs text-muted-foreground">Equipamentos Disponíveis</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">7</div>
                            <div className="text-xs text-muted-foreground">Em Uso</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">84%</div>
                            <div className="text-xs text-muted-foreground">Taxa Disponibilidade</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Informações Adicionais */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informações Operacionais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Clientes ativos: 125</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Agendamentos este mês: 78</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>Crescimento mensal: +12%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                <span>Taxa de satisfação: 4.8/5.0</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Tempo médio de atendimento: 2.3h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Última Atualização */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    <span>Última atualização: {new Date().toLocaleString("pt-BR")}</span>
                </div>
            </CardContent>
        </Card>
    );
}