import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

interface SelectCalendarViewTypeProps {
    viewType: "dia" | "semana" | "mes"
    setViewType: Dispatch<SetStateAction<"semana" | "dia" | "mes">>
}

export function SelectCalendarViewType({ setViewType, viewType }: SelectCalendarViewTypeProps) {
    return (
        <Select value={ viewType } onValueChange={ (value) => setViewType(value as "dia" | "semana" | "mes") }>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="dia">Dia</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
            </SelectContent>
        </Select>
    );
}