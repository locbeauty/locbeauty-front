"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GearFilterSelect } from "@/components/pages/bookings/GearFilterSelect";
import { useAccessibleFilialIds } from "@/hooks/useAccessibleFilialIds";
import { getAvailableYears } from "@/services/dashboard.service";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { BookingsPerMachineCard } from "../cards/BookingsPerMachineCard";
import { TopEquipmentsCard } from "../cards/TopEquipmentsCard";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

export function EquipmentsTab() {
  // Filtros gerais: aplicam a todos os cards da aba (cada um ainda pode refinar).
  const [ filialIds, setFilialIds ] = useState<string[]>([]);
  const [ gearIds, setGearIds ] = useState<string[] | undefined>(undefined);
  const [ year, setYear ] = useState(new Date().getFullYear());
  const [ availableYears, setAvailableYears ] = useState<number[]>([]);

  const accessibleFilialIds = useAccessibleFilialIds(SYSTEM_MODULES.DASHBOARD);

  useEffect(() => {
    getAvailableYears()
      .then((years) => setAvailableYears(years.map(Number)))
      .catch((error) => console.error("Failed to fetch available years", error));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtro geral:</span>
        <Select value={ String(year) } onValueChange={ (v) => setYear(Number(v)) }>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={ y } value={ String(y) }>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
        <GearFilterSelect
          value={ gearIds }
          onSelect={ setGearIds }
          filialIds={ accessibleFilialIds }
        />
      </div>
      <div className="grid gap-4 grid-cols-1">
        <div>
          <BookingsPerMachineCard
            filialIds={ filialIds }
            gearIds={ gearIds }
            year={ year }
          />
        </div>
        <div>
          <BookingsPerMachineCard
            metric="revenue"
            filialIds={ filialIds }
            gearIds={ gearIds }
            year={ year }
          />
        </div>
        <div>
          <TopEquipmentsCard filialIds={ filialIds } year={ year } />
        </div>
      </div>
    </div>
  );
}
