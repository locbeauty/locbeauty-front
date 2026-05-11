import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { getYearlyRevenueMetric } from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import { CustomAreaChart } from "../CustomAreaChart";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TotalRevenueCardProps {
  selectedYear: string;
  months: string[];
  availableYears: string[];
}

export function TotalRevenueCard({
  selectedYear,
  months,
  availableYears,
}: TotalRevenueCardProps) {
  const [ internalYear, setInternalYear ] = useState(selectedYear);
  const [ yearlyData, setYearlyData ] = useState<
    { date: string; total: number }[]
  >([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");

  const [ loading, setLoading ] = useState(false);
  const [ totalRevenue, setTotalRevenue ] = useState<number>(0);

  // Sync internal year if prop changes
  useEffect(() => {
    if (selectedYear) {
      setInternalYear(selectedYear);
    }
  }, [ selectedYear ]);

  // Fetch Filials on mount
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

  // Fetch Metrics when year changes
  useEffect(() => {
    async function fetchMetrics() {
      if (!internalYear) {
        setYearlyData([]);
        return;
      }

      setLoading(true);
      try {
        const { revenueData: data } = await getYearlyRevenueMetric({
          year: Number(internalYear),
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });

        let total = 0;
        const formattedData = data.map((item) => {
          total += item.total;
          return {
            date: months[item.month - 1].substring(0, 3), // "Jan", "Feb" etc
            total: item.total / 100, // Convert cents to BRL for chart
          };
        });
        setYearlyData(formattedData);
        setTotalRevenue(total);
      } catch (error) {
        console.error("Failed to fetch revenue metric", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [ internalYear, months, selectedFilialId ]);

  return (
    <Card className="relative h-fit">
      <CardHeader>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <CardTitle>Receita Total</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={ selectedFilialId }
              onValueChange={ setSelectedFilialId }
            >
              <SelectTrigger className="w-[180px] h-8">
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

            <Select value={ internalYear } onValueChange={ setInternalYear }>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={ year } value={ year }>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0 ml-0">
        <CustomAreaChart
          data={ yearlyData.length > 0 ? yearlyData : [] }
          dataKey="total"
          height={ 200 }
          stroke="#9B72CF"
          fill="#9B72CF"
          valueFormatter={ (value) =>
            value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }
        />
      </CardContent>
    </Card>
  );
}
