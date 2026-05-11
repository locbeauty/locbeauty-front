import React from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

export const CHART_COLORS = ["#4472C4", "#9B72CF", "#ED7D31", "#FFC000"];

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

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
}

function PieLabel({ cx, cy, midAngle, outerRadius, name, percent }: LabelProps): React.ReactElement {
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const anchor = x > cx ? "start" : "end";

  return (
    <g>
      <text x={ x } y={ y - 6 } textAnchor={ anchor } fill="#374151" fontSize={ 11 } fontWeight="500">
        {name}
      </text>
      <text x={ x } y={ y + 8 } textAnchor={ anchor } fill="#6B7280" fontSize={ 11 }>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
}

export const CustomPieChart = ({
  data,
  dataKey,
  nameKey,
  colors = CHART_COLORS,
  height = 320,
  valueFormatter,
}: CustomPieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={ height }>
      <RechartsPieChart margin={ { top: 20, right: 60, left: 60, bottom: 20 } }>
        <Pie
          data={ data }
          cx="50%"
          cy="50%"
          innerRadius={ 0 }
          outerRadius={ 90 }
          paddingAngle={ 2 }
          dataKey={ dataKey }
          nameKey={ nameKey }
          label={ PieLabel }
          labelLine={ true }
        >
          {data.map((_entry, index) => (
            <Cell
              key={ `cell-${index}` }
              fill={ colors[index % colors.length] }
            />
          ))}
        </Pie>
        <RechartsTooltip
          content={ ({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {payload[0].name}
                    </span>
                    <span className="font-bold text-sm">
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