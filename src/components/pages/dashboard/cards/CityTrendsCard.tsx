"use client";

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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCityRankingMetric } from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import {
  CustomMultiLineChart,
  LineSeriesConfig,
} from "../CustomMultiLineChart";
import {
  FILIAL_COLOR_PALETTE,
  OTHERS_COLOR,
} from "@/utils/filial-colors";

interface Filial {
  filialId: string;
  filialName: string;
}

// Quantidade de cidades com mais locações exibidas como linhas próprias
// (modo filial específica).
const TOP_CITIES = 5;

// Todas as filiais: mínimo de locações no ano para a cidade aparecer em
// destaque no gráfico.
const MIN_ANNUAL_HIGHLIGHT = 80;

export function CityTrendsCard() {
  const [ chartData, setChartData ] = useState<
    Record<string, string | number>[]
  >([]);
  const [ series, setSeries ] = useState<LineSeriesConfig[]>([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ loading, setLoading ] = useState(false);

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
    async function fetchTrends() {
      setLoading(true);
      try {
        const isAllFilials = selectedFilialId === "all";
        const currentYear = new Date().getFullYear();
        const yearsToShow = Array.from({ length: 5 }, (_, i) =>
          String(currentYear - 4 + i),
        );

        const yearlyResults = await Promise.all(
          yearsToShow.map(async (year) => {
            const data = await getCityRankingMetric({
              year: Number(year),
              filialId: isAllFilials ? undefined : selectedFilialId,
            });
            return { year, data };
          }),
        );

        // Totais acumulados por cidade (para ordenar) — sempre derivado dos
        // dados atuais, sem lista fixa.
        const cityTotals: Record<string, number> = {};
        yearlyResults.forEach(({ data }) => {
          data.cityRanking?.forEach((c) => {
            cityTotals[c.city] = (cityTotals[c.city] || 0) + c.count;
          });
        });

        let topCities: string[];
        if (isAllFilials) {
          // Destaque: cidades que atingiram o mínimo anual em algum ano.
          const qualified = new Set<string>();
          yearlyResults.forEach(({ data }) => {
            data.cityRanking?.forEach((c) => {
              if (c.count >= MIN_ANNUAL_HIGHLIGHT) {
                qualified.add(c.city);
              }
            });
          });
          topCities = Array.from(qualified).sort(
            (a, b) => (cityTotals[b] ?? 0) - (cityTotals[a] ?? 0),
          );
          // Se nenhuma cidade alcançar o mínimo, mostra as 5 maiores.
          if (topCities.length === 0) {
            topCities = Object.entries(cityTotals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, TOP_CITIES)
              .map(([ city ]) => city);
          }
        } else {
          topCities = Object.entries(cityTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, TOP_CITIES)
            .map(([ city ]) => city);
        }

        const data = yearlyResults.map(({ year, data: yearData }) => {
          const record: Record<string, string | number> = { year };
          let yearTotal = 0;
          let topTotal = 0;
          yearData.cityRanking?.forEach((c) => {
            yearTotal += c.count;
          });
          topCities.forEach((city) => {
            const found = yearData.cityRanking?.find((c) => c.city === city);
            record[city] = found?.count ?? 0;
            topTotal += found?.count ?? 0;
          });
          // "Outras" (demais cidades da filial) só quando uma filial
          // específica está selecionada.
          if (!isAllFilials) {
            record["Outras"] = yearTotal - topTotal;
          }
          return record;
        });

        const seriesConfig: LineSeriesConfig[] = topCities.map((city, i) => ({
          key: city,
          name: city,
          color: FILIAL_COLOR_PALETTE[i % FILIAL_COLOR_PALETTE.length],
        }));
        if (!isAllFilials) {
          seriesConfig.push({
            key: "Outras",
            name: "Outras",
            color: OTHERS_COLOR,
          });
        }

        setChartData(data);
        setSeries(seriesConfig);
      } catch (error) {
        console.error("Failed to fetch city trends", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [ selectedFilialId ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência por Cidade</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {selectedFilialId === "all"
              ? `Cidades com ${MIN_ANNUAL_HIGHLIGHT}+ locações no ano (últimos 5 anos)`
              : "Cidades com mais locações nos últimos 5 anos"}
          </span>
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
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        {loading ? (
          <div className="flex h-[260px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum dado disponível
            </p>
          </div>
        ) : (
          <CustomMultiLineChart
            data={ chartData }
            series={ series }
            xDataKey="year"
            height={ 260 }
          />
        )}
      </CardContent>
    </Card>
  );
}
