import { useEffect, useState } from "react";
import { getAvailableYears } from "@/services/dashboard.service";
import { NewClientsCard } from "../cards/NewClientsCard";
import { AverageTicketCard } from "../cards/AverageTicketCard";
import { ClientsAtRiskCard } from "../cards/ClientsAtRiskCard";
import { CustomerStatusCard } from "../cards/CustomerStatusCard";
import { TopNeighborhoodsCard } from "../cards/TopNeighborhoodsCard";

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

export function InsightsTab() {
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
        setAvailableYears([ String(new Date().getFullYear()) ]);
      }
    }
    fetchYears();
  }, [ selectedYear ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <ClientsAtRiskCard />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <CustomerStatusCard />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <NewClientsCard
          selectedYear={ selectedYear }
          availableYears={ availableYears }
          months={ MONTHS }
        />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <AverageTicketCard
          selectedYear={ selectedYear }
          availableYears={ availableYears }
          months={ MONTHS }
        />
      </div>
      <div className="col-span-1 md:col-span-4 lg:col-span-4">
        <TopNeighborhoodsCard
          selectedYear={ selectedYear }
          availableYears={ availableYears }
        />
      </div>
    </div>
  );
}
