import { TopTraineesCard } from "@/components/pages/dashboard/cards/TopTraineesCard";
import { TopVolunteersCard } from "@/components/pages/dashboard/cards/TopVolunteersCard";
import { TopTrainingEquipmentsCard } from "@/components/pages/dashboard/cards/TopTrainingEquipmentsCard";

export function TrainingsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <TopTraineesCard />
      <TopVolunteersCard />
      <TopTrainingEquipmentsCard />
    </div>
  );
}
