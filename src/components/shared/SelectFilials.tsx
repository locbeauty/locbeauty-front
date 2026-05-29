"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Filial } from "@/utils/@types/filials";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

type SelectFilialsProps = {
  value?: string[];
  onChange?: (_value: string[]) => void;
  /** Quando informado, restringe as filiais selecionáveis a esses IDs. */
  accessibleFilials?: string[];
  /** Filial que não pode ser desmarcada (ex.: filial de origem). */
  excludeFilialId?: string;
  placeholder?: string;
  className?: string;
};

export function SelectFilials({
  value = [],
  onChange,
  accessibleFilials,
  excludeFilialId,
  placeholder,
  className,
}: SelectFilialsProps) {
  const [ allFilials, setAllFilials ] = useState<Filial[]>([]);
  const [ open, setOpen ] = useState(false);

  useEffect(() => {
    async function handleGetAllFilials() {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/filials`,
        {
          credentials: "include",
          next: {
            tags: [ "get-all-filials" ],
          },
        },
      );
      const { data }: { data: Filial[] } = await response.json();
      setAllFilials(data);
    }
    handleGetAllFilials();
  }, []);

  const selectableFilials = (allFilials || []).filter(
    (filial) =>
      filial.filialId !== excludeFilialId &&
      (!accessibleFilials || accessibleFilials.includes(filial.filialId)),
  );

  function toggleFilial(filialId: string) {
    if (value.includes(filialId)) {
      onChange?.(value.filter((id) => id !== filialId));
    } else {
      onChange?.([ ...value, filialId ]);
    }
  }

  const selectedFilials = selectableFilials.filter((f) =>
    value.includes(f.filialId),
  );

  return (
    <div className="space-y-2">
      <Popover open={ open } onOpenChange={ setOpen }>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={ open }
            className={ cn(
              "w-full md:w-[90%] justify-between font-normal",
              selectedFilials.length === 0 && "text-placeholder",
              className,
            ) }
          >
            {selectedFilials.length > 0
              ? `${selectedFilials.length} filial(is) selecionada(s)`
              : placeholder || "Selecione as filiais"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar filial..." />
            <CommandList>
              <CommandEmpty>Nenhuma filial encontrada.</CommandEmpty>
              <CommandGroup>
                {selectableFilials.map((filial) => (
                  <CommandItem
                    key={ filial.filialId }
                    value={ filial.filialName }
                    onSelect={ () => toggleFilial(filial.filialId) }
                  >
                    <Check
                      className={ cn(
                        "mr-2 h-4 w-4",
                        value.includes(filial.filialId)
                          ? "opacity-100"
                          : "opacity-0",
                      ) }
                    />
                    {filial.filialName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedFilials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilials.map((filial) => (
            <Badge
              key={ filial.filialId }
              variant="secondary"
              className="gap-1"
            >
              {filial.filialName}
              <button
                type="button"
                onClick={ () => toggleFilial(filial.filialId) }
                className="ml-1 rounded-full outline-none hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
