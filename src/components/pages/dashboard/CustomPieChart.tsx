import React from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

export const CHART_COLORS = [ "#4472C4", "#9B72CF", "#ED7D31", "#FFC000" ];

// Fatias abaixo deste percentual não recebem rótulo radial (evita
// sobreposição de textos entre fatias finas vizinhas); elas aparecem na
// legenda compacta abaixo do gráfico.
const MIN_LABEL_PERCENT = 0.05;

interface CustomPieChartProps {
  data: {
    name: string;
    value: number;
    /** Composição da fatia (ex.: filiais agrupadas em "Outras"), exibida no tooltip. */
    detail?: { label: string; value: number }[];
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
  fill?: string;
}

function PieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
  fill,
}: LabelProps): React.ReactElement | null {
  // Fatias finas ficam sem rótulo radial; são descritas na legenda inferior.
  if (percent < MIN_LABEL_PERCENT) return null;

  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);

  // Linha guia da borda da fatia até perto do texto.
  const sx = cx + (outerRadius + 2) * cos;
  const sy = cy + (outerRadius + 2) * sin;
  const ex = cx + (outerRadius + 22) * cos;
  const ey = cy + (outerRadius + 22) * sin;

  const radius = outerRadius + 28;
  const x = cx + radius * cos;
  const y = cy + radius * sin;
  const anchor = x > cx ? "start" : "end";

  return (
    <g>
      <polyline
        points={ `${sx},${sy} ${ex},${ey}` }
        stroke={ fill ?? "#9CA3AF" }
        fill="none"
        strokeWidth={ 1 }
      />
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
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // Fatias sem rótulo radial (abaixo do mínimo) vão para a legenda inferior.
  const smallSlices = data
    .map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
      percent: total > 0 ? item.value / total : 0,
    }))
    .filter((item) => item.percent < MIN_LABEL_PERCENT);

  const legendHeight = smallSlices.length > 0 ? 28 : 0;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={ height - legendHeight }>
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
            labelLine={ false }
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
                const detail = payload[0].payload?.detail as
                  | { label: string; value: number }[]
                  | undefined;

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
                      {detail && detail.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5 border-t pt-1">
                          {detail.map((item) => (
                            <span
                              key={ item.label }
                              className="text-xs text-muted-foreground"
                            >
                              {item.label} —{" "}
                              {valueFormatter
                                ? valueFormatter(item.value)
                                : item.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            } }
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      {smallSlices.length > 0 && (
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
          style={ { minHeight: legendHeight } }
        >
          {smallSlices.map((item) => (
            <span
              key={ item.name }
              className="group relative flex cursor-default items-center gap-1"
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={ { backgroundColor: item.color } }
              />
              {item.name}{" "}
              {item.percent * 100 < 1
                ? "(<1%)"
                : `(${Math.round(item.percent * 100)}%)`}
              {/* Tooltip com o valor (e composição) ao passar o mouse na legenda */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 flex-col whitespace-nowrap rounded-lg border bg-background p-2 text-left shadow-sm group-hover:flex">
                <span className="text-xs text-muted-foreground">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {valueFormatter ? valueFormatter(item.value) : item.value}
                </span>
                {item.detail && item.detail.length > 0 && (
                  <span className="mt-1 flex flex-col gap-0.5 border-t pt-1">
                    {item.detail.map((detailItem) => (
                      <span
                        key={ detailItem.label }
                        className="text-xs text-muted-foreground"
                      >
                        {detailItem.label} —{" "}
                        {valueFormatter
                          ? valueFormatter(detailItem.value)
                          : detailItem.value}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
