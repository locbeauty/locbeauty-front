import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getYearlyRevenueMetric } from "@/services/dashboard.service";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomAreaChart, ChartSeries } from "../CustomAreaChart";
import {
  buildFilialColorMap,
  FILIAL_COLOR_PALETTE,
} from "@/utils/filial-colors";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TotalRevenueCardProps {
  selectedYear: string;
  months: string[];
  availableYears: string[];
}

const MAX_COMPARE_STATES = 5;

export function TotalRevenueCard({
  selectedYear,
  months,
  availableYears,
}: TotalRevenueCardProps) {
  const [ internalYear, setInternalYear ] = useState(selectedYear);
  const [ yearlyData, setYearlyData ] = useState<
    Record<string, string | number>[]
  >([]);
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialIds, setSelectedFilialIds ] = useState<string[]>([]);
  const [ filialPopoverOpen, setFilialPopoverOpen ] = useState(false);

  const [ loading, setLoading ] = useState(false);
  const [ totalRevenue, setTotalRevenue ] = useState<number>(0);

  // Sync internal year if prop changes
  useEffect(() => {
    if (selectedYear) {
      setInternalYear(selectedYear);
    }
  }, [ selectedYear ]);

  // Fetch Filials on mount
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

  // Cor fixa por filial, compartilhada com o Ranking de filiais — a mesma
  // filial tem sempre a mesma cor em todos os gráficos do dashboard.
  const filialColors = buildFilialColorMap(
    filials.map((filial) => filial.filialName),
  );

  // Fetch Metrics when year or selected states change
  useEffect(() => {
    async function fetchMetrics() {
      if (!internalYear) {
        setYearlyData([]);
        return;
      }

      setLoading(true);
      try {
        if (selectedFilialIds.length === 0) {
          const { revenueData } = await getYearlyRevenueMetric({
            year: Number(internalYear),
          });

          let total = 0;
          const formattedData = months.map((month, index) => {
            const found = revenueData.find((item) => item.month === index + 1);
            total += found?.total ?? 0;
            return {
              date: month.substring(0, 3),
              total: (found?.total ?? 0) / 100,
            };
          });
          setYearlyData(formattedData);
          setTotalRevenue(total);
        } else {
          const results = await Promise.all(
            selectedFilialIds.map((filialId) =>
              getYearlyRevenueMetric({
                year: Number(internalYear),
                filialId,
              })
            )
          );

          const merged = months.map((month, index) => {
            const point: Record<string, string | number> = {
              date: month.substring(0, 3),
            };
            selectedFilialIds.forEach((filialId, filialIndex) => {
              const found = results[filialIndex].revenueData.find(
                (item) => item.month === index + 1
              );
              point[filialId] = (found?.total ?? 0) / 100;
            });
            return point;
          });
          setYearlyData(merged);
          setTotalRevenue(0);
        }
      } catch (error) {
        console.error("Failed to fetch revenue metric", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [ internalYear, months, selectedFilialIds ]);

  function toggleFilial(filialId: string) {
    setSelectedFilialIds((prev) => {
      if (prev.includes(filialId)) {
        return prev.filter((id) => id !== filialId);
      }

      if (prev.length >= MAX_COMPARE_STATES) {
        toast.warning(
          `Você pode comparar até ${MAX_COMPARE_STATES} estados por vez.`
        );
        return prev;
      }

      return [ ...prev, filialId ];
    });
  }

  function clearFilialSelection() {
    setSelectedFilialIds([]);
  }

  const selectedFilials = filials.filter((filial) =>
    selectedFilialIds.includes(filial.filialId)
  );
  const series: ChartSeries[] = selectedFilials.map((filial) => {
    const color =
      filialColors[filial.filialName] ?? FILIAL_COLOR_PALETTE[0];
    return {
      dataKey: filial.filialId,
      label: filial.filialName,
      stroke: color,
      fill: color,
    };
  });

  const triggerLabel =
    selectedFilialIds.length === 0
      ? "Todas as filiais"
      : selectedFilialIds.length === 1
        ? selectedFilials[0]?.filialName
        : `${selectedFilialIds.length} estados`;

  return (
    <Card className="relative h-fit">
      <CardHeader>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <CardTitle>Receita Total</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Popover
              modal={ true }
              open={ filialPopoverOpen }
              onOpenChange={ setFilialPopoverOpen }
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={ filialPopoverOpen }
                  className="w-[180px] h-8 justify-between font-normal"
                >
                  <span className="truncate">{triggerLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar estado..." />
                  <CommandList>
                    <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={ clearFilialSelection }
                        className="cursor-pointer"
                      >
                        <Check
                          className={ cn(
                            "mr-2 h-4 w-4",
                            selectedFilialIds.length === 0
                              ? "opacity-100"
                              : "opacity-0"
                          ) }
                        />
                        Todas as filiais
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup>
                      {filials.map((filial) => {
                        const isSelected = selectedFilialIds.includes(
                          filial.filialId
                        );
                        const isDisabled =
                          !isSelected &&
                          selectedFilialIds.length >= MAX_COMPARE_STATES;
                        const color = isSelected
                          ? filialColors[filial.filialName]
                          : undefined;

                        return (
                          <CommandItem
                            key={ filial.filialId }
                            value={ filial.filialName }
                            disabled={ isDisabled }
                            onSelect={ () => toggleFilial(filial.filialId) }
                            className="cursor-pointer"
                          >
                            <Check
                              className={ cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              ) }
                            />
                            <span
                              className="mr-2 h-2 w-2 shrink-0 rounded-full border border-black/10"
                              style={ { backgroundColor: color ?? "transparent" } }
                            />
                            {filial.filialName}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                  {selectedFilialIds.length}/{MAX_COMPARE_STATES} selecionados
                  para comparação
                </div>
              </PopoverContent>
            </Popover>

            <Select value={ internalYear } onValueChange={ setInternalYear }>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={ year } value={ year }>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0 ml-0">
        <CustomAreaChart
          data={ yearlyData }
          dataKey="total"
          height={ 200 }
          stroke="#9B72CF"
          fill="#9B72CF"
          variant="line"
          series={ series.length > 0 ? series : undefined }
          valueFormatter={ (value) =>
            value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }
          // Ticks compactos ("R$ 250 mil") para não cortar no eixo Y;
          // o tooltip mantém o valor completo via valueFormatter.
          yTickFormatter={ (value) =>
            value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              notation: "compact",
              maximumFractionDigits: 0,
            })
          }
          yAxisWidth={ 72 }
        />
      </CardContent>
    </Card>
  );
}
