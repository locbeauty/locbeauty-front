import { GearsTable } from "@/components/pages/gears/GearsTable";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

const GearFilterStatusTypes = ["Todos", "Pequeno", "Médio", "Grande"];

export default function GearsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
                    <p className="text-muted-foreground">
                        Gerencie o cadastro de equipamentos
                    </p>
                </div>
                <Button asChild>
                    <Link href={ ROUTES.CREATE_GEAR }>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Equipamento
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar equipamentos..."
                        className="pl-8"
                    />
                </div>
                <CustomFilterSelect
                    items={ GearFilterStatusTypes }
                    placeholder="Status"
                    triggerProps={ {
                        className: "w-[180px]",
                        disabled: false,
                    } }
                />
            </div>

            <GearsTable />
        </div>
    );
}
