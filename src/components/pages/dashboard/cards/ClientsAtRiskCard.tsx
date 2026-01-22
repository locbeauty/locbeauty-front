import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getClientsAtRiskMetric } from "@/services/dashboard.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";

interface Filial {
  filialId: string;
  filialName: string;
}

export function ClientsAtRiskCard() {
  const [ count, setCount ] = useState<number | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");

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
        const data = await getClientsAtRiskMetric({
          filialId: selectedFilialId,
        });
        setCount(data.count);
      } catch (error) {
        console.error("Failed to fetch clients at risk metric", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ selectedFilialId ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex gap-2 items-center">
          <AlertTriangleIcon className="h-4 w-4 text-warning" />
          Clientes em Risco (Recência {">"} 90 dias)
        </CardTitle>
        <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Filial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filials.map((filial) => (
              <SelectItem key={ filial.filialId } value={ filial.filialId }>
                {filial.filialName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-16 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : count !== null ? (
          <div className="text-2xl font-bold">{count}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Sem dados</div>
        )}
      </CardContent>
    </Card>
  );
}
