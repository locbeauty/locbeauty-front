"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { findAllFilials } from "@/services/filials.service";
import { Filial } from "@/utils/@types/filials";
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

interface SelectAdditionalFilialsProps {
  value: string[];
  onChange: (ids: string[]) => void;
  excludeFilialId?: string;
}

export function SelectAdditionalFilials({
  value,
  onChange,
  excludeFilialId,
}: SelectAdditionalFilialsProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: filials } = useQuery<Filial[], Error>({
    queryKey: [ "get-all-filials" ],
    queryFn: () => findAllFilials(),
    staleTime: 1000 * 60,
  });

  const options = (filials || []).filter(
    (f) => f.filialId !== excludeFilialId,
  );

  if (!isMounted) {
    return <div className="h-9 w-full" />;
  }

  return isDesktop ? (
    <DesktopSelect options={ options } value={ value } onChange={ onChange } />
  ) : (
    <MobileSelect options={ options } value={ value } onChange={ onChange } />
  );
}

interface SelectProps {
  options: Filial[];
  value: string[];
  onChange: (ids: string[]) => void;
}

function triggerContent(value: string[]) {
  return (
    <>
      {value.length > 0 ? (
        <span>{value.length} filial(is) selecionada(s)</span>
      ) : (
        <span>Selecione filiais adicionais (opcional)</span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
    </>
  );
}

function DesktopSelect({ options, value, onChange }: SelectProps) {
  return (
    <Popover modal={ true }>
      <PopoverTrigger asChild>
        <Button
          type="button"
          role="combobox"
          className="w-full justify-between bg-[#33516e] text-white hover:bg-[#33516e]/90"
        >
          {triggerContent(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <FilialsList options={ options } value={ value } onChange={ onChange } />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({ options, value, onChange }: SelectProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          role="combobox"
          className="w-full justify-between bg-[#33516e] text-white hover:bg-[#33516e]/90"
        >
          {triggerContent(value)}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <FilialsList
              options={ options }
              value={ value }
              onChange={ onChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

function FilialsList({ options, value, onChange }: SelectProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([ ...value, id ]);
    }
  };

  return (
    <Command>
      <CommandInput placeholder="Buscar filial..." />
      <CommandList>
        <CommandEmpty>Nenhuma filial encontrada.</CommandEmpty>
        <CommandGroup>
          {options.map((filial) => {
            const isSelected = value.includes(filial.filialId);
            return (
              <CommandItem
                key={ filial.filialId }
                value={ filial.filialName }
                onSelect={ () => toggle(filial.filialId) }
                className="cursor-pointer"
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                  ) }
                />
                {filial.filialName}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
