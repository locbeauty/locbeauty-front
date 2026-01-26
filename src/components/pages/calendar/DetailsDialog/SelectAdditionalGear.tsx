"use client";

import { useFormContext } from "react-hook-form";
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
import { useEffect, useMemo, useState } from "react";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { GetAllGears } from "@/services/gears.service";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Checkout } from "@/utils/@types/checkouts";

export function SelectAdditionalGear({
  onSelect,
  selectedCheckout,
  unavailableGearIds = [],
}: {
  onSelect: (gear: Gear) => void;
  selectedCheckout: Checkout;
  unavailableGearIds?: string[];
}) {
  const [ filteredGears, setFilteredGears ] = useState<Gear[] | undefined>([]);
  const { user } = useAuth();
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filialId =
    user?.role === USER_ROLES.GERENTE ? user?.sourceFilialId : undefined;

  const { data } = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears", filialId ],
    queryFn: () => GetAllGears({ filialId }),
    staleTime: 1000 * 60,
  });

  const originalGears = data?.data;

  useEffect(() => {
    const updated = originalGears?.filter(
      (gear) =>
        !selectedCheckout.Bookings.some(
          (item) =>
            item.Gear.gearId === gear.gearId && item.status === "ACTIVE",
        ),
    );
    setFilteredGears(updated);
  }, [ selectedCheckout, originalGears ]);

  if (!isMounted) return <div className="h-10 w-full" />;

  return (
    <div className="flex flex-col space-y-1">
      {!filteredGears ? (
        <Loader2 className="animate-spin" />
      ) : isDesktop ? (
        <DesktopSelect
          gears={ filteredGears }
          onSelect={ onSelect }
          unavailableGearIds={ unavailableGearIds }
        />
      ) : (
        <MobileSelect
          gears={ filteredGears }
          onSelect={ onSelect }
          unavailableGearIds={ unavailableGearIds }
        />
      )}
    </div>
  );
}

function DesktopSelect({
  gears,
  onSelect,
  unavailableGearIds,
}: {
  gears: Gear[];
  onSelect: (gear: Gear) => void;
  unavailableGearIds: string[];
}) {
  const [ open, setOpen ] = useState(false);
  const [ selectedLabel, setSelectedLabel ] = useState<string | null>(null);

  return (
    <Popover open={ open } onOpenChange={ setOpen } modal={ true }>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={ `w-full justify-start ${
            !selectedLabel && "text-placeholder"
          }` }
        >
          {selectedLabel ?? "Selecione a máquina"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <GearsList
          gears={ gears }
          setOpen={ setOpen }
          onSelect={ (gear) => {
            onSelect(gear);
            setSelectedLabel(gear.gearName);
          } }
          unavailableGearIds={ unavailableGearIds }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  gears,
  onSelect,
  unavailableGearIds,
}: {
  gears: Gear[];
  onSelect: (gear: Gear) => void;
  unavailableGearIds: string[];
}) {
  const [ open, setOpen ] = useState(false);

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start group cursor-pointer"
        >
          <span className="text-placeholder group-hover:text-white">
            Selecione a máquina
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="px-4 pt-4 text-base font-semibold">
          Máquinas
        </DrawerTitle>
        <div className="mt-2 border-t px-4">
          <GearsList
            gears={ gears }
            setOpen={ setOpen }
            onSelect={ onSelect }
            unavailableGearIds={ unavailableGearIds }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function GearsList({
  gears,
  setOpen,
  onSelect,
  unavailableGearIds,
}: {
  gears: Gear[];
  setOpen: (_open: boolean) => void;
  onSelect: (gear: Gear) => void;
  unavailableGearIds: string[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar máquinas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {gears.map((gear) => {
            const isUnavailable = unavailableGearIds.includes(gear.gearId);
            return (
              <CommandItem
                key={ gear.gearId }
                value={ gear.gearName }
                className={ `w-full ${isUnavailable ? "opacity-50 pointer-events-none" : ""}` }
                disabled={ isUnavailable }
                onSelect={ () => {
                  if (!isUnavailable) {
                    onSelect(gear);
                    setOpen(false);
                  }
                } }
              >
                {gear.gearName} {isUnavailable && "(Indisponível)"}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
