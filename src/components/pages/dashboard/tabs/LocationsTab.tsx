"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MapPin, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAvailableYears,
  getCityGrowthMetric,
} from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Filial {
  filialId: string;
  filialName: string;
}

interface CityMetric {
  city: string;
  totalBookings: number;
  growthRate: number;
  trend: "up" | "down" | "neutral";
}

export function LocationsTab() {
  const [ metrics, setMetrics ] = useState<CityMetric[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ selectedYear, setSelectedYear ] = useState<number>(
    new Date().getFullYear(),
  );
  const [ availableYears, setAvailableYears ] = useState<number[]>([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");

  // Fetch filters on mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [ yearsData, filialsData ] = await Promise.all([
          getAvailableYears(),
          apiRequest<Filial[]>({
            endpoint: "filials",
            method: "GET",
          }),
        ]);

        setAvailableYears(yearsData.map(Number));
        if (filialsData.data) {
          setFilials(filialsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    }

    fetchFilterOptions();
  }, []);

  // Fetch metrics when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getCityGrowthMetric({
          year: selectedYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });

        setMetrics(result.metrics);
      } catch (error) {
        console.error("Failed to fetch city growth metrics", error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedYear) {
      fetchData();
    }
  }, [ selectedYear, selectedFilialId ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={ String(selectedYear) }
          onValueChange={ (value) => setSelectedYear(Number(value)) }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={ year } value={ String(year) }>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as filiais</SelectItem>
            {filials.map((fil) => (
              <SelectItem key={ fil.filialId } value={ fil.filialId }>
                {fil.filialName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
            <CardDescription>Locações por região</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Mapa de distribuição geográfica</p>
                <p className="text-xs">(Em desenvolvimento)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-[89vw] md:w-auto">
          <CardHeader>
            <CardTitle>Crescimento por Cidade</CardTitle>
            <CardDescription>Comparativo de crescimento anual</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-80 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Locações</TableHead>
                    <TableHead>Crescimento</TableHead>
                    <TableHead>Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.length > 0 ? (
                    metrics.map((metric) => (
                      <TableRow key={ metric.city }>
                        <TableCell className="font-medium">
                          {metric.city}
                        </TableCell>
                        <TableCell>{metric.totalBookings}</TableCell>
                        <TableCell
                          className={ cn({
                            "text-green-500": metric.growthRate > 0,
                            "text-red-500": metric.growthRate < 0,
                            "text-muted-foreground": metric.growthRate === 0,
                          }) }
                        >
                          {metric.growthRate > 0 ? "+" : ""}
                          {metric.growthRate}%
                        </TableCell>
                        <TableCell>
                          {metric.trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {metric.trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {metric.trend === "neutral" && (
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={ 4 } className="text-center h-24">
                        Nenhum dado encontrado para o período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
