import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";

interface CustomPieChartProps {
    data: {
        name: string;
        value: number;
    }[];
    dataKey: string;
    nameKey: string;
    colors?: string[];
    height?: number;
    valueFormatter?: (_value: number) => string;
}

// Componente de gráfico de pizza personalizado
export const CustomPieChart = ({ data, dataKey, nameKey, colors, height = 300, valueFormatter }: CustomPieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={ height }>
      <RechartsPieChart margin={ { top: 10, right: 30, left: 0, bottom: 0 } }>
        <Pie
          data={ data }
          cx="50%"
          cy="50%"
          innerRadius={ 60 }
          outerRadius={ 80 }
          paddingAngle={ 5 }
          dataKey={ dataKey }
          nameKey={ nameKey }
          label={ ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` }
          labelLine={ false }
        >
          {data.map((entry, index) => (
            <Cell key={ `cell-${index}` } fill={ colors ? colors[index % colors.length] : "hsl(var(--primary))" } />
          ))}
        </Pie>
        <Legend align="center" />
        <RechartsTooltip
          content={ ({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{payload[0].name}</span>
                    <span className="font-bold text-sm">
                      {/* {valueFormatter ? valueFormatter(payload[0].value) : payload[0].value} */}
                      {valueFormatter
                        ? valueFormatter(Number(payload[0].value ?? 0))
                        : payload[0].value}

                    </span>
                  </div>
                </div>
              );
            }
            return null;
          } }
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};