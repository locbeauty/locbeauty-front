import { useState } from "react";
import { TopTraineesCard } from "@/components/pages/dashboard/cards/TopTraineesCard";
import { TopVolunteersCard } from "@/components/pages/dashboard/cards/TopVolunteersCard";
import { TopTrainingEquipmentsCard } from "@/components/pages/dashboard/cards/TopTrainingEquipmentsCard";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

export function TrainingsTab() {
  // Filtro geral: aplica a todos os cards da aba (cada um ainda pode refinar).
  const [ filialIds, setFilialIds ] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtro geral:</span>
        <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <TopTraineesCard filialIds={ filialIds } />
        <TopVolunteersCard filialIds={ filialIds } />
        <TopTrainingEquipmentsCard filialIds={ filialIds } />
      </div>
    </div>
  );
}
