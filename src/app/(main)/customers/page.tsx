import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function ClientesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">Gerencie o cadastro de clientes</p>
                </div>
                <Button asChild>
                    <Link href={ROUTES.CREATE_CUSTOMER}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar clientes..." className="pl-8" />
                </div>
                <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
                <table className="min-w-[800px] w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-left p-3 font-medium">CPF/CNPJ</th>
                            <th className="text-left p-3 font-medium">Tipo</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Telefone</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Último Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="bloqueado" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="inadimplente" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="inativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">PF</td>
                            <td className="p-3">joao@email.com</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">
                                <StatusBadge status="ativo" />
                            </td>
                            <td className="p-3">10/03/2023</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}

