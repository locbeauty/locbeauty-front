"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { employees } from "@/utils/mocks/employees";

type SelectEmployeeProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  selectedEmployeeName?: string
}

export function SelectEmployee<T extends FieldValues>({ control, name, selectedEmployeeName }: SelectEmployeeProps<T>) {
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
                        {
                            employees.map(employee => (
                                <SelectItem defaultValue={ selectedEmployeeName } key={ employee.id } value={ employee.name }>{employee.name}</SelectItem>

                            ))
                        }
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
