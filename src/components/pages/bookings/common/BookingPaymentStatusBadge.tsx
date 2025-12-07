import { cn } from "@/lib/utils";
import { Badge } from "../../../ui/badge";

interface BookingPaymentStatusBadgeProps {
  status: "Pendente" | "Parcial" | "Pago" | null | undefined;
  shrink?: boolean;
}

export function BookingPaymentStatusBadge({
    status,
    shrink = false,
}: BookingPaymentStatusBadgeProps) {

    const parsedStatus = status ?? "Pendente";
    const variants = {
        Pendente:
      "border-1 border-red-800 bg-red-100 text-red-800 hover:bg-red-200",
        Parcial:
      "border-1 border-yellow-800 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        Pago: "border-1 border-green-800 bg-green-100 text-green-800 hover:bg-green-200",
    };

    return (
        <Badge
            className={ cn(
                variants[parsedStatus],
                shrink ? "whitespace-normal" : "whitespace-nowrap"
            ) }
            variant="secondary"
        >
            {parsedStatus !== "Pago" && <span className="hidden md:inline">Pagamento </span>}
            {parsedStatus}
        </Badge>

    );
}
