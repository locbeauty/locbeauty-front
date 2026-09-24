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
import { useEffect, useState } from "react";
import { CustomAreaChart } from "../CustomAreaChart";
import { DashboardFilialSelect } from "../DashboardFilialSelect";
import { GearFilterSelect } from "@/components/pages/bookings/GearFilterSelect";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { SYSTEM_MODULES } from "@/utils/@types/access";

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
  /** Filtros gerais da aba: o card começa (e é reposto) por eles e pode refinar. */
  filialIds: string[];
  gearIds?: string[];
  year: number;
}

export function BookingsPerMachineCard({
  metric = "count",
  filialIds: generalFilialIds,
  gearIds: generalGearIds,
  year: generalYear,
}: BookingsPerMachineCardProps) {
  const isRevenue = metric === "revenue";

  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  const [ gearIds, setGearIds ] = useState(generalGearIds);
  const [ selectedYear, setSelectedYear ] = useState(generalYear);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);
  useEffect(() => setGearIds(generalGearIds), [ generalGearIds ]);
  useEffect(() => setSelectedYear(generalYear), [ generalYear ]);

  const [ availableYears, setAvailableYears ] = useState<number[]>([]);

  const [ yearlyData, setYearlyData ] = useState<
    { date: string; total: number }[]
  >([]);
  const [ loading, setLoading ] = useState(false);

  // Máquinas das filiais que o usuário pode ver. A máquina é escolhida por
  // nome (todos os gearIds dela); o recorte por filial fica no backend.
  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.DASHBOARD);

  useEffect(() => {
    getAvailableYears()
      .then((years) => setAvailableYears(years.map(Number)))
      .catch((error) => console.error("Failed to fetch available years", error));
  }, []);

  // Fetch Metrics when inputs change
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const { yearlyData: data } = await getYearlyBookingsPerMachineMetric({
          gearIds,
          filialIds,
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
  }, [ gearIds, selectedYear, filialIds, isRevenue ]);

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

            <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />

            <GearFilterSelect
              value={ gearIds }
              onSelect={ setGearIds }
              filialIds={ accessibleFilialIds }
            />
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
