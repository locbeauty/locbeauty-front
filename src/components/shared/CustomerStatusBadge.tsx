import { Badge } from "../ui/badge";

interface CustomerStatusBadgeProps {
    status: "ativo" | "inativo" | "inadimplente" | "bloqueado";
  }

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
    const variants = {
        ativo: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
        inativo: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
        inadimplente: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
        bloqueado: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
    };

    return (
        <Badge className={ variants[status] } variant="secondary">
            { status.charAt(0).toUpperCase() + status.slice(1) }
        </Badge>
    );
}
