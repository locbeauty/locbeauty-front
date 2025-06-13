import { CUSTOMER_STATUSES } from "@/utils/@types/customers";
import { Badge } from "../ui/badge";

interface CustomerStatusBadgeProps {
    status: CUSTOMER_STATUSES
  }

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
    const variants = {
        ACTIVE: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
        INACTIVE: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
        DEFAULTING: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
        BLOCKED: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
    };

    return (
        <Badge className={ variants[status] } variant="secondary">
            { status.charAt(0).toUpperCase() + status.slice(1) }
        </Badge>
    );
}
