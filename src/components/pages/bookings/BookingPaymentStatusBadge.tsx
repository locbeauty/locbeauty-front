import { Badge } from "../../ui/badge";

export function BookingPaymentStatusBadge({
    status,
}: {
  status: "Não pago" | "Pagamento parcial" | "Pago";
}) {
    const variants = {
        "Não pago": "bg-red-100 text-red-800 hover:bg-red-200",
        "Pagamento parcial": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        "Pago": "bg-green-100 text-green-800 hover:bg-green-200",
    };

    return (
        <Badge className={ variants[status] } variant="secondary">
            { status }
        </Badge>
    );
}
