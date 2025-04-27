import { RegionalsTable } from "@/components/pages/regionals/RegionalsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function RegionalsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Regionais</h1>
                    <p className="text-muted-foreground">
                        Gerencie o cadastro de regionais
                    </p>
                </div>
                <Button className="flex justify-center items-center" asChild>
                    <Link href={ ROUTES.CREATE_REGIONAL }>
                        <Plus className="" />
                        <span className="hidden md:inline">Nova regional</span>
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar regionais..."
                        className="pl-8"
                    />
                </div>
            </div>

            <RegionalsTable />
        </div>
    );
}
