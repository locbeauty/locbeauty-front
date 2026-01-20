import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSignIcon, Users } from "lucide-react";
import { CustomAreaChart } from "../CustomAreaChart";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { BookingsPerMachineCard } from "../cards/BookingsPerMachineCard";
import { TotalRevenueCard } from "../cards/TotalRevenueCard";
import { FilialRankingsCard } from "../cards/FilialRankingsCard";
import { DefaultsCard } from "../cards/DefaultsCard";
import { InactiveClientsCard } from "../cards/InactiveClientsCard";
import { ActiveClientsCard } from "../cards/ActiveClientsCard";
import { CityRankingCard } from "../cards/CityRankingCard";
// import { CustomBarChart } from "../CustomBarChart";
import { useEffect, useState } from "react";
import { getAvailableYears } from "@/services/dashboard.service";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function OverviewTab() {
  const currentMonthIndex = new Date().getMonth();
  const [ selectedMonth, setSelectedMonth ] = useState<string>(
    MONTHS[currentMonthIndex].toLowerCase(),
  );
  const [ selectedYear, setSelectedYear ] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [ availableYears, setAvailableYears ] = useState<string[]>([]);

  useEffect(() => {
    async function fetchYears() {
      try {
        const years = await getAvailableYears();
        const yearsString = years.map(String);
        setAvailableYears(yearsString);

        if (yearsString.length > 0 && !yearsString.includes(selectedYear)) {
          if (!yearsString.includes(String(new Date().getFullYear()))) {
            setSelectedYear(yearsString[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch available years", error);
        // Fallback to current year range or keep empty
        setAvailableYears([ String(new Date().getFullYear()) ]);
      }
    }
    fetchYears();
  }, [ selectedYear ]);

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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalRevenueCard
          selectedYear={ selectedYear }
          months={ MONTHS }
          availableYears={ availableYears }
        />
        <BookingsPerMachineCard
          selectedMonth={ selectedMonth }
          selectedYear={ selectedYear }
          months={ MONTHS }
        />
        <DefaultsCard
          month={ selectedMonth }
          year={ selectedYear }
          months={ MONTHS }
        />
        <InactiveClientsCard />
        <ActiveClientsCard />
      </div>
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pl-0 ml-0"> */}
      {/* <Card className="lg:col-span-3 md:w-auto w-[89vw] pl-0 ml-0 h-fit">
          <CardHeader>
            <CardTitle>Número de agendamentos/mês</CardTitle>
            <CardDescription className="flex items-center justify-between p-0">
              Equipamentos alugados mês a mês
              <CustomFilterSelect
                items={ [
                  "2020",
                  "2021",
                  "2022",
                  "2023",
                  "2024",
                  "2025",
                  "2026",
                ].reverse() }
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
                items={ [
                  "2020",
                  "2021",
                  "2022",
                  "2023",
                  "2024",
                  "2025",
                  "2026",
                ].reverse() }
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
        </Card> */}
      {/* </div> */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <FilialRankingsCard
          selectedYear={ selectedYear }
          availableYears={ availableYears }
        />
        <CityRankingCard
          selectedYear={ selectedYear }
          availableYears={ availableYears }
        />
      </div>
    </>
  );
}
