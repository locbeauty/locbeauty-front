import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SelectGear() {
    return (
        <Select>
            <SelectTrigger id="equipamento" className="data-[placeholder]:text-gray-400">
                <SelectValue placeholder="Selecione o equipamento" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="escavadeira">Escavadeira Hidráulica</SelectItem>
                <SelectItem value="compressor">Compressor de Ar</SelectItem>
                <SelectItem value="furadeira">Furadeira Industrial</SelectItem>
            </SelectContent>
        </Select>
    );
}