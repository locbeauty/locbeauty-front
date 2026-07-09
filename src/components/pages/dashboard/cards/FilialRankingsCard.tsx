import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { CustomPieChart } from "../CustomPieChart";
import { useEffect, useState } from "react";
import { getFilialBookingsRanking } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import {
  buildFilialColorMap,
  FILIAL_COLOR_PALETTE,
  OTHERS_COLOR,
} from "@/utils/filial-colors";

interface FilialRankingsCardProps {
  selectedYear: string;
  availableYears: string[];
}

export function FilialRankingsCard({
  selectedYear: initialYear,
  availableYears,
}: FilialRankingsCardProps) {
  const [ rankingData, setRankingData ] = useState<
    {
      name: string;
      value: number;
      detail?: { label: string; value: number }[];
    }[]
  >([]);
  const [ localSelectedYear, setLocalSelectedYear ] =
    useState<string>(initialYear);
  const [ loading, setLoading ] = useState(false);
  // Cor fixa por filial, compartilhada com o gráfico de Receita Total.
  const [ filialColors, setFilialColors ] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    async function fetchFilialColors() {
      try {
        const { data } = await apiRequest<
          { filialId: string; filialName: string }[]
        >({
          endpoint: "filials",
          method: "GET",
        });
        if (data) {
          setFilialColors(
            buildFilialColorMap(data.map((filial) => filial.filialName)),
          );
        }
      } catch (error) {
        console.error("Failed to fetch filials for colors", error);
      }
    }
    fetchFilialColors();
  }, []);

  // Sync with prop if needed, or just initialize.
  // For this card, lets allow independent year selection if that's the design pattern (like other cards seem to imply with CustomFilterSelect inside them)
  // However, the other cards in OverviewTab seem to take props.
  // Looking at the mockup code in OverviewTab, it has a CustomFilterSelect inside.
  // So it should probably manage its own state but initialize from prop.

  useEffect(() => {
    setLocalSelectedYear(initialYear);
  }, [ initialYear ]);

  useEffect(() => {
    async function fetchRanking() {
      if (!localSelectedYear) return;

      setLoading(true);
      try {
        const { ranking } = await getFilialBookingsRanking({
          year: Number(localSelectedYear),
        });

        // Filiais com menos de 3% das locações são agrupadas em "Outras";
        // a composição fica no `detail`, exibido no tooltip da fatia.
        const total = ranking.reduce((acc, item) => acc + item.count, 0);
        const MIN_SHARE = 0.03;

        const mainFilials: {
          name: string;
          value: number;
          detail?: { label: string; value: number }[];
        }[] = [];
        const others: { label: string; value: number }[] = [];
        for (const item of ranking) {
          if (total > 0 && item.count / total < MIN_SHARE) {
            others.push({ label: item.filialName, value: item.count });
          } else {
            mainFilials.push({ name: item.filialName, value: item.count });
          }
        }
        if (others.length > 0) {
          mainFilials.push({
            name: "Outras",
            value: others.reduce((acc, item) => acc + item.value, 0),
            detail: others,
          });
        }
        setRankingData(mainFilials);
      } catch (error) {
        console.error("Failed to fetch filial ranking", error);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, [ localSelectedYear ]);

  return (
    <Card className="w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Ranking de filiais</CardTitle>
        <CardDescription className="flex items-center justify-between">
          Distribuição de locações por filial
          <CustomFilterSelect
            items={ availableYears }
            placeholder="Selecione o ano"
            triggerProps={ { className: "w-[150px]" } }
            value={ localSelectedYear }
            onValueChange={ setLocalSelectedYear }
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <span className="text-muted-foreground text-sm">Carregando...</span>
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
                : (filialColors[item.name] ??
                  FILIAL_COLOR_PALETTE[index % FILIAL_COLOR_PALETTE.length]),
            ) }
            valueFormatter={ (value) =>
              `${value} ${value === 1 ? "locação" : "locações"}`
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
