import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPieChart } from "../CustomPieChart";
import { Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TopCustomersCard } from "@/components/pages/dashboard/cards/TopCustomersCard";
import { useEffect, useState } from "react";
import { getAvailableYears } from "@/services/dashboard.service";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { apiRequest } from "@/lib/api";

interface Filial {
  filialId: string;
  filialName: string;
}

export function CustomersTab() {
  const [ selectedYear, setSelectedYear ] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [ availableYears, setAvailableYears ] = useState<string[]>([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const years = await getAvailableYears();
        const yearsString = years.map(String);
        setAvailableYears(yearsString);

        if (yearsString.length > 0 && !yearsString.includes(selectedYear)) {
          if (!yearsString.includes(String(new Date().getFullYear()))) {
            setSelectedYear(yearsString[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch available years", error);
      }

      try {
        const { data } = await apiRequest<Filial[]>({
          endpoint: "filials",
          method: "GET",
        });
        if (data) {
          setFilials(data);
        }
      } catch (error) {
        console.error("Failed to fetch filials", error);
      }
    }
    fetchData();
  }, [ selectedYear ]);

  const satisfacaoData = [
    { name: "5 estrelas", value: 65 },
    { name: "4 estrelas", value: 23 },
    { name: "3 estrelas", value: 8 },
    { name: "2 estrelas", value: 3 },
    { name: "1 estrela", value: 1 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <CustomFilterSelect
          items={ filials.map((f) => ({
            value: f.filialId,
            label: f.filialName,
          })) }
          placeholder="Filial"
          value={ selectedFilialId }
          onValueChange={ setSelectedFilialId }
          defaultValue="all"
          showAllOption
        />
        <CustomFilterSelect
          items={ availableYears }
          placeholder="Ano"
          value={ selectedYear }
          onValueChange={ setSelectedYear }
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Taxa de Retenção</CardTitle>
            <CardDescription>Clientes que renovam contratos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-4">78%</div>
            <Progress value={ 78 } className="h-2 w-full" />
            <p className="mt-2 text-sm text-muted-foreground">
              +5% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Satisfação do Cliente</CardTitle>
            <CardDescription>Distribuição das avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomPieChart
              data={ satisfacaoData }
              dataKey="value"
              nameKey="name"
              height={ 200 }
              colors={ [
                "hsl(var(--success, 142 76% 36%))",
                "hsl(var(--primary))",
                "hsl(var(--warning, 38 92% 50%))",
                "hsl(var(--warning, 38 92% 50%))",
                "hsl(var(--destructive))",
              ] }
              valueFormatter={ (value) => `${value}%` }
            />
          </CardContent>
        </Card>
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Tempo Médio de Resposta</CardTitle>
            <CardDescription>Tempo para atender solicitações</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">2.4h</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              -15% em relação ao período anterior
            </p>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-sm">
                <span>Solicitações Urgentes</span>
                <span className="font-medium">1.2h</span>
              </div>
              <Progress value={ 50 } className="h-1 mt-1" />

              <div className="flex items-center justify-between text-sm mt-2">
                <span>Solicitações Normais</span>
                <span className="font-medium">3.5h</span>
              </div>
              <Progress value={ 70 } className="h-1 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      <TopCustomersCard
        selectedYear={ Number(selectedYear) }
        filialId={ selectedFilialId === "all" ? undefined : selectedFilialId }
      />
    </div>
  );
}
