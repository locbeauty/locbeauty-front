"use client";

import { Controller, ControllerRenderProps, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useEffect, useState } from "react";
import { Customer } from "@/utils/@types/customer";
import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function SelectCustomer({ disabled = false }: {disabled?: boolean}) {
    const isMounted = useMounted();
    const {
        control,
    } = useFormContext<CreateBookingFormSchemaType>();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const [ allCustomers, setAllCustomers ] = useState<Customer[]>([]);

    useEffect(() => {
        async function handleGetAllCustomers() {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customers`, {
                credentials: "include",
                next: {
                    tags: [ "get-all-filials" ],
                },
            });
            const { data }: { data: Customer[] } = await response.json();
            setAllCustomers(data);
        }
        handleGetAllCustomers();
    }, []);

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1  w-full">
            <Controller
                control={ control }
                name="customer"
                render={ ({ field }) => (isDesktop ? <DesktopSelect disabled={ disabled } allCustomers={ allCustomers } field={ field } /> : <MobileSelect allCustomers={ allCustomers } field={ field } />) }
            />
        </div>
    );
}

function DesktopSelect({ disabled, field, allCustomers }: { disabled?: boolean, field: ControllerRenderProps<CreateBookingFormSchemaType, "customer">, allCustomers: Customer[] }) {
    const [ open, setOpen ] = useState(false);

    const selectedCustomer = field.value;

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button disabled={ disabled } variant="outline" className="w-full justify-start group cursor-pointer">
                    {selectedCustomer ? (
                        <>{selectedCustomer.fullname} - {hideDocumentNumber(selectedCustomer.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder group-hover:text-white">Selecione o cliente</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
                <CustomersList allCustomers={ allCustomers } setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({ field, allCustomers }: { field: ControllerRenderProps<CreateBookingFormSchemaType, "customer">, allCustomers: Customer[] }) {
    const [ open, setOpen ] = useState(false);

    const selectedCustomer = field.value;

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedCustomer ? (
                        <>{selectedCustomer.fullname} - {hideDocumentNumber(selectedCustomer.documentNumber)}</>
                    ) : (
                        <span className="text-placeholder">Selecione o cliente</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="w-full" aria-describedby={ undefined }>
                <DrawerTitle>
                    <div className="mt-4 border-t">
                        <CustomersList allCustomers={ allCustomers } setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
                    </div>
                </DrawerTitle>
            </DrawerContent>
        </Drawer>
    );
}

function CustomersList({
    setOpen,
    onChange,
    allCustomers
}: {
  setOpen: (_open: boolean) => void
  onChange: (_value: { customerId: string, fullname: string, documentNumber: string }) => void
  value: { customerId: string, fullname: string, documentNumber: string }
  allCustomers: Customer[]
}) {
    return (
        <Command>
            <CommandInput placeholder="Filtrar clientes..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {allCustomers.map((customer) => (
                        <CommandItem
                            className="w-[700px]"
                            key={ customer.customerId }
                            value={ customer.customerId }
                            onSelect={ () => {
                                onChange(
                                    {
                                        customerId: customer.customerId,
                                        fullname: customer.fullname,
                                        documentNumber: hideDocumentNumber(customer.documentNumber)
                                    }
                                );
                                setOpen(false);
                            } }
                        >
                            {customer.fullname} - {hideDocumentNumber(customer.documentNumber)}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

function hideDocumentNumber(documentNumber: string) {
    const digits = documentNumber.replace(/\D/g, "");

    if (digits.length === 11) {
    // CPF: ***.***.999-99
        const visible = digits.slice(6); // últimos 5 dígitos
        return `***.***.${visible.slice(0, 3)}-${visible.slice(3)}`;
    }

    if (digits.length === 14) {
    // CNPJ: **.***.***/0001-99
        const visible = digits.slice(8); // últimos 6 dígitos
        return `**.***.***/${visible.slice(0, 4)}-${visible.slice(4)}`;
    }

    // Número inválido ou não reconhecido
    return documentNumber;
}