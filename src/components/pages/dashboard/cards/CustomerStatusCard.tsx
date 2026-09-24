import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomPieChart } from "../CustomPieChart";
import { useEffect, useState } from "react";
import { getCustomerStatusMetric } from "@/services/dashboard.service";
import { Loader2 } from "lucide-react";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

export function CustomerStatusCard({
  filialIds: generalFilialIds,
}: {
  filialIds: string[];
}) {
  const [ data, setData ] = useState<{ name: string; value: number }[]>([]);
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    async function fetchMetric() {
      setLoading(true);
      try {
        const { data: metricData } = await getCustomerStatusMetric({
          filialIds,
        });

        const formattedData = metricData.map((item) => ({
          name: item.status,
          value: item.count,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch customer status metric", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ filialIds ]);

  // Cor por status (a ordem dos dados vem do banco, então mapear por nome).
  const STATUS_COLORS: Record<string, string> = {
    Ativo: "#16a34a", // verde
    Inadimplente: "#dc2626", // vermelho
    Inativo: "#6b7280", // cinza
    Bloqueado: "#334155", // cinza-escuro
  };
  const chartColors = data.map(
    (item) => STATUS_COLORS[item.name] ?? "#a1a1aa",
  );

  // Total exibido para conferência: tem que bater com o total da tela de
  // Clientes (mesmo recorte de base).
  const totalClients = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Status dos clientes
            {!loading && totalClients > 0 && (
              <span className="text-muted-foreground">
                {" "}
                · {totalClients} clientes na base
              </span>
            )}
          </span>
          <DashboardFilialSelect
            value={ filialIds }
            onChange={ setFilialIds }
            className="h-8"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CustomPieChart
            data={ data }
            dataKey="value"
            nameKey="name"
            height={ 300 }
            colors={ chartColors }
          />
        )}
      </CardContent>
    </Card>
  );
}
