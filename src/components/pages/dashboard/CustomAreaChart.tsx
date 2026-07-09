import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface ReceitaData {
  date: string;
  Receita: number;
}
interface OcupacaoData {
  date: string;
  TaxaDeOcupacao: number;
}

export interface ChartSeries {
  dataKey: string;
  label: string;
  stroke: string;
  fill: string;
}

interface CustomAreaChartProps {
  data:
    | ReceitaData[]
    | OcupacaoData[]
    | { date: string; total: number }[]
    | Record<string, string | number>[];
  dataKey: string;
  stroke?: string;
  fill?: string;
  height?: number;
  valueFormatter?: (_value: number) => string;
  /** Formatação dos ticks do eixo Y (default: valueFormatter). */
  yTickFormatter?: (_value: number) => string;
  /** Permite ticks decimais no eixo Y (default do Recharts: true). */
  yAllowDecimals?: boolean;
  /** Largura reservada para os ticks do eixo Y (default do Recharts: 60). */
  yAxisWidth?: number;
  /** Quando informado, renderiza uma Area por item (comparação de múltiplas séries) com legenda inferior. Ignora dataKey/stroke/fill. */
  series?: ChartSeries[];
}

// Atualizar o componente AreaChart para usar Recharts
export const CustomAreaChart = ({
  data,
  dataKey,
  // Cores em hex: var()/hsl(var()) não são resolvidos em atributos SVG.
  stroke = "#7f2b83",
  fill = "#7f2b83",
  height = 300,
  valueFormatter,
  yTickFormatter,
  yAllowDecimals,
  yAxisWidth,
  series,
}: CustomAreaChartProps) => {
  const isMultiSeries = !!series && series.length > 0;

  return (
    <ResponsiveContainer width="100%" height={ height } className="p-0">
      <RechartsAreaChart
        data={ data }
        margin={ { top: 0, right: 0, left: 0, bottom: isMultiSeries ? 8 : 0 } }
      >
        <XAxis
          dataKey="date"
          stroke="var(--muted-foreground)"
          fontSize={ 12 }
          tickLine={ false }
          axisLine={ false }
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={ 12 }
          tickLine={ false }
          axisLine={ false }
          width={ yAxisWidth }
          allowDecimals={ yAllowDecimals }
          tickFormatter={ (value) => {
            const formatter = yTickFormatter ?? valueFormatter;
            return formatter ? formatter(value) : value;
          } }
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <RechartsTooltip
          content={ ({ active, payload }) => {
            if (active && payload && payload.length) {
              if (isMultiSeries) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[160px]">
                    <span className="text-xs text-muted-foreground">
                      {payload[0].payload.date}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {payload.map((entry) => (
                        <div
                          key={ entry.dataKey }
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={ { backgroundColor: entry.color } }
                            />
                            {entry.name}
                          </span>
                          <span className="font-bold">
                            {valueFormatter
                              ? valueFormatter(Number(entry.value ?? 0))
                              : entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {payload[0].payload.date}
                      </span>
                      <span className="font-bold text-sm">
                        {valueFormatter
                          ? valueFormatter(Number(payload[0].value ?? 0))
                          : payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          } }
        />
        {isMultiSeries
          ? [
            ...series!.map((s) => (
              <Area
                key={ s.dataKey }
                type="monotone"
                dataKey={ s.dataKey }
                name={ s.label }
                stroke={ s.stroke }
                strokeWidth={ 2 }
                fill="none"
              />
            )),
            <RechartsLegend
              key="legend"
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={ { fontSize: 12, paddingTop: 8 } }
            />,
          ]
          : (
            <Area
              type="monotone"
              dataKey={ dataKey }
              stroke={ stroke }
              strokeWidth={ 2 }
              fill="none"
            />
          )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
