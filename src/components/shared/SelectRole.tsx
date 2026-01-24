"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ROLES } from "@/utils/roles";

type SelectRoleProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
}

export function SelectRole<T extends FieldValues>({ control, name }: SelectRoleProps<T>) {
  
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
              { ROLES.map((role) => {
                return (
                  <SelectItem key={ role } value={ role }>
                    { role }
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

