
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateGearForm() {
    return (
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do equipamento</Label>
                <Textarea id="name" placeholder="Nome do equipamento" />
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva o equipamento" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="porte">Porte</Label>
                    <Select>
                        <SelectTrigger id="porte">
                            <SelectValue placeholder="Selecione o porte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pequeno">Pequeno</SelectItem>
                            <SelectItem value="medio">Médio</SelectItem>
                            <SelectItem value="grande">Grande</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="aquisicao">Data de aquisição</Label>
                    <Input id="aquisicao" type="date" className="w-auto" />
                </div>
            </div>
        </CardContent>
    );
}