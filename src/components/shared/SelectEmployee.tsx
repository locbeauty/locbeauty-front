"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";
import { Employee } from "@/utils/@types/employee";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllEmployees } from "@/services/employees.service";
import { ROLES } from "@/utils/@types/roles";

type SelectEmployeeProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  employeeRole?: ROLES;
  filialId?: string;
  setDriverString?: Dispatch<SetStateAction<string>>;
};

export function SelectEmployee<T extends FieldValues>({
  control,
  name,
  employeeRole,
  filialId,
  setDriverString,
}: SelectEmployeeProps<T>) {
  const { data } = useQuery<
    ApiResponse<{ items: Employee[]; total: number } | Employee[]>,
    Error
  >({
    queryKey: [ "get-all-employees", { employeeRole, filialId } ],
    queryFn: () => GetAllEmployees({ employeeRole, filialId, limit: 100 }),
    staleTime: 1000 * 60, // 1 minuto de cache
    // cacheTime: 1000 * 60 * 5, // mantém cache 5 minutos
  });

  const responseData = data?.data;
  const allEmployees =
    responseData && "items" in responseData
      ? responseData.items
      : (responseData as Employee[]);

  return (
    <Controller
      name={ name }
      control={ control }
      render={ ({ field }) => (
        <Select
          onValueChange={ (value) => {
            field.onChange(value);
            const driverStr = allEmployees?.find(
              (emplyee) => emplyee.employeeId === value
            );
            if (driverStr && setDriverString) {
              const addressString = `${driverStr.fullname} - ${driverStr.documentNumber}`;
              setDriverString(addressString);
            }
          } }
          value={ field.value }
          defaultValue={ field.value }
        >
          <SelectTrigger
            id="employee"
            className="data-[placeholder]:text-placeholder w-full"
          >
            <SelectValue placeholder="Selecione o funcionário" />
          </SelectTrigger>
          <SelectContent>
            {allEmployees?.map((employee) => (
              <SelectItem
                // defaultValue={ selectedEmployee?.fullname }
                key={ employee.employeeId }
                value={ employee.employeeId }
              >
                {employee.fullname} - {employee.documentNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) }
    />
  );
}
