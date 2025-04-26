import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StateSelect() {
    return (
        <Select>
            <SelectTrigger id="estado">
                <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ac">AC</SelectItem>
                <SelectItem value="al">AL</SelectItem>
                <SelectItem value="am">AM</SelectItem>
                <SelectItem value="ap">AP</SelectItem>
                <SelectItem value="ba">BA</SelectItem>
                <SelectItem value="ce">CE</SelectItem>
                <SelectItem value="df">DF</SelectItem>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="go">GO</SelectItem>
                <SelectItem value="ma">MA</SelectItem>
                <SelectItem value="mg">MG</SelectItem>
                <SelectItem value="ms">MS</SelectItem>
                <SelectItem value="mt">MT</SelectItem>
                <SelectItem value="pa">PA</SelectItem>
                <SelectItem value="pb">PB</SelectItem>
                <SelectItem value="pe">PE</SelectItem>
                <SelectItem value="pi">PI</SelectItem>
                <SelectItem value="pr">PR</SelectItem>
                <SelectItem value="rj">RJ</SelectItem>
                <SelectItem value="rn">RN</SelectItem>
                <SelectItem value="ro">RO</SelectItem>
                <SelectItem value="rr">RR</SelectItem>
                <SelectItem value="rs">RS</SelectItem>
                <SelectItem value="sc">SC</SelectItem>
                <SelectItem value="se">SE</SelectItem>
                <SelectItem value="sp">SP</SelectItem>
                <SelectItem value="to">TO</SelectItem>
            </SelectContent>
        </Select>
    );

}