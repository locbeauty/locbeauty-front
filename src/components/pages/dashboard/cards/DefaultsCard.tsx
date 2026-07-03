"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSignIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDefaultsOverTime,
  getAvailableYears,
} from "@/services/dashboard.service";
import { CustomAreaChart } from "../CustomAreaChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";

interface Filial {
  filialId: string;
  filialName: string;
}

const ABBR_MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function DefaultsCard() {
  const [ data, setData ] = useState<{ date: string; total: number }[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ selectedYear, setSelectedYear ] = useState<number>(
    new Date().getFullYear(),
  );
  const [ availableYears, setAvailableYears ] = useState<number[]>([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");

  // Fetch available years and filials on mount
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

  // Fetch defaults data when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getDefaultsOverTime({
          year: selectedYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });

        // Transform data to include month names for chart
        const transformedData = result.data.map((item) => ({
          date: ABBR_MONTHS[item.month - 1],
          total: item.count,
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch defaults over time", error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedYear) {
      fetchData();
    }
  }, [ selectedYear, selectedFilialId ]);

  // Calculate total for the year
  const totalValue = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex gap-2 items-center">
            <DollarSignIcon className="h-4 w-4 text-destructive" />
            Inadimplências
          </CardTitle>
        </div>
        <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
          <Select
            value={ String(selectedYear) }
            onValueChange={ (value) => setSelectedYear(Number(value)) }
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
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
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue />
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
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[180px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-2">
              <div className="text-2xl font-bold">{totalValue}</div>
              <p className="text-xs text-muted-foreground">
                inadimplências em {selectedYear}
              </p>
            </div>
            {data.length > 0 ? (
              <CustomAreaChart
                data={ data }
                height={ 150 }
                dataKey="total"
                stroke="#dc2626"
                fill="#dc2626"
                valueFormatter={ (value) => `${value} inadimplências` }
                yTickFormatter={ (value) => String(value) }
                yAllowDecimals={ false }
              />
            ) : (
              <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
