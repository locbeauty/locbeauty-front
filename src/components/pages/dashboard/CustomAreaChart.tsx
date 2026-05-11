import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
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

interface CustomAreaChartProps {
  data: ReceitaData[] | OcupacaoData[] | { date: string; total: number }[];
  dataKey: string;
  stroke?: string;
  fill?: string;
  height?: number;
  valueFormatter?: (_value: number) => string;
}

// Atualizar o componente AreaChart para usar Recharts
export const CustomAreaChart = ({
  data,
  dataKey,
  stroke = "hsl(var(--primary))",
  fill = "#7f2b83",
  height = 300,
  valueFormatter,
}: CustomAreaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={ height } className="p-0">
      <RechartsAreaChart
        data={ data }
        margin={ { top: 0, right: 0, left: 0, bottom: 0 } }
      >
        <defs>
          <linearGradient id={ `color-${dataKey}` } x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%" stopColor={ fill } stopOpacity={ 0.3 } />
            <stop offset="99%" stopColor={ fill } stopOpacity={ 0.1 } />
          </linearGradient>
        </defs>
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
          tickFormatter={ (value) =>
            valueFormatter ? valueFormatter(value) : value
          }
        />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <RechartsTooltip
          content={ ({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {payload[0].payload.date}
                      </span>
                      <span className="font-bold text-sm">
                        {/* {valueFormatter ? valueFormatter(payload[0].value) : payload[0].value} */}
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
        <Area
          type="monotone"
          dataKey={ dataKey }
          stroke={ stroke }
          strokeWidth={ 2 }
          fillOpacity={ 0.08 }
          fill={ `url(#color-${dataKey})` }
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
