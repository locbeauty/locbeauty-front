import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function EquipamentosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
                    <p className="text-muted-foreground">Gerencie o cadastro de equipamentos</p>
                </div>
                <Button asChild>
                    <Link href={ROUTES.CREATE_GEAR}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Equipamento
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar equipamentos..." className="pl-8" />
                </div>
                <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Porte" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pequeno">Pequeno</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Descrição</th>
                            <th className="text-left p-3 font-medium">Peso</th>
                            <th className="text-left p-3 font-medium">Altura</th>
                            <th className="text-left p-3 font-medium">Porte</th>
                            <th className="text-left p-3 font-medium">Região</th>
                            <th className="text-left p-3 font-medium">Quantidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Escavadeira Hidráulica</td>
                            <td className="p-3">20 ton</td>
                            <td className="p-3">3.5 m</td>
                            <td className="p-3">Grande</td>
                            <td className="p-3">Sudeste</td>
                            <td className="p-3">5</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Compressor de Ar</td>
                            <td className="p-3">150 kg</td>
                            <td className="p-3">0.8 m</td>
                            <td className="p-3">Médio</td>
                            <td className="p-3">Sul</td>
                            <td className="p-3">12</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Furadeira Industrial</td>
                            <td className="p-3">5 kg</td>
                            <td className="p-3">0.3 m</td>
                            <td className="p-3">Pequeno</td>
                            <td className="p-3">Nordeste</td>
                            <td className="p-3">25</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

