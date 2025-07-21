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
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { useCart } from "@/contexts/cart-provider";

export function SelectGear() {
    const [ originalGears, setOriginalGears ] = useState<Gear[]>([]);
    const [ filteredGears, setFilteredGears ] = useState<Gear[]>([]);

    const isMounted = useMounted();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const user = useAuth();
    const { items } = useCart();

    useEffect(() => {
        async function getAllGears() {
            const response = await fetch(`http://localhost:3333/api/gears/${user.user?.sourceFilial.filialId}`, {
                credentials: "include",
            });
            const { data } = await response.json();
            setOriginalGears(data);
        }
        getAllGears();
    }, [ user.user?.sourceFilial.filialId ]);

    useEffect(() => {
        const updated = originalGears.filter(
            gear => !items.some(item => item.gear.gearId === gear.gearId)
        );
        setFilteredGears(updated);
    }, [ items, originalGears ]);

    const {
        control,
    } = useFormContext<CreateBookingFormSchemaType>();

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1">
            <Controller
                control={ control }
                name="gear"
                render={ ({ field }) =>
                    isDesktop ? (
                        <DesktopSelect gears={ filteredGears } field={ field } />
                    ) : (
                        <MobileSelect gears={ filteredGears } field={ field } />
                    )
                }
            />
        </div>
    );
}

function DesktopSelect({
    field,
    gears,
}: {
    field: ControllerRenderProps<CreateBookingFormSchemaType, "gear">;
    gears: Gear[] | undefined;
}) {
    const [ open, setOpen ] = useState(false);

    const selectedGear = field.value;

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start group cursor-pointer">
                    {selectedGear ? (
                        <>{selectedGear.gearName}</>
                    ) : (
                        <span className="text-placeholder group-hover:text-white">Selecione a máquina</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <GearsList
                    gears={ gears }
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
    gears,
}: {
  field: ControllerRenderProps<CreateBookingFormSchemaType, "gear">;
  gears: Gear[] | undefined;
}) {
    const [ open, setOpen ] = useState(false);

    const selectedGear = field.value;

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedGear ? (
                        <>{selectedGear.gearName}</>
                    ) : (
                        <span className="text-muted-foreground">Selecione a máquina</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerTitle className="px-4 pt-4 text-base font-semibold">
          Máquinas
                </DrawerTitle>
                <div className="mt-2 border-t px-4">
                    <GearsList
                        gears={ gears }
                        setOpen={ setOpen }
                        onChange={ field.onChange }
                        value={ field.value }
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function GearsList({
    setOpen,
    onChange,
    gears,
}: {
  setOpen: (_open: boolean) => void;
  onChange: (_value: { gearId: string, gearName: string }) => void;
  value: { gearId: string, gearName: string };
  gears: Gear[] | undefined;
}) {
    return (
        <Command>
            <CommandInput placeholder="Filtrar máquinas..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {gears?.map((gear) => (
                        <CommandItem
                            key={ gear.gearId }
                            value={ gear.gearName }
                            onSelect={ () => {
                                onChange({ gearId: gear.gearId, gearName: gear.gearName });
                                setOpen(false);
                            } }
                        >
                            {gear.gearName}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
