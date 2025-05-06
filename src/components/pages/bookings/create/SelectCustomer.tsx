import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SelectCustomer() {
    return (
        <Select>
            <SelectTrigger id="customer" className="data-[placeholder]:text-placeholder">
                <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="joao">João Silva</SelectItem>
                <SelectItem value="empresa-abc">Empresa ABC Ltda</SelectItem>
                <SelectItem value="maria">Maria Oliveira</SelectItem>
            </SelectContent>
        </Select>
    );
}