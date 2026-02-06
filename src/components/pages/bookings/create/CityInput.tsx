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
import { fetchCityDistances } from "@/services/city-distances.service";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";

type CityOption = {
  id: string;
  name: string;
  distance: number;
};

export function CityInput({
  distanceInKM,
  setDistanceInKM,
  filialId,
}: {
  distanceInKM: number;
  setDistanceInKM: (value: number) => void;
  filialId?: string;
}) {
  const [ open, setOpen ] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [ selectedCityName, setSelectedCityName ] = useState<string>("");

  const { data: cityOptions = [], isLoading } = useQuery({
    queryKey: [ "city-distances", filialId ],
    queryFn: async () => {
      if (!filialId) return [];
      const data = await fetchCityDistances(filialId);
      return data.map((d) => ({
        id: d.cityDistanceId,
        name: `${d.cityName} - ${d.state}`,
        distance: d.distance,
      }));
    },
    enabled: !!filialId,
  });

  const handleSelect = (city: CityOption) => {
    setDistanceInKM(city.distance);
    setSelectedCityName(city.name);
    setOpen(false);
  };

  if (!filialId) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-full justify-start text-muted-foreground"
      >
        Selecione uma filial primeiro
      </Button>
    );
  }

  if (isDesktop) {
    return (
      <Popover open={ open } onOpenChange={ setOpen } modal={ true }>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={ open }
            className="w-full justify-between"
          >
            {selectedCityName ? (
              <span className="truncate">
                {selectedCityName} ({distanceInKM} km)
              </span>
            ) : (
              <span className="text-muted-foreground">
                Selecione a cidade...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 z-[9999]"
          align="start"
        >
          <CityList
            options={ cityOptions }
            isLoading={ isLoading }
            onSelect={ handleSelect }
            selectedId={
              cityOptions.find(
                (c) =>
                  c.distance === distanceInKM && c.name === selectedCityName,
              )?.id
            }
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className="w-full justify-between"
        >
          {selectedCityName ? (
            <span className="truncate">
              {selectedCityName} ({distanceInKM} km)
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione a cidade...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="z-[9999]">
        <div className="mt-4 borde r-t">
          <DrawerTitle className="sr-only">Selecionar cidade</DrawerTitle>
          <CityList
            options={ cityOptions }
            isLoading={ isLoading }
            onSelect={ handleSelect }
            selectedId={
              cityOptions.find(
                (c) =>
                  c.distance === distanceInKM && c.name === selectedCityName,
              )?.id
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CityList({
  options,
  isLoading,
  onSelect,
  selectedId,
}: {
  options: CityOption[];
  isLoading: boolean;
  onSelect: (city: CityOption) => void;
  selectedId?: string;
}) {
  return (
    <Command>
      <CommandInput placeholder="Buscar cidade..." />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando cidades...
          </div>
        )}
        {!isLoading && options.length === 0 && (
          <CommandEmpty>Nennhuma cidade encontrada.</CommandEmpty>
        )}
        <CommandGroup>
          {options.map((city) => (
            <CommandItem
              key={ city.id }
              value={ city.name }
              onSelect={ () => onSelect(city) }
            >
              <Check
                className={ cn(
                  "mr-2 h-4 w-4",
                  selectedId === city.id ? "opacity-100" : "opacity-0",
                ) }
              />
              <div className="flex flex-col">
                <span>{city.name}</span>
                <span className="text-xs">
                  {city.distance} km
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
