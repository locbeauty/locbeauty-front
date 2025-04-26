import { Badge } from "../ui/badge";

export function BookingStatusBadge({
    status,
}: {
  status: "pendente" | "confirmado" | "concluído" | "cancelado";
}) {
    const variants = {
        pendente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        confirmado: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        concluído: "bg-green-100 text-green-800 hover:bg-green-200",
        cancelado: "bg-red-100 text-red-800 hover:bg-red-200",
    };

    return (
        <Badge className={variants[status]} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
