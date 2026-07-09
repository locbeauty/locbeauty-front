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
import { CustomPieChart } from "../CustomPieChart";
import { useEffect, useState } from "react";
import { getCityRankingMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  FILIAL_COLOR_PALETTE,
  OTHERS_COLOR,
} from "@/utils/filial-colors";

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
    {
      name: string;
      value: number;
      detail?: { label: string; value: number }[];
    }[]
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

        const ranking = cityRanking || [];
        const isAllFilials = selectedFilialId === "all";

        if (isAllFilials) {
          // Todas as filiais: apenas as cidades com mais locações
          // (50 ou mais), cada uma como fatia própria — sem "Outras".
          const MIN_COUNT = 50;
          let topCities = ranking.filter((item) => item.count >= MIN_COUNT);
          // Se nenhuma cidade alcançar o mínimo (ex.: anos antigos),
          // mostra as 5 maiores para o gráfico não ficar vazio.
          if (topCities.length === 0) {
            topCities = ranking.slice(0, 5);
          }
          setRankingData(
            topCities.map((item) => ({ name: item.city, value: item.count })),
          );
          return;
        }

        // Filial específica: cidades com menos de 3% dos agendamentos são
        // agrupadas em "Outras", com a composição no tooltip.
        const total = ranking.reduce((acc, item) => acc + item.count, 0);
        const MIN_SHARE = 0.03;

        const mainCities: {
          name: string;
          value: number;
          detail?: { label: string; value: number }[];
        }[] = [];
        const others: { label: string; value: number }[] = [];
        for (const item of ranking) {
          if (total > 0 && item.count / total < MIN_SHARE) {
            others.push({ label: item.city, value: item.count });
          } else {
            mainCities.push({ name: item.city, value: item.count });
          }
        }
        if (others.length > 0) {
          // O tooltip lista só as 10 maiores; o restante vira uma linha-resumo
          // (podem ser dezenas de cidades pequenas).
          const MAX_DETAIL = 10;
          const detail = others.slice(0, MAX_DETAIL);
          const remainder = others.slice(MAX_DETAIL);
          if (remainder.length > 0) {
            detail.push({
              label: `+ ${remainder.length} outras cidades`,
              value: remainder.reduce((acc, item) => acc + item.value, 0),
            });
          }
          mainCities.push({
            name: "Outras",
            value: others.reduce((acc, item) => acc + item.value, 0),
            detail,
          });
        }
        setRankingData(mainCities);
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
    <Card className="w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Ranking de cidades</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Distribuição de agendamentos por cidade</span>
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
          <div className="flex h-[320px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CustomPieChart
            data={ rankingData }
            dataKey="value"
            nameKey="name"
            height={ 320 }
            colors={ rankingData.map((item, index) =>
              item.name === "Outras"
                ? OTHERS_COLOR
                : FILIAL_COLOR_PALETTE[index % FILIAL_COLOR_PALETTE.length],
            ) }
            valueFormatter={ (value) =>
              `${value} ${value === 1 ? "agendamento" : "agendamentos"}`
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
