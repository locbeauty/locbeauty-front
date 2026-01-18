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

interface SelectVolunteerProps {
  disabled?: boolean;
  filialId: string | undefined;
  // volunteers: Volunteer[] | undefined; // Removed
  selectedVolunteer: string | undefined;
  onVolunteerChange: (volunteer: Volunteer) => void;
}

export function SelectVolunteer({
  disabled = false,
  filialId,
  selectedVolunteer,
  onVolunteerChange,
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
          selectedVolunteer={ selectedVolunteer }
          onVolunteerChange={ onVolunteerChange }
        />
      ) : (
        <MobileSelect
          allVolunteers={ volunteers }
          selectedVolunteer={ selectedVolunteer }
          onVolunteerChange={ onVolunteerChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
  disabled?: boolean;
  allVolunteers: Volunteer[] | undefined;
  selectedVolunteer: string | undefined;
  onVolunteerChange: (volunteer: Volunteer) => void;
}

function DesktopSelect({
  disabled,
  allVolunteers,
  selectedVolunteer,
  onVolunteerChange,
}: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedVolunteer, allVolunteers);

  return (
    <Popover modal={ true } open={ open } onOpenChange={ setOpen }>
      <PopoverTrigger asChild>
        <Button
          disabled={ disabled }
          variant="outline"
          className="w-full justify-start group cursor-pointer"
        >
          {selectedValue ? (
            <>
              {selectedValue.name} -{" "}
              {hideDocumentNumber(selectedValue.documentNumber)}
            </>
          ) : (
            <span className="text-placeholder group-hover:text-white">
              Selecione o volunteer
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <VolunteersList
          allVolunteers={ allVolunteers }
          setOpen={ setOpen }
          onVolunteerChange={ onVolunteerChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  allVolunteers,
  selectedVolunteer,
  onVolunteerChange,
}: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedVolunteer, allVolunteers);

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedValue ? (
            <>
              {selectedValue.name} -{" "}
              {hideDocumentNumber(selectedValue.documentNumber)}
            </>
          ) : (
            <span className="text-placeholder">Selecione o volunteer</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <VolunteersList
              allVolunteers={ allVolunteers }
              setOpen={ setOpen }
              onVolunteerChange={ onVolunteerChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface VolunteersListProps {
  setOpen: (_open: boolean) => void;
  onVolunteerChange: (volunteer: Volunteer) => void;
  allVolunteers: Volunteer[] | undefined;
}

function VolunteersList({
  setOpen,
  onVolunteerChange,
  allVolunteers,
}: VolunteersListProps) {
  const handleSelect = (volunteer: Volunteer) => {
    onVolunteerChange(volunteer);
    setOpen(false);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar volunteeres..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allVolunteers?.map((volunteer) => (
            <CommandItem
              key={ volunteer.volunteerId }
              value={ `${volunteer.name} ${volunteer.documentNumber}` }
              onSelect={ () => handleSelect(volunteer) }
            >
              {volunteer.name} - {hideDocumentNumber(volunteer.documentNumber)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function getDisplayValue(
  volunteerName: string | undefined,
  allVolunteers: Volunteer[] | undefined,
): { name: string; documentNumber: string } | null {
  if (!volunteerName || !allVolunteers) return null;

  const volunteer = allVolunteers.find((p) => p.name === volunteerName);
  if (volunteer) {
    return {
      name: volunteer.name,
      documentNumber: volunteer.documentNumber,
    };
  }

  return null;
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
