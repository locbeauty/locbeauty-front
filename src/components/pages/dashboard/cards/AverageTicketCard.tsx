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
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { CustomAreaChart } from "../CustomAreaChart";
import { useEffect, useState } from "react";
import { getAverageTicketMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Filial {
  filialId: string;
  filialName: string;
}

interface AverageTicketCardProps {
  selectedYear: string;
  availableYears: string[];
  months: string[];
}

export function AverageTicketCard({
  selectedYear: initialYear,
  availableYears,
  months,
}: AverageTicketCardProps) {
  const [ data, setData ] = useState<{ date: string; total: number }[]>([]);
  const [ localSelectedYear, setLocalSelectedYear ] =
    useState<string>(initialYear);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    setLocalSelectedYear(initialYear);
  }, [ initialYear ]);

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
      if (!localSelectedYear) return;

      setLoading(true);
      try {
        const { data: metricData } = await getAverageTicketMetric({
          year: Number(localSelectedYear),
          filialId: selectedFilialId,
        });

        const formattedData = metricData.map((item) => ({
          date: months[item.month - 1].substring(0, 3),
          total: item.average,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch average ticket metric", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ localSelectedYear, selectedFilialId, months ]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Ticket Médio por Cliente</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Valor médio gasto por cliente mensalmente</span>
          <div className="flex items-center gap-2">
            <Select
              value={ selectedFilialId }
              onValueChange={ setSelectedFilialId }
            >
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
            <CustomFilterSelect
              items={ availableYears }
              placeholder="Selecione o ano"
              triggerProps={ { className: "w-[100px] h-8" } }
              value={ localSelectedYear }
              onValueChange={ setLocalSelectedYear }
            />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CustomAreaChart
            data={ data }
            dataKey="total"
            height={ 300 }
            fill="#7f2b83"
            valueFormatter={ (value) =>
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value)
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
