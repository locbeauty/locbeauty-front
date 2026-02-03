"use client";

import {
  Controller,
  Control,
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { Employee } from "@/utils/@types/employee";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllEmployees } from "@/services/employees.service";
import { ROLES } from "@/utils/@types/roles";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { hideDocumentNumber } from "@/utils/hideDocumentNumber";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectEmployeeProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  employeeRole?: ROLES;
  filialId?: string;
  setDriverString?: Dispatch<SetStateAction<string>>;
  onEmployeeSelect?: (employee: Employee) => void;
  currentUserId?: string; // Include this user in results regardless of filters
  currentUser?: Employee | null;
  modal?: boolean;
  excludeRoles?: string[];
};

export function SelectEmployee<T extends FieldValues>({
  control,
  name,
  employeeRole,
  filialId,
  setDriverString,
  onEmployeeSelect,
  currentUser,
  modal = false,
  excludeRoles,
}: SelectEmployeeProps<T>) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data } = useQuery<
    ApiResponse<{ items: Employee[]; total: number } | Employee[]>,
    Error
  >({
    queryKey: [ "get-all-employees", { employeeRole, filialId } ], // No search term here for now as we do client-side filtering
    queryFn: () => GetAllEmployees({ employeeRole, filialId, limit: 1000 }), // Increased limit to ensure we get all for client-side filtering
    staleTime: 1000 * 60,
  });

  const responseData = data?.data;
  const fetchedEmployees =
    responseData && "items" in responseData
      ? responseData.items
      : (responseData as Employee[]) || [];

  // Ensure currentUser is in the list if provided
  const allEmployees =
    currentUser &&
    !fetchedEmployees.some((emp) => emp.employeeId === currentUser.employeeId)
      ? [ currentUser, ...fetchedEmployees ]
      : fetchedEmployees;

  // Filter excluded roles
  const filteredEmployees = excludeRoles
    ? allEmployees.filter(
      (emp) =>
        (currentUser && emp.employeeId === currentUser.employeeId) ||
          !excludeRoles.includes(emp.role),
    )
    : allEmployees;

  if (!isMounted) {
    return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      <Controller
        control={ control }
        name={ name }
        render={ ({ field }) =>
          isDesktop ? (
            <DesktopSelect
              allEmployees={ filteredEmployees || [] }
              field={ field }
              setDriverString={ setDriverString }
              onEmployeeSelect={ onEmployeeSelect }
              modal={ modal }
            />
          ) : (
            <MobileSelect
              allEmployees={ filteredEmployees || [] }
              field={ field }
              setDriverString={ setDriverString }
              onEmployeeSelect={ onEmployeeSelect }
            />
          )
        }
      />
    </div>
  );
}

interface SelectionProps<T extends FieldValues> {
  allEmployees: Employee[];
  field: ControllerRenderProps<T, FieldPath<T>>;
  setDriverString?: Dispatch<SetStateAction<string>>;
  onEmployeeSelect?: (employee: Employee) => void;
  modal?: boolean;
}

function DesktopSelect<T extends FieldValues>({
  allEmployees,
  field,
  setDriverString,
  onEmployeeSelect,
  modal,
}: SelectionProps<T>) {
  const [ open, setOpen ] = useState(false);

  // field.value is the employeeId (string)
  const selectedEmployee = allEmployees.find(
    (employee) => employee.employeeId === field.value,
  );

  return (
    <Popover open={ open } onOpenChange={ setOpen } modal={ modal }>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className="w-full justify-between font-normal"
        >
          {selectedEmployee ? (
            <>
              <span className="truncate">
                {selectedEmployee.fullname} -{" "}
                {hideDocumentNumber(selectedEmployee.documentNumber)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Selecione o funcionário
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <EmployeeList
          allEmployees={ allEmployees }
          setOpen={ setOpen }
          field={ field }
          setDriverString={ setDriverString }
          onEmployeeSelect={ onEmployeeSelect }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect<T extends FieldValues>({
  allEmployees,
  field,
  setDriverString,
  onEmployeeSelect,
}: SelectionProps<T>) {
  const [ open, setOpen ] = useState(false);

  const selectedEmployee = allEmployees.find(
    (employee) => employee.employeeId === field.value,
  );

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className="w-full justify-between font-normal"
        >
          {selectedEmployee ? (
            <>
              <span className="truncate">
                {selectedEmployee.fullname} -{" "}
                {hideDocumentNumber(selectedEmployee.documentNumber)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Selecione o funcionário
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="hidden">Selecione o funcionário</DrawerTitle>
        <div className="mt-4 border-t">
          <EmployeeList
            allEmployees={ allEmployees }
            setOpen={ setOpen }
            field={ field }
            setDriverString={ setDriverString }
            onEmployeeSelect={ onEmployeeSelect }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function EmployeeList<T extends FieldValues>({
  allEmployees,
  setOpen,
  field,
  setDriverString,
  onEmployeeSelect,
}: {
  allEmployees: Employee[];
  setOpen: (open: boolean) => void;
  field: ControllerRenderProps<T, FieldPath<T>>;
  setDriverString?: Dispatch<SetStateAction<string>>;
  onEmployeeSelect?: (employee: Employee) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar funcionários..." />
      <CommandList>
        <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
        <CommandGroup>
          {allEmployees.map((employee) => (
            <CommandItem
              key={ employee.employeeId }
              value={ `${employee.fullname} ${employee.documentNumber || ""}` } // Using fullname and document for client-side filtering
              onSelect={ () => {
                field.onChange(employee.employeeId);

                if (setDriverString) {
                  setDriverString(employee.fullname);
                }
                if (onEmployeeSelect) {
                  onEmployeeSelect(employee);
                }

                setOpen(false);
              } }
            >
              <Check
                className={ cn(
                  "mr-2 h-4 w-4",
                  field.value === employee.employeeId
                    ? "opacity-100"
                    : "opacity-0",
                ) }
              />
              {employee.fullname} -{" "}
              {hideDocumentNumber(employee.documentNumber)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
