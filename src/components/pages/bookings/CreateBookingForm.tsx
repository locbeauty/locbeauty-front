import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateBookingForm() {
    return (
        <form id="new-booking-form">

            <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select>
                    <SelectTrigger id="cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="empresa-abc">Empresa ABC Ltda</SelectItem>
                        <SelectItem value="maria">Maria Oliveira</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="equipamento">Equipamento</Label>
                <Select>
                    <SelectTrigger id="equipamento">
                        <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="escavadeira">Escavadeira Hidráulica</SelectItem>
                        <SelectItem value="compressor">Compressor de Ar</SelectItem>
                        <SelectItem value="furadeira">Furadeira Industrial</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input id="quantidade" type="number" min="1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data de Início</Label>
                    <Input id="data-inicio" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="data-fim">Data de Fim</Label>
                    <Input id="data-fim" type="date" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="pendente">
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input id="observacoes" />
            </div>

        </form>
    );
}