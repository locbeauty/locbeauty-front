import { Clock, Mail, Phone, User, MapPin, Building, Calendar, Award, Shield, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Employee } from "@/utils/@types/employees";
import { Label } from "@/components/ui/label";

interface EmployeeDetailsCardProps {
    selectedEmployee: Employee | null;
}

export function EmployeeDetailsCard({
    selectedEmployee,
}: EmployeeDetailsCardProps) {
    if (!selectedEmployee) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Selecione um funcionário para ver os detalhes
                </CardContent>
            </Card>
        );
    }

    // Cálculos de idade e tempo de empresa
    const age = new Date().getFullYear() - selectedEmployee.birthdate.getFullYear();
    const isWorkingToday = Math.random() > 0.3; // Simulação de status

    // Endereço formatado
    const fullAddress = selectedEmployee.address
        ? `${selectedEmployee.address.street}, ${selectedEmployee.address.buildingNumber}${selectedEmployee.address.addressComplement ? ` - ${selectedEmployee.address.addressComplement}` : ""}, ${selectedEmployee.address.neighborhood}, ${selectedEmployee.address.city}/${selectedEmployee.address.state}`
        : "Endereço não informado";

    // Função para definir cor do badge do cargo
    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
        case "gerente": case "manager": return "bg-purple-100 text-purple-800 border-purple-200";
        case "supervisor": return "bg-blue-100 text-blue-800 border-blue-200";
        case "técnico": case "technician": return "bg-green-100 text-green-800 border-green-200";
        case "operador": case "operator": return "bg-orange-100 text-orange-800 border-orange-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedEmployee.fullname}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Badge className={ getRoleBadgeColor(selectedEmployee.roleId) }>
                        <Award className="h-3 w-3 mr-1" />
                        {selectedEmployee.roleId}
                    </Badge>
                    <Badge variant="outline" className={ isWorkingToday ? "text-green-600 border-green-200" : "text-gray-600 border-gray-200" }>
                        {isWorkingToday ? (
                            <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Ausente
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Informações Pessoais */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informações Pessoais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">ID Funcionário:</Label>
                                <span className="font-mono text-sm font-semibold">{selectedEmployee.employeeId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">CPF:</Label>
                                <span className="font-mono text-sm">{selectedEmployee.documentNumber}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Data de Nascimento:</Label>
                                <span className="text-sm">{selectedEmployee.birthdate.toLocaleDateString("pt-BR")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Idade:</Label>
                                <span className="text-sm font-semibold">{age} anos</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Email:</Label>
                                <span className="text-sm text-blue-600">{selectedEmployee.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Telefone:</Label>
                                <span className="text-sm">{selectedEmployee.cellphone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Endereço */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço Residencial
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">
                            <MapPin className="h-4 w-4 inline mr-1 text-muted-foreground" />
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Informações Profissionais */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Informações Profissionais
                    </h4>
                    {/* TODO: fetch employee regional data to show here: */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Regional de Origem:</Label>
                                <span className="text-sm font-semibold">{selectedEmployee.sourceRegional}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Regional Atual:</Label>
                                <span className="text-sm">{selectedEmployee.regional.title}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">CNPJ Regional:</Label>
                                <span className="font-mono text-xs">{selectedEmployee.regional.CNPJ}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Estado:</Label>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {selectedEmployee.regional.state.UF} - {selectedEmployee.regional.state.stateName}
                                </Badge>
                            </div>
                        </div>
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Regional de Origem:</Label>
                                <span className="text-sm font-semibold">{selectedEmployee.sourceRegionalId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Regional Atual:</Label>
                                <span className="text-sm">{selectedEmployee.sourceRegionalId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">CNPJ Regional:</Label>
                                <span className="font-mono text-xs">{selectedEmployee.sourceRegionalId}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Estado:</Label>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {selectedEmployee.sourceRegionalId} - {selectedEmployee.sourceRegionalId}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Estatísticas de Performance */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Performance e Estatísticas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">2.5</div>
                            <div className="text-xs text-muted-foreground">Anos na Empresa</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">94%</div>
                            <div className="text-xs text-muted-foreground">Taxa de Presença</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">4.7</div>
                            <div className="text-xs text-muted-foreground">Avaliação (5.0)</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">28</div>
                            <div className="text-xs text-muted-foreground">Atendimentos/Mês</div>
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
                                <Calendar className="h-4 w-4" />
                                <span>Último acesso: hoje às 08:15</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                <span>Tarefas concluídas hoje: 8/10</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>Performance mensal: +8%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Award className="h-4 w-4" />
                                <span>Certificações: 3 ativas</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span>Nível de acesso: Autorizado</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Próximo treinamento: em 15 dias</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Atual */}
                <div className={ `mt-4 p-3 rounded-lg ${isWorkingToday
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }` }>
                    <div className="flex items-center gap-2">
                        {isWorkingToday ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                    Funcionário Ativo - Presente no expediente de hoje
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">
                                    Funcionário Ausente - Férias programadas até 15/06
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Última Atualização */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    <span>Última atualização do perfil: {new Date().toLocaleString("pt-BR")}</span>
                </div>
            </CardContent>
        </Card>
    );
}