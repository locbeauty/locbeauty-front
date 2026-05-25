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
  const variants: Record<CheckoutStatuses, string> = {
    Pendente:
      "border-1 border-gray-800 bg-gray-100 text-gray-800 hover:bg-gray-200",
    Em_Andamento:
      "border-1 border-blue-800 bg-blue-100 text-blue-800 hover:bg-blue-200",
    Entregue:
      "border-1 border-orange-700 bg-orange-100 text-orange-800 hover:bg-orange-200",
    Concluido:
      "border-1 border-green-800 bg-green-100 text-green-800 hover:bg-green-200",
    Cancelado:
      "border-1 border-red-800 bg-red-100 text-red-800 hover:bg-red-200",
  };

  const labels: Record<CheckoutStatuses, string> = {
    Pendente: "Pendente",
    Em_Andamento: "Em Andamento",
    Entregue: "Entregue",
    Concluido: "Concluído",
    Cancelado: "Cancelado",
  };

  return (
    <Badge
      className={ cn(
        variants[status] ?? "border-1 border-gray-800 bg-gray-100 text-gray-800",
        shrink
          ? "whitespace-normal w-auto py-1 text-center"
          : "whitespace-nowrap"
      ) }
      variant="secondary"
    >
      {labels[status] ?? status}
    </Badge>
  );
}
