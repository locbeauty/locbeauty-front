import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/routes";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function FuncionariosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
                    <p className="text-muted-foreground">Gerencie o cadastro de funcionários</p>
                </div>
                <Button asChild>
                    <Link href={ROUTES.CREATE_EMPLOYEE}>
                        <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar funcionários..." className="pl-8" />
                </div>
                <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Regional" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="nordeste">Nordeste</SelectItem>
                        <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                        <SelectItem value="sudeste">Sudeste</SelectItem>
                        <SelectItem value="sul">Sul</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-left p-3 font-medium">CPF</th>
                            <th className="text-left p-3 font-medium">Cargo</th>
                            <th className="text-left p-3 font-medium">Regional</th>
                            <th className="text-left p-3 font-medium">Telefone</th>
                            <th className="text-left p-3 font-medium">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Roberto Silva</td>
                            <td className="p-3">123.456.789-00</td>
                            <td className="p-3">Gerente</td>
                            <td className="p-3">Sudeste</td>
                            <td className="p-3">(11) 98765-4321</td>
                            <td className="p-3">roberto@empresa.com</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Fernanda Santos</td>
                            <td className="p-3">987.654.321-00</td>
                            <td className="p-3">Analista</td>
                            <td className="p-3">Sul</td>
                            <td className="p-3">(51) 98765-4321</td>
                            <td className="p-3">fernanda@empresa.com</td>
                        </tr>
                        <tr className="border-t hover:bg-muted/50">
                            <td className="p-3">Marcos Oliveira</td>
                            <td className="p-3">456.789.123-00</td>
                            <td className="p-3">Técnico</td>
                            <td className="p-3">Nordeste</td>
                            <td className="p-3">(81) 98765-4321</td>
                            <td className="p-3">marcos@empresa.com</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

