"use client";

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { useHoverOpen } from "@/hooks/useHoverOpen";
import { cn } from "@/lib/utils";

type FilterItem = string | { value: string; label: string };

interface FilterSelectProps {
  items: readonly FilterItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Adiciona a opção "Todas" (value "all"), como no CustomFilterSelect. */
  showAllOption?: boolean;
  /** Props do botão do trigger (className, disabled...). */
  triggerProps?: React.ComponentPropsWithoutRef<typeof Button>;
  /** Mostra campo de busca (para listas longas). */
  searchable?: boolean;
}

/**
 * Single-select para barras de filtro, com abre/fecha por hover (useHoverOpen).
 * Substitui o CustomFilterSelect (Radix Select) nesses casos: o Select é sempre
 * modal e rouba o foco do teclado ao abrir — hover-open nele tiraria o foco de
 * quem digita em outro campo da página.
 */
export function FilterSelect({
  items,
  value,
  onValueChange,
  placeholder,
  showAllOption = false,
  triggerProps,
  searchable = false,
}: FilterSelectProps) {
  const {
    open,
    onOpenChange,
    triggerProps: hoverTriggerProps,
    contentProps,
  } = useHoverOpen();

  const options = items.map((item) =>
    typeof item === "string" ? { value: item, label: item } : item,
  );
  const selected = options.find((item) => item.value === value);

  const select = (next: string) => {
    onValueChange?.(next);
    onOpenChange(false);
  };

  return (
    <Popover open={ open } onOpenChange={ onOpenChange } modal={ false }>
      <PopoverTrigger asChild { ...hoverTriggerProps }>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          { ...triggerProps }
          className={ cn(
            "w-full justify-between",
            !selected && "text-placeholder",
            triggerProps?.className,
          ) }
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        // Não roubar o foco do teclado quando abre por hover.
        onOpenAutoFocus={ (e) => e.preventDefault() }
        { ...contentProps }
      >
        <Command>
          {searchable && <CommandInput placeholder="Buscar..." />}
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value="all"
                  onSelect={ () => select("all") }
                  className="cursor-pointer"
                >
                  <Check
                    className={ cn(
                      "mr-2 h-4 w-4",
                      value === "all" ? "opacity-100" : "opacity-0",
                    ) }
                  />
                  Todas
                </CommandItem>
              )}
              {options.map((item) => (
                <CommandItem
                  key={ item.value }
                  value={ item.label }
                  onSelect={ () => select(item.value) }
                  className="cursor-pointer"
                >
                  <Check
                    className={ cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    ) }
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
