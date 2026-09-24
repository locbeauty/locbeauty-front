import { useState } from "react";
import { TopCustomersCard } from "@/components/pages/dashboard/cards/TopCustomersCard";
import { DefaultsCard } from "../cards/DefaultsCard";
import { InactiveClientsCard } from "../cards/InactiveClientsCard";
import { ActiveClientsCard } from "../cards/ActiveClientsCard";
import { CustomerStatusCard } from "../cards/CustomerStatusCard";
import { CustomerSegmentsCard } from "../cards/CustomerSegmentsCard";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

export function CustomersTab() {
  // Filtro geral: aplica a todos os cards da aba (cada um ainda pode refinar).
  const [ filialIds, setFilialIds ] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtro geral:</span>
        <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DefaultsCard filialIds={ filialIds } />
        </div>
        <div className="flex flex-col gap-4">
          <InactiveClientsCard filialIds={ filialIds } />
          <ActiveClientsCard filialIds={ filialIds } />
        </div>
      </div>
      <CustomerStatusCard filialIds={ filialIds } />
      <CustomerSegmentsCard filialIds={ filialIds } />
      <TopCustomersCard filialIds={ filialIds } />
    </div>
  );
}
