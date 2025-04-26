import { EmployeesTable } from "@/components/pages/employees/EmployeesTable";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

const EmployeeFilterStatusTypes = [
    "Todas",
    "Norte",
    "Nordeste",
    "Centro-Oeste",
    "Sudeste",
    "Sul",
];

export default function EmployeesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
                    <p className="text-muted-foreground">
                        Gerencie o cadastro de funcionários
                    </p>
                </div>
                <Button asChild>
                    <Link href={ ROUTES.CREATE_EMPLOYEE }>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Funcionário
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar funcionários..."
                        className="pl-8"
                    />
                </div>
                <CustomFilterSelect
                    items={ EmployeeFilterStatusTypes }
                    placeholder="Status"
                    triggerProps={ {
                        className: "w-[180px]",
                        disabled: false,
                    } }
                />
            </div>

            <EmployeesTable />
        </div>
    );
}
