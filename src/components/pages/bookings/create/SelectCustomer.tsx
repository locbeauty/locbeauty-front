"use client";

import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from "react-hook-form";

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
import { useEffect, useState } from "react";
import { Customer } from "@/utils/@types/customer";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { hideDocumentNumber } from "@/utils/hideDocumentNumber";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllCustomers } from "@/services/customers.service";

export function SelectCustomer({ disabled = false }: { disabled?: boolean }) {
  const isMounted = useMounted();
  const { control, watch } = useFormContext<CreateCheckoutFormSchemaType>();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const filialId = watch("filialId");

  const { data } = useQuery<
    ApiResponse<{ items: Customer[]; total: number }>,
    Error
  >({
    queryKey: [ "get-all-customers", filialId ],
    queryFn: () => GetAllCustomers({ filialId }, { page: 1, limit: 100 }),
    staleTime: 1000 * 60, // 1 minuto de cache
    // cacheTime: 1000 * 60 * 5, // mantém cache 5 minutos
  });

  const allCustomers = data?.data?.items;
  if (!allCustomers) return;

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1  w-full">
      <Controller
        control={ control }
        name="customer"
        render={ ({ field }) =>
          isDesktop ? (
            <DesktopSelect
              disabled={ disabled }
              allCustomers={ allCustomers }
              field={ field }
            />
          ) : (
            <MobileSelect allCustomers={ allCustomers } field={ field } />
          )
        }
      />
    </div>
  );
}

function DesktopSelect({
  disabled,
  field,
  allCustomers,
}: {
  disabled?: boolean;
  field: ControllerRenderProps<CreateCheckoutFormSchemaType, "customer">;
  allCustomers: Customer[];
}) {
  const [ open, setOpen ] = useState(false);

  const selectedCustomer = field.value;

  return (
    <Popover open={ open } onOpenChange={ setOpen }>
      <PopoverTrigger asChild>
        <Button
          disabled={ disabled }
          variant="outline"
          className="w-full justify-start group cursor-pointer"
        >
          {selectedCustomer ? (
            <>
              {selectedCustomer.fullname} -{" "}
              {hideDocumentNumber(selectedCustomer.documentNumber)}
            </>
          ) : (
            <span className="text-placeholder group-hover:text-white">
              Selecione o cliente
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <CustomersList
          allCustomers={ allCustomers }
          setOpen={ setOpen }
          onChange={ field.onChange }
          value={ field.value }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  field,
  allCustomers,
}: {
  field: ControllerRenderProps<CreateCheckoutFormSchemaType, "customer">;
  allCustomers: Customer[];
}) {
  const [ open, setOpen ] = useState(false);

  const selectedCustomer = field.value;

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedCustomer ? (
            <>
              {selectedCustomer.fullname} - {selectedCustomer.documentNumber}
            </>
          ) : (
            <span className="text-placeholder">Selecione o cliente</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <CustomersList
              allCustomers={ allCustomers }
              setOpen={ setOpen }
              onChange={ field.onChange }
              value={ field.value }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

function CustomersList({
  setOpen,
  onChange,
  allCustomers,
}: {
  setOpen: (_open: boolean) => void;
  onChange: (_value: {
    customerId: string;
    fullname: string;
    documentNumber: string;
    cellphone: string;
  }) => void;
  value?:
    | {
        customerId: string;
        fullname: string;
        documentNumber: string;
        cellphone: string;
      }
    | undefined;
  allCustomers: Customer[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar clientes..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allCustomers?.map((customer) => (
            <CommandItem
              className="w-[700px]"
              key={ customer.customerId }
              value={ customer.customerId }
              onSelect={ () => {
                onChange({
                  customerId: customer.customerId,
                  fullname: customer.fullname,
                  documentNumber: customer.documentNumber,
                  cellphone: customer.cellphone ?? "",
                });
                setOpen(false);
              } }
            >
              {customer.fullname} -{" "}
              {hideDocumentNumber(customer.documentNumber)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
