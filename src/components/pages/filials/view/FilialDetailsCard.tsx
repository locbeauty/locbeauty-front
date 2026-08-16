import {
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  Building,
  Users,
  TrendingUp,
  Calendar,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Filial, FilialStats } from "@/utils/@types/filials";
import { useEffect, useState } from "react";
import { getFilialStats } from "@/services/filials.service";

interface FilialDetailsCardProps {
  selectedFilial: Filial | null;
}

export function FilialDetailsCard({ selectedFilial }: FilialDetailsCardProps) {
  const [ stats, setStats ] = useState<FilialStats | null>(null);

  useEffect(() => {
    if (selectedFilial) {
      getFilialStats(selectedFilial.filialId)
        .then(setStats)
        .catch(console.error);
    } else {
      setStats(null);
    }
  }, [ selectedFilial ]);

  if (!selectedFilial) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Selecione uma filial para ver os detalhes
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Building className="h-5 w-5" />
          {selectedFilial.filialName}
          {selectedFilial.LinkedFilials?.map((linked) => (
            <Badge
              key={ linked.filialId }
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              <Link2 className="h-3 w-3 mr-1" />
              Vinculada a {linked.filialName}
            </Badge>
          ))}
        </CardTitle>
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
                <Label className="text-sm font-medium">ID filial:</Label>
                <span className="font-mono text-sm font-semibold">
                  {selectedFilial.filialId}
                </span>
              </div>
            </div>
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
                <User className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Gerente:</Label>
                <span className="text-sm font-semibold">
                  {selectedFilial.managerEmployee?.fullname || "--"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Telefone:</Label>
                <span className="text-sm">
                  {selectedFilial.cellphone || "--"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Email:</Label>
                <span className="text-sm text-blue-600">
                  {selectedFilial.email || "--"}
                </span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalEquipment ?? "--"}
              </div>
              <div className="text-xs text-muted-foreground">
                Equipamentos Totais
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.availableEquipment ?? "--"}
              </div>
              <div className="text-xs text-muted-foreground">
                Equipamentos Disponíveis
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.inUseEquipment ?? "--"}
              </div>
              <div className="text-xs text-muted-foreground">Em Uso</div>
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
                <span>Clientes ativos: {stats?.activeCustomers ?? "--"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Agendamentos este mês: {stats?.appointmentsThisMonth ?? "--"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Crescimento mensal:{" "}
                  {stats?.monthlyGrowth !== undefined
                    ? `${stats.monthlyGrowth > 0 ? "+" : ""}${stats.monthlyGrowth.toFixed(1)}%`
                    : "--"}
                </span>
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
