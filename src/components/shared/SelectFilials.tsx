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
import { useHoverOpen } from "@/hooks/useHoverOpen";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

interface SelectFilialsProps {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Restrict the selectable filials (e.g. RBAC). When undefined, all are shown. */
  accessibleFilials?: string[];
  /** Label shown when no filial is selected (defaults to "Todas as filiais"). */
  placeholder?: string;
  /** Class applied to the trigger button (controls width/style). */
  className?: string;
}

export function SelectFilials({
  value,
  onChange,
  accessibleFilials,
  placeholder,
  className,
}: SelectFilialsProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { open, onOpenChange, triggerProps, contentProps } = useHoverOpen();

  const { data: filials } = useQuery<Filial[], Error>({
    queryKey: [ "get-all-filials" ],
    queryFn: () => findAllFilials(),
    staleTime: 1000 * 60,
  });

  const options = (filials || []).filter(
    (f) => !accessibleFilials || accessibleFilials.includes(f.filialId),
  );

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
        <FilialsList options={ options } value={ value } onChange={ onChange } />
      </PopoverContent>
    </Popover>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
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

function triggerLabel(
  value: string[],
  options: Filial[],
  placeholder?: string,
) {
  if (value.length === 0) {
    return <span>{placeholder || "Todas as filiais"}</span>;
  }

  if (value.length === 1) {
    const filial = options.find((f) => f.filialId === value[0]);
    return <span className="truncate">{filial?.filialName ?? "1 filial"}</span>;
  }

  return <span>{value.length} filiais selecionadas</span>;
}

interface FilialsListProps {
  options: Filial[];
  value: string[];
  onChange: (ids: string[]) => void;
}

function FilialsList({ options, value, onChange }: FilialsListProps) {
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
