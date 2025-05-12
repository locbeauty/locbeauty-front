import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { BarChart, DollarSign, Star, Users } from "lucide-react";
import { CustomAreaChart } from "../CustomAreaChart";
import { CustomBarChart } from "../CustomBarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function OverviewTab({ period }: {period: string}) {
    const receitaData = [
        { date: "Jan", Receita: 34500 },
        { date: "Fev", Receita: 42000 },
        { date: "Mar", Receita: 38600 },
        { date: "Abr", Receita: 45700 },
        { date: "Mai", Receita: 53200 },
        { date: "Jun", Receita: 49800 },
        { date: "Jul", Receita: 62100 },
        { date: "Ago", Receita: 58400 },
        { date: "Set", Receita: 71300 },
        { date: "Out", Receita: 68900 },
        { date: "Nov", Receita: 76500 },
        { date: "Dez", Receita: 82100 },
    ];

    const ocupacaoData = [
        { date: "Jan", TaxaDeOcupacao: 68 },
        { date: "Fev", TaxaDeOcupacao: 72 },
        { date: "Mar", TaxaDeOcupacao: 65 },
        { date: "Abr", TaxaDeOcupacao: 78 },
        { date: "Mai", TaxaDeOcupacao: 82 },
        { date: "Jun", TaxaDeOcupacao: 76 },
        { date: "Jul", TaxaDeOcupacao: 85 },
        { date: "Ago", TaxaDeOcupacao: 79 },
        { date: "Set", TaxaDeOcupacao: 88 },
        { date: "Out", TaxaDeOcupacao: 84 },
        { date: "Nov", TaxaDeOcupacao: 91 },
        { date: "Dez", TaxaDeOcupacao: 94 },
    ];

    const cidadesData = [
        { name: "São Paulo", value: 1423 },
        { name: "Rio de Janeiro", value: 952 },
        { name: "Belo Horizonte", value: 687 },
        { name: "Brasília", value: 532 },
        { name: "Curitiba", value: 408 },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="w-[89vw] md:w-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ 82.100,00</div>
                        <p className="text-xs text-muted-foreground">+7,3% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94%</div>
                        <div className="mt-2">
                            <Progress value={ 94 } className="h-2" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">+3% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.248</div>
                        <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card className="w-[89vw] md:w-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfação do Cliente</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.7/5.0</div>
                        <div className="mt-1 flex items-center">
                            {[ 1, 2, 3, 4, 5 ].map((star) => (
                                <Star
                                    key={ star }
                                    className={ `h-4 w-4 ${
                                        star <= 4 ? "fill-primary text-primary" : ""
                                    } ${star === 5 ? "fill-primary text-primary opacity-70" : ""}` }
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 w-[89vw] md:w-auto">
                    <CardHeader>
                        <CardTitle>Receita Total por Período</CardTitle>
                        <CardDescription>Visualização {period} da receita gerada</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomAreaChart
                            data={ receitaData }
                            dataKey="Receita"
                            height={ 300 }
                            stroke="#7f2b83"
                            fill="#7f2b83"
                            valueFormatter={ (value) => `R$ ${value.toLocaleString()}` }
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 md:w-auto w-[89vw]">
                    <CardHeader>
                        <CardTitle>Taxa de Ocupação</CardTitle>
                        <CardDescription>Equipamentos alugados ÷ total disponível</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomAreaChart
                            data={ ocupacaoData }
                            dataKey="TaxaDeOcupacao"
                            height={ 300 }
                            stroke="hsl(var(--success, 142 76% 36%))"
                            fill="#7f2b83"
                            valueFormatter={ (value) => `${value}%` }
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3 w-[89vw] md:w-auto">
                    <CardHeader>
                        <CardTitle>Cidades que Mais Consomem</CardTitle>
                        <CardDescription>Número de locações por cidade</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart
                            data={ cidadesData }
                            dataKey="value"
                            nameKey="name"
                            height={ 300 }
                            fill="hsl(var(--warning, 38 92% 50%))"
                            valueFormatter={ (value) => `${value} locações` }
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-4 md:w-auto w-[89vw]">
                    <CardHeader>
                        <CardTitle>Tempo Médio de Inatividade</CardTitle>
                        <CardDescription>Tempo médio em que os equipamentos ficam sem uso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo de Equipamento</TableHead>
                                    <TableHead>Tempo Médio</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Escavadeiras</TableCell>
                                    <TableCell>2.4 dias</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Ótimo</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Tratores</TableCell>
                                    <TableCell>3.2 dias</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Ótimo</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Compressores</TableCell>
                                    <TableCell>1.8 dias</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Ótimo</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Geradores</TableCell>
                                    <TableCell>4.5 dias</TableCell>
                                    <TableCell className="w-[300px]">
                                        <Badge className="bg-yellow-500">Regular</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Plataformas</TableCell>
                                    <TableCell>5.7 dias</TableCell>
                                    <TableCell>
                                        <Badge className="bg-yellow-500">Regular</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );

}