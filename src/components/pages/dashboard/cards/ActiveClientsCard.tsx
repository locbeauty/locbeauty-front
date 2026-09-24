import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveClientsMetric } from "@/services/dashboard.service";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { formatShareOfBase } from "@/utils/formatShareOfBase";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

export function ActiveClientsCard({
  filialIds: generalFilialIds,
}: {
  filialIds: string[];
}) {
  const [ metric, setMetric ] = useState<{
    totalClients: number;
    activeClients: number;
  } | null>(null);
  const [ loading, setLoading ] = useState(true);
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);

  useEffect(() => {
    async function fetchMetric() {
      setLoading(true);
      try {
        const now = new Date();
        const data = await getActiveClientsMetric({
          year: now.getFullYear(),
          startMonth: 1,
          endMonth: 12,
          filialIds,
        });
        setMetric(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ filialIds ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex gap-2 items-center">
          <Users className="h-4 w-4 text-muted-foreground" />
          Clientes Ativos
        </CardTitle>
        <div className="flex items-center gap-2">
          <DashboardFilialSelect
            value={ filialIds }
            onChange={ setFilialIds }
            className="h-8"
          />
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
                {formatShareOfBase(metric.activeClients, metric.totalClients)}
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
