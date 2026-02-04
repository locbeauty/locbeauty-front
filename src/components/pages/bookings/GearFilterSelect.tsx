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
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GearFilterSelectProps {
  value?: string;
  onSelect: (gearId: string | undefined) => void;
  filialId?: string;
}

export function GearFilterSelect({
  value,
  onSelect,
  filialId,
}: GearFilterSelectProps) {
  const [ open, setOpen ] = useState(false);

  const { data } = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears-filter", filialId ],
    queryFn: () => GetAllGears({ filialId }),
    staleTime: 1000 * 60,
  });

  const gears = data?.data || [];
  const selectedGear = gears.find((g) => g.gearId === value);

  return (
    <Popover open={ open } onOpenChange={ setOpen }>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className={ cn(
            "w-full justify-between md:w-[200px]",
            !selectedGear && "text-placeholder",
          ) }
        >
          {selectedGear ? selectedGear.gearName : "Filtrar por máquina"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar máquina..." />
          <CommandList>
            <CommandEmpty>Nenhuma máquina encontrada.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={ () => {
                  onSelect(undefined);
                  setOpen(false);
                } }
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  ) }
                />
                Todas
              </CommandItem>
              {gears.map((gear) => (
                <CommandItem
                  key={ gear.gearId }
                  value={ gear.gearName }
                  onSelect={ () => {
                    onSelect(gear.gearId === value ? undefined : gear.gearId);
                    setOpen(false);
                  } }
                >
                  <Check
                    className={ cn(
                      "mr-2 h-4 w-4",
                      value === gear.gearId ? "opacity-100" : "opacity-0"
                    ) }
                  />
                  {gear.gearName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
