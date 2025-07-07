"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { employees } from "@/utils/mocks/employees";
import { useEffect, useState } from "react";
import { Employee } from "@/utils/@types/employee";

type SelectEmployeeProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  managerEmployeeId?: string;
};

export function SelectEmployee<T extends FieldValues>({
    control,
    name,
    managerEmployeeId,
}: SelectEmployeeProps<T>) {
    const selectedEmployee = employees.find(
        (employee) => employee.employeeId === managerEmployeeId
    );
    const [ allEmployees, setAllEmployees ] = useState<Employee[]>([]);

    useEffect(() => {
        const getEmployees = async () => {
            const response = await fetch("http://localhost:3333/api/employees", {
                credentials: "include",
            });
            const { data } = await response.json();
            setAllEmployees(data);
        };
        getEmployees();
    }, []);

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
                    <SelectTrigger
                        id="employee"
                        className="data-[placeholder]:text-placeholder"
                    >
                        <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                        {allEmployees.map((employee) => (
                            <SelectItem
                                defaultValue={ selectedEmployee?.fullname }
                                key={ employee.employeeId }
                                value={ employee.fullname }
                            >
                                {employee.fullname}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
