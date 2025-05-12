import { ResponsiveContainer } from "recharts";
import {
    Area,
    AreaChart as RechartsAreaChart, CartesianGrid, Tooltip as RechartsTooltip,
    XAxis,
    YAxis
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
    data: ReceitaData[] | OcupacaoData[];
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
        <ResponsiveContainer width="100%" height={ height }>
            <RechartsAreaChart data={ data } margin={ { top: 10, right: 30, left: 0, bottom: 0 } }>
                <defs>
                    <linearGradient id={ `color-${dataKey}` } x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ fill } stopOpacity={ 0.8 } />
                        <stop offset="95%" stopColor={ fill } stopOpacity={ 0 } />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={ 12 } tickLine={ false } axisLine={ false } />
                <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={ 12 }
                    tickLine={ false }
                    axisLine={ false }
                    tickFormatter={ (value) => (valueFormatter ? valueFormatter(value) : value) }
                />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <RechartsTooltip
                    content={ ({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">{payload[0].payload.date}</span>
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
                <Area type="monotone" dataKey={ dataKey } stroke={ stroke } fillOpacity={ 1 } fill={ `url(#color-${dataKey})` } />
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
};