import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, DollarSignIcon, Users } from "lucide-react";
import { CustomAreaChart } from "../CustomAreaChart";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { CustomBarChart } from "../CustomBarChart";

export function OverviewTab() {
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

    const FilialsData = [
        { name: "Ceará", value: 1423 },
        { name: "Pernambuco", value: 952 },
        { name: "Bahia", value: 687 },
        { name: "Rio de Janeiro", value: 532 },
        { name: "Pará", value: 408 },
        { name: "Piauí", value: 408 },
        { name: "Espírito Santo", value: 408 },
        { name: "Rio Grande do Norte", value: 408 },
    ];

    const CidadesData = [
        { name: "Vitória de Santo Antão", value: 1423 },
        { name: "Recife", value: 952 },
        { name: "Xique-Xique", value: 687 },
        { name: "Fortaleza", value: 532 },
        { name: "João Pessoa", value: 408 },
        { name: "Bangu", value: 408 },
        { name: "Santo André", value: 408 },
        { name: "Natal", value: 408 },
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
                        <p className="mt-1 text-sm text-muted-foreground"><span className="text-destructive">-7,3%</span> em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Número de inadimplências</CardTitle>
                        <DollarSignIcon className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="mt-1 text-sm text-muted-foreground"><span className="text-destructive">+10%</span> em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.248</div>
                        <p className="text-sm text-muted-foreground mt-1"><span className="text-green-500">+12%</span> em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card className="w-[89vw] md:w-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes inativos</CardTitle>
                        <Users className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">40</div>
                        <p className="text-sm text-muted-foreground mt-1"><span className="text-green-500">-12%</span> em relação ao mês anterior</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pl-0 ml-0">
                <Card className="lg:col-span-3 md:w-auto w-[89vw] pl-0 ml-0 h-fit">
                    <CardHeader>
                        <CardTitle>Número de agendamentos/mês</CardTitle>
                        <CardDescription className="flex items-center justify-between p-0">Equipamentos alugados mês a mês
                            <CustomFilterSelect
                                items={ [ "2020", "2021", "2022", "2023", "2024", "2025" ].reverse() }
                                placeholder="Selecione o ano"
                                triggerProps={ { className: "w-[150px]" } }
                            />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 ml-0">
                        <CustomAreaChart
                            data={ ocupacaoData }
                            dataKey="TaxaDeOcupacao"
                            height={ 150 }
                            stroke="#7f2b83"
                            fill="#7f2b83"
                            valueFormatter={ (value) => `${value}` }
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-4 w-[89vw] md:w-auto h-fit">
                    <CardHeader>
                        <CardTitle>Receita Total por Período</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                            Visualização mensal da receita gerada
                            <CustomFilterSelect
                                items={ [ "2020", "2021", "2022", "2023", "2024", "2025" ].reverse() }
                                placeholder="Selecione o ano"
                                triggerProps={ { className: "w-[150px]" } }
                            />
                        </CardDescription>

                    </CardHeader>
                    <CardContent>
                        <CustomAreaChart
                            data={ receitaData }
                            dataKey="Receita"
                            height={ 150 }
                            stroke="#7f2b83"
                            fill="#7f2b83"
                            valueFormatter={ (value) => `R$ ${value.toLocaleString()}` }
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3 w-[89vw] md:w-auto">
                    <CardHeader>
                        <CardTitle>Ranking de filiais</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                            Número de locações por filial
                            <CustomFilterSelect
                                items={ [ "2020", "2021", "2022", "2023", "2024", "2025" ].reverse() }
                                placeholder="Selecione o ano"
                                triggerProps={ { className: "w-[150px]" } }
                            />
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart
                            data={ FilialsData }
                            dataKey="value"
                            nameKey="name"
                            height={ 400 }
                            fill="#7f2b83"
                            valueFormatter={ (value) => `${value} locações` }
                        />

                    </CardContent>
                </Card>
                <Card className="lg:col-span-4 w-[89vw] md:w-auto">
                    <CardHeader>
                        <CardTitle>Ranking de cidades</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                            Cidades com mais agendamentos
                            <CustomFilterSelect
                                items={ [ "2020", "2021", "2022", "2023", "2024", "2025" ].reverse() }
                                placeholder="Selecione o ano"
                                triggerProps={ { className: "w-[150px]" } }
                            />
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart
                            data={ CidadesData }
                            dataKey="value"
                            nameKey="name"
                            height={ 400 }
                            fill="#7f2b83"
                            valueFormatter={ (value) => `${value} locações` }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );

}