"use client";

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
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllGears } from "@/services/gears.service";

interface SelectTrainingGearProps {
    disabled?: boolean;
    selectedGear: string | undefined;
    filialId?: string | undefined
    onGearChange: (gearName: string) => void;
}

export function SelectTrainingGear({
  disabled = false,
  selectedGear,
  onGearChange,
  filialId
}: SelectTrainingGearProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const gearsData = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears", filialId ],
    queryFn: () => GetAllGears({}),
    staleTime: 1000 * 60,
  });

  const gears = gearsData.data?.data;

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      {isDesktop ? (
        <DesktopSelect
          disabled={ disabled }
          allGears={ gears }
          selectedGear={ selectedGear }
          onGearChange={ onGearChange }
        />
      ) : (
        <MobileSelect
          allGears={ gears }
          selectedGear={ selectedGear }
          onGearChange={ onGearChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
    disabled?: boolean;
    allGears: Gear[] | undefined;
    selectedGear: string | undefined;
    onGearChange: (gearName: string) => void;
}

function DesktopSelect({ disabled, allGears, selectedGear, onGearChange }: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedGear, allGears);

  return (
    <Popover open={ open } onOpenChange={ setOpen } modal={ true }>
      <PopoverTrigger asChild>
        <Button disabled={ disabled } variant="outline" className="w-full justify-start group cursor-pointer">
          {selectedValue ? (
            <>{selectedValue.gearName}</>
          ) : (
            <span className="text-placeholder group-hover:text-white">Selecione o equipamento</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start" sideOffset={ 4 }>
        <GearsList
          allGears={ allGears }
          setOpen={ setOpen }
          onGearChange={ onGearChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({ allGears, selectedGear, onGearChange }: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedGear, allGears);

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedValue ? (
            <>{selectedValue.gearName}</>
          ) : (
            <span className="text-placeholder">Selecione o equipamento</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <GearsList
              allGears={ allGears }
              setOpen={ setOpen }
              onGearChange={ onGearChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface GearsListProps {
    setOpen: (_open: boolean) => void;
    onGearChange: (gearName: string) => void;
    allGears: Gear[] | undefined;
}

function GearsList({ setOpen, onGearChange, allGears }: GearsListProps) {
  const handleSelect = (gear: Gear) => {
    onGearChange(gear.gearId);
    setOpen(false);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar equipamentos..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allGears?.map((gear) => (
            <CommandItem
              key={ gear.gearId }
              value={ gear.gearId }
              onSelect={ () => handleSelect(gear) }
              className="cursor-pointer"
            >
              {gear.gearName}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function getDisplayValue(gearId: string | undefined, allGears: Gear[] | undefined) {
  if (!gearId || !allGears) return null;
  const gear = allGears.find(g => g.gearId === gearId);
  return gear ? { gearName: gear.gearName } : null;
}