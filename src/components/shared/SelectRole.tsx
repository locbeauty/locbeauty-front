"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ROLE } from "@/utils/roles";
import { useEffect, useState } from "react";

type SelectRoleProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
}

export function SelectRole<T extends FieldValues>({ control, name }: SelectRoleProps<T>) {
    const [ allRoles, setAllRoles ] = useState<ROLE[]>([]);

    useEffect(() => {
        const getEmployees = async () => {
            const response = await fetch("http://localhost:3333/api/roles", { credentials: "include" });
            const { data } = await response.json();
            console.log("DATA: ", data);
            setAllRoles(data);
        };
        getEmployees();
    }, []);
    return (
        <Controller
            name={ name }
            control={ control }
            render={ ({ field }) => {
                return (
                    <Select onValueChange={ field.onChange } value={ field.value }>
                        <SelectTrigger className="w-full md:w-[270px] data-[placeholder]:text-placeholder">
                            <SelectValue
                                placeholder="Selecione a função do funcionário"
                                className="text-placeholder"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            { allRoles.map((role) => {
                                return (
                                    <SelectItem key={ role.roleId } value={ role.roleId }>
                                        { role.roleName }
                                    </SelectItem>
                                );

                            }) }
                        </SelectContent>
                    </Select>
                );
            }
            }
        />
    );

}

