import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function CreateEmployeeForm() {
    return (
        <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" placeholder="Nome completo" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Select>
                        <SelectTrigger id="cargo">
                            <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="analista">Analista</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="assistente">Assistente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="regional">Regional</Label>
                    <Select>
                        <SelectTrigger id="regional">
                            <SelectValue placeholder="Selecione a regional" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="norte">Norte</SelectItem>
                            <SelectItem value="nordeste">Nordeste</SelectItem>
                            <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                            <SelectItem value="sudeste">Sudeste</SelectItem>
                            <SelectItem value="sul">Sul</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="exemple@exemple.com" />
                </div>
            </div>
        </CardContent>
    );
}