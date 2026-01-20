import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSignIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getDefaultsMetric } from "@/services/dashboard.service";

interface DefaultsCardProps {
  month: string;
  year: string;
  months: string[];
}

export function DefaultsCard({ month, year, months }: DefaultsCardProps) {
  const [ metric, setMetric ] = useState<{
    count: number;
    percentageChange: number;
  } | null>(null);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    async function fetchMetric() {
      setLoading(true);
      try {
        const monthIndex =
          months.findIndex((m) => m.toLowerCase() === month.toLowerCase()) + 1;
        const data = await getDefaultsMetric({
          month: monthIndex,
          year: Number(year),
        });
        setMetric(data);
      } catch (error) {
        console.error("Failed to fetch defaults metric", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ month, year, months ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex gap-2 items-center">
          <DollarSignIcon className="h-4 w-4 text-destructive" />
          Número de inadimplências
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-16 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : metric ? (
          <>
            <div className="text-2xl font-bold">{metric.count}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              <span
                className={
                  metric.percentageChange > 0
                    ? "text-destructive"
                    : "text-green-500"
                }
              >
                {metric.percentageChange > 0 ? "+" : ""}
                {metric.percentageChange}%
              </span>{" "}
              em relação ao mês anterior
            </p>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Sem dados</div>
        )}
      </CardContent>
    </Card>
  );
}
