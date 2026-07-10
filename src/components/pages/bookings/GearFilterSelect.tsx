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
import { ApiResponse } from "@/lib/api";
import { GetAllGears } from "@/services/gears.service";
import { Gear } from "@/utils/@types/gears";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHoverOpen } from "@/hooks/useHoverOpen";
import { groupGearsByName } from "@/utils/groupGearsByName";

interface GearFilterSelectProps {
  /** gearIds do nome selecionado (a mesma máquina em várias filiais). */
  value?: string[];
  onSelect: (gearIds: string[] | undefined) => void;
  /** Filiais cujas máquinas entram na lista (undefined = todas). */
  filialIds?: string[];
}

export function GearFilterSelect({
  value,
  onSelect,
  filialIds,
}: GearFilterSelectProps) {
  const { open, onOpenChange, triggerProps, contentProps } = useHoverOpen();

  const { data } = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears-filter", filialIds ],
    queryFn: () => GetAllGears({ filialIds }),
    staleTime: 1000 * 60,
  });

  // Um item por nome de máquina; selecionar = todos os gearIds daquele nome.
  const groups = groupGearsByName(data?.data || []);
  const selectedGroup = groups.find((group) =>
    group.gearIds.some((id) => value?.includes(id)),
  );

  return (
    // modal={false}: popover modal bloqueia pointer-events no body, o que
    // quebra o abre/fecha por hover.
    <Popover open={ open } onOpenChange={ onOpenChange } modal={ false }>
      <PopoverTrigger asChild { ...triggerProps }>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className={ cn(
            "w-full justify-between md:w-[200px]",
            !selectedGroup && "text-placeholder",
          ) }
        >
          {selectedGroup ? selectedGroup.gearName : "Filtrar por máquina"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        // Não roubar o foco do teclado quando abre por hover.
        onOpenAutoFocus={ (e) => e.preventDefault() }
        { ...contentProps }
      >
        <Command>
          <CommandInput placeholder="Buscar máquina..." />
          <CommandList>
            <CommandEmpty>Nenhuma máquina encontrada.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={ () => {
                  onSelect(undefined);
                  onOpenChange(false);
                } }
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    !selectedGroup ? "opacity-100" : "opacity-0"
                  ) }
                />
                Todas
              </CommandItem>
              {groups.map((group) => (
                <CommandItem
                  key={ group.key }
                  value={ group.gearName }
                  onSelect={ () => {
                    onSelect(
                      group.key === selectedGroup?.key
                        ? undefined
                        : group.gearIds,
                    );
                    onOpenChange(false);
                  } }
                >
                  <Check
                    className={ cn(
                      "mr-2 h-4 w-4",
                      group.key === selectedGroup?.key
                        ? "opacity-100"
                        : "opacity-0"
                    ) }
                  />
                  {group.gearName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
