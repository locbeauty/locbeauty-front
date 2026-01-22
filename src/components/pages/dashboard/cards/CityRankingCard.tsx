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
import { getCityRankingMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Filial {
  filialId: string;
  filialName: string;
}

interface CityRankingCardProps {
  selectedYear: string;
  availableYears: string[];
}

export function CityRankingCard({
  selectedYear: initialYear,
  availableYears,
}: CityRankingCardProps) {
  const [ rankingData, setRankingData ] = useState<
    { name: string; value: number }[]
  >([]);
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
    async function fetchRanking() {
      if (!localSelectedYear) return;

      setLoading(true);
      try {
        const { cityRanking } = await getCityRankingMetric({
          year: Number(localSelectedYear),
          filialId: selectedFilialId,
        });

        const formattedData = (cityRanking || []).map((item) => ({
          name: item.city,
          value: item.count,
        }));
        setRankingData(formattedData);
      } catch (error) {
        console.error("Failed to fetch city ranking", error);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, [ localSelectedYear, selectedFilialId ]);

  return (
    <Card className="lg:col-span-4 w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Ranking de cidades</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Cidades com mais agendamentos</span>
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
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CustomBarChart
            data={ rankingData }
            dataKey="value"
            nameKey="name"
            height={ 400 }
            fill="#7f2b83"
            valueFormatter={ (value) => `${value} locações` }
            allowDecimals={ false }
          />
        )}
      </CardContent>
    </Card>
  );
}
