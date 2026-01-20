import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActiveClientsMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Filial {
  filialId: string;
  filialName: string;
}

export function ActiveClientsCard() {
  const [ metric, setMetric ] = useState<{
    totalClients: number;
    activeClients: number;
    activePercentage: number;
    newClients: number;
    recurringClients: number;
  } | null>(null);
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
        const now = new Date();
        const data = await getActiveClientsMetric({
          year: now.getFullYear(),
          startMonth: 1,
          endMonth: 12,
          filialId: selectedFilialId,
        });
        setMetric(data);
      } catch (error) {
        console.error(error);
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
          <Users className="h-4 w-4 text-muted-foreground" />
          Clientes Ativos
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
            <SelectTrigger className="w-[140px] h-8">
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[60px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : metric ? (
          <>
            <div className="text-2xl font-bold">{metric.activeClients}</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-muted-foreground">
                {(metric.activePercentage ?? 0).toFixed(1)}%
              </span>{" "}
              da base de clientes
            </p>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Erro ao carregar dados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
