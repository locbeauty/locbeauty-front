import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface LineSeriesConfig {
  key: string;
  name: string;
  color: string;
}

interface CustomMultiLineChartProps {
  data: Record<string, string | number>[];
  series: LineSeriesConfig[];
  xDataKey: string;
  height?: number;
  valueFormatter?: (_value: number) => string;
}

export const CustomMultiLineChart = ({
  data,
  series,
  xDataKey,
  height = 300,
  valueFormatter,
}: CustomMultiLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={ height }>
      <LineChart data={ data } margin={ { top: 5, right: 20, left: 0, bottom: 5 } }>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey={ xDataKey }
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
        <RechartsTooltip
          content={ ({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[140px]">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  {payload.map((entry) => (
                    <div
                      key={ String(entry.dataKey) }
                      className="flex items-center gap-1"
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={ { backgroundColor: entry.color } }
                      />
                      <span className="text-xs">{entry.name}:</span>
                      <span className="text-xs font-bold">
                        {valueFormatter
                          ? valueFormatter(Number(entry.value))
                          : entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          } }
        />
        <Legend
          wrapperStyle={ { fontSize: "12px", paddingTop: "8px" } }
        />
        {series.map((s) => (
          <Line
            key={ s.key }
            type="monotone"
            dataKey={ s.key }
            name={ s.name }
            stroke={ s.color }
            strokeWidth={ 2 }
            dot={ { r: 3, fill: s.color } }
            activeDot={ { r: 5 } }
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
