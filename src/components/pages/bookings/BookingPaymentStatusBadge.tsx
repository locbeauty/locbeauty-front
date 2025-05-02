import { cn } from "@/lib/utils";
import { Badge } from "../../ui/badge";

interface BookingPaymentStatusBadgeProps {
    status: "Não pago" | "Pagamento parcial" | "Pago";
    shrink?: boolean
  }

export function BookingPaymentStatusBadge({ status, shrink = false }: BookingPaymentStatusBadgeProps) {
    const variants = {
        "Não pago": "border-1 border-red-800 bg-red-100 text-red-800 hover:bg-red-200",
        "Pagamento parcial": "border-1 border-yellow-800 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        "Pago": "border-1 border-green-800 bg-green-100 text-green-800 hover:bg-green-200",
    };

    return (
        <Badge className={ cn(variants[status], shrink ? "whitespace-normal" : "whitespace-nowrap") } variant="secondary">

            { status }
        </Badge>
    );
}
