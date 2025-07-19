"use client";

import {
    Control,
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";

type SelectGearProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  setSelectedGear?: Dispatch<SetStateAction<Gear | null>>
};

export function SelectGear<T extends FieldValues>({
    name,
    control,
    setSelectedGear
}: SelectGearProps<T>) {
    const [ allGears, setAllGears ] = useState<Gear[]>();
    const isMounted = useMounted();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const user = useAuth();

    useEffect(() => {
        async function getAllGears() {

            const response = await fetch(`http://localhost:3333/api/gears/${user.user?.sourceFilial.filialId}`, {
                credentials: "include",
            });
            const { data } = await response.json();
            setAllGears(data);
        }
        getAllGears();
    }, [ user.user?.sourceFilial.filialId ]);

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1">
            <Controller
                control={ control }
                name={ name }
                render={ ({ field }) =>
                    isDesktop ? (
                        <DesktopSelect setSelectedGear={ setSelectedGear } gears={ allGears } field={ field } />
                    ) : (
                        <MobileSelect setSelectedGear={ setSelectedGear } gears={ allGears } field={ field } />
                    )
                }
            />
        </div>
    );
}

function DesktopSelect<T extends FieldValues>({
    field,
    gears,
    setSelectedGear
}: {
    // eslint-disable-next-line
    field: ControllerRenderProps<T, any>;
    gears: Gear[] | undefined;
    setSelectedGear?: Dispatch<SetStateAction<Gear | null>>
}) {
    const [ open, setOpen ] = useState(false);

    const selectedGear = field.value
        ? gears?.find((gear) => gear.gearId === field.value)
        : null;
    useEffect(() => {
        if (setSelectedGear && selectedGear) {
            setSelectedGear(selectedGear);
        }
    }, [ selectedGear, setSelectedGear ]);

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedGear ? (
                        <>{selectedGear.name}</>
                    ) : (
                        <span className="text-muted-foreground">Selecione a máquina</span>
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

function MobileSelect<T extends FieldValues>({
    field,
    gears,
    setSelectedGear
}: {
    // eslint-disable-next-line
  field: ControllerRenderProps<T, any>;
  gears: Gear[] | undefined;
  setSelectedGear?: Dispatch<SetStateAction<Gear | null>>
}) {
    const [ open, setOpen ] = useState(false);

    const selectedGear = field.value
        ? gears?.find((gear) => gear.gearId === field.value)
        : null;

    useEffect(() => {
        if (setSelectedGear && selectedGear) {
            setSelectedGear(selectedGear);
        }
    }, [ selectedGear, setSelectedGear ]);

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedGear ? (
                        <>{selectedGear.name}</>
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
    // value,
    gears,
}: {
  setOpen: (_open: boolean) => void;
  onChange: (_value: string) => void;
  value: string;
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
                            value={ gear.name }
                            onSelect={ () => {
                                onChange(gear.gearId);
                                setOpen(false);
                            } }
                        >
                            {gear.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
