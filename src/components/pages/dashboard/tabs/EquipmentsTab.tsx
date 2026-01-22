"use client";

import { BookingsPerMachineCard } from "../cards/BookingsPerMachineCard";
import { TopEquipmentsCard } from "../cards/TopEquipmentsCard";

export function EquipmentsTab() {
  return (
    <div className="grid gap-4 grid-cols-1">
      <div>
        <BookingsPerMachineCard />
      </div>
      <div>
        <TopEquipmentsCard />
      </div>
    </div>
  );
}
