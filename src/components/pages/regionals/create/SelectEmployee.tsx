"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type SelectEmployeeProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
}

export function SelectEmployee<T extends FieldValues>({ control, name }: SelectEmployeeProps<T>) {
    return (
        <Controller
            name={ name }
            control={ control }
            render={ ({ field }) => (
                <Select
                    onValueChange={ field.onChange }
                    value={ field.value }
                    defaultValue={ field.value }
                >
                    <SelectTrigger id="employee" className="data-[placeholder]:text-placeholder">
                        <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="empresa-abc">Empresa ABC Ltda</SelectItem>
                        <SelectItem value="maria">Maria Oliveira</SelectItem>
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
