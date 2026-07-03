import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPieChart } from "../CustomPieChart";
import { useEffect, useState } from "react";
import { getCustomerStatusMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Filial {
  filialId: string;
  filialName: string;
}

export function CustomerStatusCard() {
  const [ data, setData ] = useState<{ name: string; value: number }[]>([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    async function fetchFilials() {
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
    fetchFilials();
  }, []);

  useEffect(() => {
    async function fetchMetric() {
      setLoading(true);
      try {
        const { data: metricData } = await getCustomerStatusMetric({
          filialId: selectedFilialId,
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
  }, [ selectedFilialId ]);

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

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Status dos clientes</span>
          <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Filial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as filiais</SelectItem>
              {filials.map((filial) => (
                <SelectItem key={ filial.filialId } value={ filial.filialId }>
                  {filial.filialName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
