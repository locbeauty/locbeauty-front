"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { GetAllGears } from "@/services/gears.service";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

interface SelectGearsProps {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Label shown when no gear is selected (defaults to "Todas as máquinas"). */
  placeholder?: string;
  /** Class applied to the trigger button (controls width/style). */
  className?: string;
  /** Restringe as opções às máquinas dessas filiais (undefined = todas). */
  filialIds?: string[];
}

export function SelectGears({
  value,
  onChange,
  placeholder,
  className,
  filialIds,
}: SelectGearsProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data } = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears-select", filialIds ],
    queryFn: () => GetAllGears({ filialIds }),
    staleTime: 1000 * 60,
  });

  const options = data?.data || [];

  if (!isMounted) {
    return <div className={ cn("h-9 w-full", className) } />;
  }

  const trigger = (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      className={ cn(
        "w-full justify-between",
        value.length === 0 && "text-placeholder",
        className,
      ) }
    >
      {triggerLabel(value, options, placeholder)}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return isDesktop ? (
    <Popover modal={ true }>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <GearsList options={ options } value={ value } onChange={ onChange } />
      </PopoverContent>
    </Popover>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <GearsList options={ options } value={ value } onChange={ onChange } />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

function triggerLabel(value: string[], options: Gear[], placeholder?: string) {
  if (value.length === 0) {
    return <span>{placeholder || "Todas as máquinas"}</span>;
  }

  if (value.length === 1) {
    const gear = options.find((g) => g.gearId === value[0]);
    return <span className="truncate">{gear?.gearName ?? "1 máquina"}</span>;
  }

  return <span>{value.length} máquinas selecionadas</span>;
}

interface GearsListProps {
  options: Gear[];
  value: string[];
  onChange: (ids: string[]) => void;
}

function GearsList({ options, value, onChange }: GearsListProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([ ...value, id ]);
    }
  };

  return (
    <Command>
      <CommandInput placeholder="Buscar máquina..." />
      <CommandList>
        <CommandEmpty>Nenhuma máquina encontrada.</CommandEmpty>
        <CommandGroup>
          <CommandItem
            value="__todas__"
            onSelect={ () => onChange([]) }
            className="cursor-pointer"
          >
            <Check
              className={ cn(
                "mr-2 h-4 w-4",
                value.length === 0 ? "opacity-100" : "opacity-0",
              ) }
            />
            Todas
          </CommandItem>
          {options.map((gear) => {
            const isSelected = value.includes(gear.gearId);
            return (
              <CommandItem
                key={ gear.gearId }
                value={ gear.gearName }
                onSelect={ () => toggle(gear.gearId) }
                className="cursor-pointer"
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                  ) }
                />
                {gear.gearName}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
