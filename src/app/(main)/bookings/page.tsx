import { BookingStatusBadge } from "@/components/shared/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function AgendamentosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
                    <p className="text-muted-foreground">Gerencie os agendamentos de locações de equipamentos</p>
                </div>
                <Button asChild>
                    <Link href={ROUTES.CREATE_BOOKING}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Agendamento
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar agendamentos..." className="pl-8" />
                </div>
                <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Cliente</th>
                            <th className="text-left p-3 font-medium">Equipamento</th>
                            <th className="text-left p-3 font-medium">Quantidade</th>
                            <th className="text-left p-3 font-medium">Data Início</th>
                            <th className="text-left p-3 font-medium">Data Fim</th>
                            <th className="text-left p-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">Escavadeira Hidráulica</td>
                            <td className="p-3">1</td>
                            <td className="p-3">15/05/2023</td>
                            <td className="p-3">20/05/2023</td>
                            <td className="p-3">
                                <BookingStatusBadge status="confirmado" />
                            </td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Empresa ABC Ltda</td>
                            <td className="p-3">Compressor de Ar</td>
                            <td className="p-3">3</td>
                            <td className="p-3">10/06/2023</td>
                            <td className="p-3">25/06/2023</td>
                            <td className="p-3">
                                <BookingStatusBadge status="pendente" />
                            </td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Maria Oliveira</td>
                            <td className="p-3">Furadeira Industrial</td>
                            <td className="p-3">5</td>
                            <td className="p-3">01/04/2023</td>
                            <td className="p-3">15/04/2023</td>
                            <td className="p-3">
                                <BookingStatusBadge status="concluído" />
                            </td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Maria Oliveira</td>
                            <td className="p-3">Furadeira Industrial</td>
                            <td className="p-3">5</td>
                            <td className="p-3">01/04/2023</td>
                            <td className="p-3">15/04/2023</td>
                            <td className="p-3">
                                <BookingStatusBadge status="cancelado" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

