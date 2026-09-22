import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAvailableYears,
  getYearlyBookingsPerMachineMetric,
} from "@/services/dashboard.service";
import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { CustomAreaChart } from "../CustomAreaChart";
import { useDashboardFilialFilter } from "@/hooks/useDashboardFilialFilter";

interface Filial {
  filialId: string;
  filialName: string;
}

interface Gear {
  gearId: string;
  gearName: string;
  sourceFilialId?: string;
  filialId?: string;
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
  "Jan",
];

const formatCurrency = (
  value: number,
  options?: Intl.NumberFormatOptions,
) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    ...options,
  });

interface BookingsPerMachineCardProps {
  /** "count": nº de agendamentos por mês. "revenue": faturamento recebido. */
  metric?: "count" | "revenue";
}

export function BookingsPerMachineCard({
  metric = "count",
}: BookingsPerMachineCardProps) {
  const isRevenue = metric === "revenue";
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ gears, setGears ] = useState<Gear[]>([]);

  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("");
  const [ selectedGearId, setSelectedGearId ] = useState<string>("");

  const [ selectedYear, setSelectedYear ] = useState<number>(
    new Date().getFullYear(),
  );
  const [ availableYears, setAvailableYears ] = useState<number[]>([]);

  const [ yearlyData, setYearlyData ] = useState<
    { date: string; total: number }[]
  >([]);
  const [ loading, setLoading ] = useState(false);

  // Só oferece as filiais liberadas no Controle de Acessos.
  const onlyAccessible = useDashboardFilialFilter();

  // Fetch Filials and Available Years on mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [ filialsData, yearsData ] = await Promise.all([
          apiRequest<Filial[]>({
            endpoint: "filials",
            method: "GET",
          }),
          getAvailableYears(),
        ]);

        if (filialsData.data) {
          const visibleFilials = onlyAccessible(filialsData.data);

          setFilials(visibleFilials);
          if (visibleFilials.length > 0) {
            setSelectedFilialId(visibleFilials[0].filialId);
          }
        }

        setAvailableYears(yearsData.map(Number));
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    }
    fetchFilterOptions();
  }, [ onlyAccessible ]);

  // Fetch Gears when Filial changes
  useEffect(() => {
    async function fetchGears() {
      if (!selectedFilialId) {
        setGears([]);
        return;
      }
      try {
        const { data } = await apiRequest<Gear[]>({
          endpoint: "gears",
          method: "GET",
        });

        if (data) {
          const filialGears = data.filter(
            (g) =>
              g.sourceFilialId === selectedFilialId ||
              g.filialId === selectedFilialId,
          );
          setGears(
            filialGears.map((g) => ({
              gearId: g.gearId,
              gearName: g.gearName,
            })),
          );
          setYearlyData([]);

          if (filialGears.length > 0) {
            setSelectedGearId("all");
          } else {
            setSelectedGearId("");
          }
        }
      } catch (error) {
        console.error("Failed to fetch gears", error);
      }
    }
    fetchGears();
  }, [ selectedFilialId ]);

  // Fetch Metrics when inputs change
  useEffect(() => {
    async function fetchMetrics() {
      if (!selectedFilialId || !selectedYear || !selectedGearId) {
        setYearlyData([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch yearly data
        const { yearlyData: data } = await getYearlyBookingsPerMachineMetric({
          gearId: selectedGearId === "all" ? undefined : selectedGearId,
          filialId: selectedGearId === "all" ? selectedFilialId : undefined,
          year: Number(selectedYear),
        });

        const formattedData = data.map((item) => ({
          date: ABBR_MONTHS[item.month - 1],
          total: isRevenue ? item.revenue / 100 : item.count,
        }));
        setYearlyData(formattedData);
      } catch (error) {
        console.error("Failed to fetch metric", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [ selectedGearId, selectedYear, selectedFilialId, isRevenue ]);

  const yearTotal = yearlyData.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="col-span-1 md:col-span-2 relative h-fit">
      <CardHeader>
        <CardTitle>
          {isRevenue ? "Faturamento por Máquina" : "Agendamentos por Máquina"}
        </CardTitle>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          {isRevenue
            ? "Valor recebido por mês, rateado pelo preço da máquina"
            : "Histórico anual de locações"}
          <div className="flex gap-2 flex-wrap">
            <Select
              value={ String(selectedYear) }
              onValueChange={ (value) => setSelectedYear(Number(value)) }
            >
              <SelectTrigger className="w-[100px]">
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

            <Select
              value={ selectedFilialId }
              onValueChange={ setSelectedFilialId }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filial" />
              </SelectTrigger>
              <SelectContent>
                {filials.map((filial) => (
                  <SelectItem key={ filial.filialId } value={ filial.filialId }>
                    {filial.filialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={ selectedGearId }
              onValueChange={ setSelectedGearId }
              disabled={ !selectedFilialId }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {gears.map((gear) => (
                  <SelectItem key={ gear.gearId } value={ gear.gearId }>
                    {gear.gearName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0 ml-0">
        <p className="px-6 pb-2 text-sm text-muted-foreground">
          Total no ano:{" "}
          <span className="font-bold text-foreground">
            {isRevenue ? formatCurrency(yearTotal) : yearTotal}
          </span>
        </p>
        <CustomAreaChart
          data={ yearlyData.length > 0 ? yearlyData : [] }
          dataKey="total"
          height={ 150 }
          stroke="#7f2b83"
          fill="#7f2b83"
          valueFormatter={ (value) =>
            isRevenue ? formatCurrency(value) : `${value}`
          }
          // Ticks compactos ("R$ 25 mil") para não cortar no eixo Y;
          // o tooltip mantém o valor completo.
          { ...(isRevenue && {
            yTickFormatter: (value: number) =>
              formatCurrency(value, {
                notation: "compact",
                maximumFractionDigits: 0,
              }),
            yAxisWidth: 72,
          }) }
        />
      </CardContent>
    </Card>
  );
}
