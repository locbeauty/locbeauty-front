import { TotalRevenueCard } from "../cards/TotalRevenueCard";
import { FilialRankingsCard } from "../cards/FilialRankingsCard";
import { CityRankingCard } from "../cards/CityRankingCard";
import { CityTrendsCard } from "../cards/CityTrendsCard";
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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <TotalRevenueCard
          selectedYear={ selectedYear }
          months={ MONTHS }
          availableYears={ availableYears }
        />
        <CityTrendsCard availableYears={ availableYears } />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
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
