import { CustomersTable } from "@/components/pages/customers/CustomersTable";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

const CustomerFilterStatusTypes = [
    "Ativo",
    "Inativo",
    "Inadimplente",
    "Bloqueado",
];

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie o cadastro de clientes
                    </p>
                </div>
                <Button asChild>
                    <Link href={ ROUTES.CREATE_CUSTOMER }>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar clientes..."
                        className="pl-8"
                    />
                </div>
                <CustomFilterSelect
                    items={ CustomerFilterStatusTypes }
                    placeholder="Status"
                    triggerProps={ {
                        className: "w-[180px]",
                        disabled: false,
                    } }
                />
            </div>

            <CustomersTable />
        </div>
    );
}
