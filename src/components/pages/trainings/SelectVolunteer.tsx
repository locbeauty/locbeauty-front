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
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useState } from "react";
import { Volunteer } from "@/utils/@types/volunteer";

import { useQuery } from "@tanstack/react-query";
import { GetAllVolunteers } from "@/services/volunteers.service";
import { ApiResponse } from "@/lib/api";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SelectVolunteerProps {
  disabled?: boolean;
  filialId: string | undefined;
  selectedVolunteerIds: string[];
  onVolunteersChange: (volunteers: Volunteer[]) => void;
}

export function SelectVolunteer({
  disabled = false,
  filialId,
  selectedVolunteerIds,
  onVolunteersChange,
}: SelectVolunteerProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: volunteersData } = useQuery<ApiResponse<Volunteer[]>, Error>({
    queryKey: [ "get-all-volunteers", filialId ],
    queryFn: () => GetAllVolunteers({ filialId: filialId ?? "" }),
    enabled: !!filialId,
    staleTime: 1000 * 60,
  });

  const volunteers = volunteersData?.data;

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      {isDesktop ? (
        <DesktopSelect
          disabled={ disabled || !filialId }
          allVolunteers={ volunteers }
          selectedVolunteerIds={ selectedVolunteerIds }
          onVolunteersChange={ onVolunteersChange }
        />
      ) : (
        <MobileSelect
          allVolunteers={ volunteers }
          selectedVolunteerIds={ selectedVolunteerIds }
          onVolunteersChange={ onVolunteersChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
  disabled?: boolean;
  allVolunteers: Volunteer[] | undefined;
  selectedVolunteerIds: string[];
  onVolunteersChange: (volunteers: Volunteer[]) => void;
}

function DesktopSelect({
  disabled,
  allVolunteers,
  selectedVolunteerIds,
  onVolunteersChange,
}: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedCount = selectedVolunteerIds.length;

  return (
    <Popover modal={ true } open={ open } onOpenChange={ setOpen }>
      <PopoverTrigger asChild>
        <Button
          disabled={ disabled }
          variant="outline"
          role="combobox"
          aria-expanded={ open }
          className="w-full justify-between"
        >
          {selectedCount > 0 ? (
            <div className="flex gap-1 flex-wrap">
              <Badge variant="secondary">{selectedCount} selecionado(s)</Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">
              Selecione os pacientes modelo
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <VolunteersList
          allVolunteers={ allVolunteers }
          selectedVolunteerIds={ selectedVolunteerIds }
          onVolunteersChange={ onVolunteersChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  allVolunteers,
  selectedVolunteerIds,
  onVolunteersChange,
}: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedCount = selectedVolunteerIds.length;

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedCount > 0 ? (
            <Badge variant="secondary">{selectedCount} selecionado(s)</Badge>
          ) : (
            <span className="text-muted-foreground">
              Selecione os pacientes modelo
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <VolunteersList
              allVolunteers={ allVolunteers }
              selectedVolunteerIds={ selectedVolunteerIds }
              onVolunteersChange={ onVolunteersChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface VolunteersListProps {
  allVolunteers: Volunteer[] | undefined;
  selectedVolunteerIds: string[];
  onVolunteersChange: (volunteers: Volunteer[]) => void;
}

function VolunteersList({
  allVolunteers,
  selectedVolunteerIds,
  onVolunteersChange,
}: VolunteersListProps) {
  const handleSelect = (volunteer: Volunteer) => {
    const isSelected = selectedVolunteerIds.includes(volunteer.volunteerId);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedVolunteerIds.filter(
        (id) => id !== volunteer.volunteerId,
      );
    } else {
      newSelectedIds = [ ...selectedVolunteerIds, volunteer.volunteerId ];
    }

    const newSelectedVolunteers =
      allVolunteers?.filter((v) => newSelectedIds.includes(v.volunteerId)) ||
      [];

    onVolunteersChange(newSelectedVolunteers);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar pacientes modelo..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allVolunteers?.map((volunteer) => {
            const isSelected = selectedVolunteerIds.includes(
              volunteer.volunteerId,
            );
            return (
              <CommandItem
                key={ volunteer.volunteerId }
                value={ `${volunteer.name} ${volunteer.documentNumber}` }
                onSelect={ () => handleSelect(volunteer) }
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                  ) }
                />
                {volunteer.name} -{" "}
                {hideDocumentNumber(volunteer.documentNumber)}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function hideDocumentNumber(documentNumber: string) {
  const digits = documentNumber.replace(/\D/g, "");

  if (digits.length === 11) {
    const visible = digits.slice(6);
    return `***.***.${visible.slice(0, 3)}-${visible.slice(3)}`;
  }

  if (digits.length === 14) {
    const visible = digits.slice(8);
    return `**.***.***/${visible.slice(0, 4)}-${visible.slice(4)}`;
  }

  return documentNumber;
}
