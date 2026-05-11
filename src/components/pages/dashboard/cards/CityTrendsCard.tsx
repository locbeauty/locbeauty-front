"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCityRankingMetric } from "@/services/dashboard.service";
import {
  CustomMultiLineChart,
  LineSeriesConfig,
} from "../CustomMultiLineChart";
import { CHART_COLORS } from "../CustomPieChart";

export function CityTrendsCard() {
  const [ chartData, setChartData ] = useState<
    Record<string, string | number>[]
  >([]);
  const [ series, setSeries ] = useState<LineSeriesConfig[]>([]);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const yearsToShow = Array.from({ length: 5 }, (_, i) =>
          String(currentYear - 4 + i),
        );

        const yearlyResults = await Promise.all(
          yearsToShow.map(async (year) => {
            const data = await getCityRankingMetric({
              year: Number(year),
              limit: 4,
            });
            return { year, data };
          }),
        );

        const cityTotals: Record<string, number> = {};
        yearlyResults.forEach(({ data }) => {
          data.cityRanking?.forEach((c) => {
            cityTotals[c.city] = (cityTotals[c.city] || 0) + c.count;
          });
        });

        const topCities = Object.entries(cityTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([ city ]) => city);

        const data = yearlyResults.map(({ year, data: yearData }) => {
          const record: Record<string, string | number> = { year };
          topCities.forEach((city) => {
            const found = yearData.cityRanking?.find((c) => c.city === city);
            record[city] = found?.count ?? 0;
          });
          return record;
        });

        const seriesConfig: LineSeriesConfig[] = topCities.map((city, i) => ({
          key: city,
          name: city,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }));

        setChartData(data);
        setSeries(seriesConfig);
      } catch (error) {
        console.error("Failed to fetch city trends", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência por Cidade</CardTitle>
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
