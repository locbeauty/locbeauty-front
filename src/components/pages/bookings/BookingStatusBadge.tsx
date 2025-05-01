import { Badge } from "../../ui/badge";

export function BookingStatusBadge({
    status,
}: {
  status: "Não iniciado" | "Concluído" | "Cancelado";
}) {
    const variants = {
        "Não iniciado": "bg-gray-100 text-gray-800 hover:bg-gray-200",
        Concluído: "bg-green-100 text-green-800 hover:bg-green-200",
        Cancelado: "bg-red-100 text-red-800 hover:bg-red-200",
    };

    return (
        <Badge className={ variants[status] } variant="secondary">
            { status.charAt(0).toUpperCase() + status.slice(1) }
        </Badge>
    );
}
