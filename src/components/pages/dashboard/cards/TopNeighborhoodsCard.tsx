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
import { CustomBarChart } from "../CustomBarChart";
import { useEffect, useState } from "react";
import { getTopNeighborhoodsMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopNeighborhoodsCardProps {
  selectedYear: string;
  availableYears: string[];
}

export function TopNeighborhoodsCard({
  selectedYear: initialYear,
  availableYears,
}: TopNeighborhoodsCardProps) {
  const [ data, setData ] = useState<{ name: string; value: number }[]>([]);
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
        const { data: metricData } = await getTopNeighborhoodsMetric({
          year: Number(localSelectedYear),
          filialId: selectedFilialId,
        });

        const formattedData = metricData.map((item) => ({
          name: item.neighborhood,
          value: item.count,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch top neighborhoods metric", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMetric();
  }, [ localSelectedYear, selectedFilialId ]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Top Bairros</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Bairros com mais clientes</span>
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
          <CustomBarChart
            data={ data }
            dataKey="value"
            nameKey="name"
            height={ 300 }
            fill="#7f2b83"
            valueFormatter={ (value) => `${value}` }
          />
        )}
      </CardContent>
    </Card>
  );
}
