import { cn } from "@/lib/utils";
import { Badge } from "../../../ui/badge";
import { CheckoutStatuses } from "@/utils/constants";

interface BookingStatusBadgeProps {
  status: CheckoutStatuses;
  shrink?: boolean;
}

export function BookingStatusBadge({
    status,
    shrink = false,
}: BookingStatusBadgeProps) {
    const variants = {
        Pendente:
      "border-1 border-gray-800 bg-gray-100 text-gray-800 hover:bg-gray-200",
        Concluido:
      "border-1 border-green-800 bg-green-100 text-green-800 hover:bg-green-200",
        Cancelado:
      "border-1 border-red-800 bg-red-100 text-red-800 hover:bg-red-200",
    };

    return (
        <Badge
            className={ cn(
                variants[status],
                shrink
                    ? "whitespace-normal w-auto py-1 text-center"
                    : "whitespace-nowrap"
            ) }
            variant="secondary"
        >
            <span className="hidden md:inline">Pagamento </span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
