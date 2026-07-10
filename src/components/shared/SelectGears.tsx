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
import { useHoverOpen } from "@/hooks/useHoverOpen";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import {
  GearNameGroup,
  groupGearsByName,
} from "@/utils/groupGearsByName";

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
  const { open, onOpenChange, triggerProps, contentProps } = useHoverOpen();

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
    // modal={false}: popover modal bloqueia pointer-events no body, o que
    // quebra o abre/fecha por hover.
    <Popover open={ open } onOpenChange={ onOpenChange } modal={ false }>
      <PopoverTrigger asChild { ...triggerProps }>{trigger}</PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        // Não roubar o foco do teclado quando abre por hover.
        onOpenAutoFocus={ (e) => e.preventDefault() }
        { ...contentProps }
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

  // Conta nomes (grupos), não ids: a mesma máquina em várias filiais é uma só.
  const selectedGroups = groupGearsByName(options).filter((group) =>
    group.gearIds.some((id) => value.includes(id)),
  );

  if (selectedGroups.length === 1) {
    return <span className="truncate">{selectedGroups[0].gearName}</span>;
  }

  if (selectedGroups.length > 1) {
    return <span>{selectedGroups.length} máquinas selecionadas</span>;
  }

  // Opções ainda carregando (ou ids obsoletos): cai no total de ids.
  return (
    <span>
      {value.length === 1
        ? "1 máquina"
        : `${value.length} máquinas selecionadas`}
    </span>
  );
}

interface GearsListProps {
  options: Gear[];
  value: string[];
  onChange: (ids: string[]) => void;
}

function GearsList({ options, value, onChange }: GearsListProps) {
  // Uma entrada por nome; selecionar um nome seleciona todos os gearIds dele.
  const groups = groupGearsByName(options);

  // ANY-match: seleções parciais (ex.: localStorage anterior ao dedupe)
  // aparecem marcadas; desmarcar remove todos os ids do grupo.
  const isGroupSelected = (group: GearNameGroup) =>
    group.gearIds.some((id) => value.includes(id));

  const toggle = (group: GearNameGroup) => {
    if (isGroupSelected(group)) {
      onChange(value.filter((v) => !group.gearIds.includes(v)));
    } else {
      onChange([
        ...value,
        ...group.gearIds.filter((id) => !value.includes(id)),
      ]);
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
          {groups.map((group) => (
            <CommandItem
              key={ group.key }
              value={ group.gearName }
              onSelect={ () => toggle(group) }
              className="cursor-pointer"
            >
              <Check
                className={ cn(
                  "mr-2 h-4 w-4",
                  isGroupSelected(group) ? "opacity-100" : "opacity-0",
                ) }
              />
              {group.gearName}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
