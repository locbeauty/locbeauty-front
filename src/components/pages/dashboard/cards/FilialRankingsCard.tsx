import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { CustomBarChart } from "../CustomBarChart";
import { useEffect, useState } from "react";
import { getFilialBookingsRanking } from "@/services/dashboard.service";

interface FilialRankingsCardProps {
  selectedYear: string;
  availableYears: string[];
}

export function FilialRankingsCard({
  selectedYear: initialYear,
  availableYears,
}: FilialRankingsCardProps) {
  const [ rankingData, setRankingData ] = useState<
    { name: string; value: number }[]
  >([]);
  const [ localSelectedYear, setLocalSelectedYear ] =
    useState<string>(initialYear);
  const [ loading, setLoading ] = useState(false);

  // Sync with prop if needed, or just initialize.
  // For this card, lets allow independent year selection if that's the design pattern (like other cards seem to imply with CustomFilterSelect inside them)
  // However, the other cards in OverviewTab seem to take props.
  // Looking at the mockup code in OverviewTab, it has a CustomFilterSelect inside.
  // So it should probably manage its own state but initialize from prop.

  useEffect(() => {
    setLocalSelectedYear(initialYear);
  }, [ initialYear ]);

  useEffect(() => {
    async function fetchRanking() {
      if (!localSelectedYear) return;

      setLoading(true);
      try {
        const { ranking } = await getFilialBookingsRanking({
          year: Number(localSelectedYear),
        });

        const formattedData = ranking.map((item) => ({
          name: item.filialName,
          value: item.count,
        }));
        setRankingData(formattedData);
      } catch (error) {
        console.error("Failed to fetch filial ranking", error);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, [ localSelectedYear ]);

  return (
    <Card className="lg:col-span-3 w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Ranking de filiais</CardTitle>
        <CardDescription className="flex items-center justify-between">
          Número de locações por filial
          <CustomFilterSelect
            items={ availableYears }
            placeholder="Selecione o ano"
            triggerProps={ { className: "w-[150px]" } }
            value={ localSelectedYear }
            onValueChange={ setLocalSelectedYear }
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomBarChart
          data={ rankingData }
          dataKey="value"
          nameKey="name"
          height={ 400 }
          fill="#7f2b83"
          valueFormatter={ (value) => `${value} locações` }
        />
      </CardContent>
    </Card>
  );
}
