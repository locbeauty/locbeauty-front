import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RentedGear } from "@/utils/@types/customer";

interface RentedGearsBadgesProps {
  gears?: RentedGear[];
  className?: string;
}

/**
 * Máquinas com locação em andamento (Pendente, Em Andamento ou Entregue), com
 * a quantidade de agendamentos de cada.
 */
export function RentedGearsBadges({ gears, className }: RentedGearsBadgesProps) {
  if (!gears || gears.length === 0) {
    return <span className="text-muted-foreground">--</span>;
  }

  return (
    <div className={ cn("flex flex-wrap gap-1", className) }>
      {gears.map((gear) => (
        <Badge
          key={ gear.gearName }
          variant="secondary"
          className="font-normal whitespace-nowrap"
          title={ `${gear.rentals} ${gear.rentals === 1 ? "locação" : "locações"} em andamento` }
        >
          {gear.gearName}
          <span className="text-muted-foreground ml-1">{gear.rentals}x</span>
        </Badge>
      ))}
    </div>
  );
}
