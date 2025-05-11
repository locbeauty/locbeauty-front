"use client";

import * as React from "react";
import { Controller, ControllerRenderProps, FieldValues, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";

type Customer = {
  slug: string
  label: string
  id: string
}

const customers: Customer[] = [
    {
        slug: "jose-silva",
        label: "José Silva",
        id: "1",
    },
    {
        slug: "antonio-marcelo",
        label: "Antonio Marcelo",
        id: "2",
    },
    {
        slug: "lucas-lima",
        label: "Lucas Lima",
        id: "3",
    },
    {
        slug: "caique-franca",
        label: "Caíque França",
        id: "4",
    },
    {
        slug: "ze-lucas",
        label: "Zé Lucas",
        id: "5",
    },
];

for (let i = 6; i <= 500; i++) {
    customers.push({
        slug: `cliente-${i}`,
        label: `Cliente ${i}`,
        id: `${i}`,
    });
}

export function SelectCustomer({ name = "customerId", }: { name?: string }) {
    const isMounted = useMounted();
    const {
        control,
    } = useFormContext();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!isMounted) {
    // Return a placeholder with the same height to prevent layout shift
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1">
            <Controller
                control={ control }
                name={ name }
                render={ ({ field }) => (isDesktop ? <DesktopSelect field={ field } /> : <MobileSelect field={ field } />) }
            />
        </div>
    );
}

function DesktopSelect({ field }: { field: ControllerRenderProps<FieldValues, string> }) {
    const [ open, setOpen ] = React.useState(false);

    const selectedCustomer = field.value ? customers.find((customer) => customer.id === field.value) : null;

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-fit justify-start">
                    {selectedCustomer ? (
                        <>{selectedCustomer.label}</>
                    ) : (
                        <span className="text-placeholder">Selecione o cliente</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <CustomersList setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({ field }: { field: ControllerRenderProps<FieldValues, string> }) {
    const [ open, setOpen ] = React.useState(false);

    const selectedCustomer = field.value ? customers.find((customer) => customer.id === field.value) : null;

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedCustomer ? (
                        <>{selectedCustomer.label}</>
                    ) : (
                        <span className="text-placeholder">Selecione o cliente</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent aria-describedby={ undefined }>
                <DrawerTitle>
                    <div className="mt-4 border-t">
                        <CustomersList setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
                    </div>
                </DrawerTitle>
            </DrawerContent>
        </Drawer>
    );
}

function CustomersList({
    setOpen,
    onChange,
}: {
  setOpen: (_open: boolean) => void
  onChange: (_value: string) => void
  value: string
}) {
    return (
        <Command>
            <CommandInput placeholder="Filtrar clientes..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {customers.map((customer) => (
                        <CommandItem
                            key={ customer.slug }
                            value={ customer.id }
                            onSelect={ (customerId) => {
                                onChange(customerId);
                                setOpen(false);
                            } }
                        >
                            {customer.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
