import {
    Clock,
    Mail,
    Phone,
    User,
    MapPin, Calendar,
    Award, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Employee } from "@/utils/@types/employee";
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
    const age = selectedEmployee.birthdate ?
        (new Date().getFullYear() - new Date(selectedEmployee.birthdate).getFullYear()) : null;

    // Endereço formatado
    const fullAddress = selectedEmployee.Address
        ? `${selectedEmployee.Address.Street.streetName}, ${
            selectedEmployee.Address.buildingNumber
        }${
            selectedEmployee.Address.addressComplement
                ? ` - ${selectedEmployee.Address.addressComplement}`
                : ""
        }, ${selectedEmployee.Address.Neighborhood.neighborhoodName}, ${
            selectedEmployee.Address.City.cityName
        }/${selectedEmployee.Address.State.UF}`
        : "Endereço não informado";

    // Função para definir cor do badge do cargo
    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
        case "gerente":
        case "manager":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "supervisor":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "técnico":
        case "technician":
            return "bg-green-100 text-green-800 border-green-200";
        case "operador":
        case "operator":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
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
                    <Badge className={ getRoleBadgeColor(selectedEmployee.role) }>
                        <Award className="h-3 w-3 mr-1" />
                        {selectedEmployee.role}
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
                                <span className="font-mono text-sm font-semibold">
                                    {selectedEmployee.employeeId}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">CPF:</Label>
                                <span className="font-mono text-sm">
                                    {selectedEmployee.documentNumber}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                  Data de Nascimento:
                                </Label>
                                <span className="text-sm">
                                    {selectedEmployee.birthdate ? new Date(selectedEmployee.birthdate).toLocaleDateString("pt-BR") : "Não informado"}
                                </span>
                            </div>
                            {
                                age && (
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Idade:</Label>
                                        <span className="text-sm font-semibold">{age} anos</span>
                                    </div>
                                )
                            }
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Email:</Label>
                                <span className="text-sm text-blue-600">
                                    {selectedEmployee.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Telefone:</Label>
                                <span className="text-sm">{selectedEmployee.cellphone}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Filial de Origem: </Label>
                            <span className="text-sm font-semibold">
                                {selectedEmployee.SourceFilial.filialName}/{selectedEmployee.SourceFilial.Address.State.UF}
                            </span>
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

                {/* Estatísticas de Performance */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
            Performance e Estatísticas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">2.5</div>
                            <div className="text-xs text-muted-foreground">
                Anos na Empresa
                            </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">28</div>
                            <div className="text-xs text-muted-foreground">
                Atendimentos/Mês
                            </div>
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
                                <TrendingUp className="h-4 w-4" />
                                <span>Performance mensal: +8%</span>
                            </div>
                        </div>
                        {/* <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Próximo treinamento: em 15 dias</span>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Última Atualização */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    <span>
            Última atualização do perfil: {new Date().toLocaleString("pt-BR")}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
