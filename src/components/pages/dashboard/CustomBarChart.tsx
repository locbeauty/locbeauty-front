import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid, Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

interface CustomBarChartProps {
    data: {
        name: string;
        value: number;
    }[]
    dataKey: string;
    nameKey: string;
    barSize?: number;
    fill?: string;
    height?: number;
    valueFormatter?: (_value: number) => string;
}

// Componente de gráfico de barras personalizado
export const CustomBarChart = ({
  data,
  dataKey,
  nameKey,
  barSize = 20,
  fill = "hsl(var(--primary))",
  height = 300,
  valueFormatter,
}: CustomBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={ height }>
      <RechartsBarChart data={ data } layout="vertical" margin={ { top: 10, right: 0, left: 50, bottom: 0 } }>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={ false } />
        <XAxis
          type="number"
          stroke="var(--muted-foreground)"
          fontSize={ 12 }
          tickLine={ false }
          axisLine={ false }
          tickFormatter={ (value) => (valueFormatter ? valueFormatter(value) : value) }
        />
        <YAxis
          type="category"
          dataKey={ nameKey }
          stroke="var(--muted-foreground)"
          fontSize={ 12 }
          tickLine={ false }
          axisLine={ false }
          tick={ {
            width: 140,
          } }
        />
        <RechartsTooltip
          content={ ({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{payload[0].payload[nameKey]}</span>
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
        <Bar dataKey={ dataKey } barSize={ barSize } fill={ fill } radius={ [ 0, 4, 4, 0 ] } />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
