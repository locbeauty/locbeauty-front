"use client";

import * as React from "react";
import { Controller, ControllerRenderProps, FieldValues, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";

type Gear = {
  slug: string
  label: string
  id: string
}

const gears: Gear[] = [
    {
        slug: "lavieen",
        label: "Lavieen",
        id: "1",
    },
    {
        slug: "ultraformer",
        label: "Ultraformer",
        id: "2",
    },
    {
        slug: "delight",
        label: "Delight",
        id: "3",
    },
    {
        slug: "lightsheer-duet",
        label: "Lightsheer Duet",
        id: "4",
    },
    {
        slug: "vega",
        label: "Vega",
        id: "5",
    },
];

export function SelectGear({ name = "gearName" }: { name?: string }) {
    const isMounted = useMounted();
    const {
        control,
    } = useFormContext();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!isMounted) {
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

    const selectedGear = field.value ? gears.find((gear) => gear.slug === field.value) : null;

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-fit justify-start">
                    {selectedGear ? (
                        <>{selectedGear.label}</>
                    ) : (
                        <span className="text-placeholder">Selecione a máquina</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <GearsList setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({ field }: { field: ControllerRenderProps<FieldValues, string> }) {
    const [ open, setOpen ] = React.useState(false);

    const selectedGear = field.value ? gears.find((gear) => gear.slug === field.value) : null;

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedGear ? (
                        <>{selectedGear.label}</>
                    ) : (
                        <span className="text-placeholder">Selecione a máquina</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent aria-describedby={ undefined }>
                <DrawerTitle>
                    <div className="mt-4 border-t">
                        <GearsList setOpen={ setOpen } onChange={ field.onChange } value={ field.value } />
                    </div>
                </DrawerTitle>
            </DrawerContent>
        </Drawer>
    );
}

function GearsList({
    setOpen,
    onChange,
}: {
  setOpen: (_open: boolean) => void
  onChange: (_value: string) => void
  value: string
}) {
    return (
        <Command>
            <CommandInput placeholder="Filtrar máquinas..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {gears.map((gear) => (
                        <CommandItem
                            key={ gear.slug }
                            value={ gear.slug }
                            onSelect={ (slug) => {
                                onChange(slug);
                                setOpen(false);
                            } }
                        >
                            {gear.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
