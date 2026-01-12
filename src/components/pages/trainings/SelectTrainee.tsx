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
import { Trainee } from "@/utils/@types/trainee";

interface SelectTraineeProps {
  disabled?: boolean;
  trainees: Trainee[] | undefined;
  selectedTrainee: string | undefined;
  onTraineeChange: (traineeName: string) => void;
}

export function SelectTrainee({
  disabled = false,
  trainees,
  selectedTrainee,
  onTraineeChange,
}: SelectTraineeProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      {isDesktop ? (
        <DesktopSelect
          disabled={ disabled }
          allTrainees={ trainees }
          selectedTrainee={ selectedTrainee }
          onTraineeChange={ onTraineeChange }
        />
      ) : (
        <MobileSelect
          allTrainees={ trainees }
          selectedTrainee={ selectedTrainee }
          onTraineeChange={ onTraineeChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
  disabled?: boolean;
  allTrainees: Trainee[] | undefined;
  selectedTrainee: string | undefined;
  onTraineeChange: (traineeName: string) => void;
}

function DesktopSelect({
  disabled,
  allTrainees,
  selectedTrainee,
  onTraineeChange,
}: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedTrainee, allTrainees);

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
              Selecione o aluno
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <TraineesList
          allTrainees={ allTrainees }
          setOpen={ setOpen }
          onTraineeChange={ onTraineeChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  allTrainees,
  selectedTrainee,
  onTraineeChange,
}: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedTrainee, allTrainees);

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
            <span className="text-placeholder">Selecione o aluno</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <TraineesList
              allTrainees={ allTrainees }
              setOpen={ setOpen }
              onTraineeChange={ onTraineeChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface TraineesListProps {
  setOpen: (_open: boolean) => void;
  onTraineeChange: (traineeName: string) => void;
  allTrainees: Trainee[] | undefined;
}

function TraineesList({
  setOpen,
  onTraineeChange,
  allTrainees,
}: TraineesListProps) {
  const handleSelect = (trainee: Trainee) => {
    onTraineeChange(trainee.name);
    setOpen(false);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar alunos..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allTrainees?.map((trainee) => (
            <CommandItem
              key={ trainee.traineeId }
              value={ `${trainee.name} ${trainee.documentNumber}` }
              onSelect={ () => handleSelect(trainee) }
            >
              {trainee.name} - {hideDocumentNumber(trainee.documentNumber)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function getDisplayValue(
  traineeName: string | undefined,
  allTrainees: Trainee[] | undefined
): { name: string; documentNumber: string } | null {
  if (!traineeName || !allTrainees) return null;

  const trainee = allTrainees.find((s) => s.name === traineeName);
  if (trainee) {
    return {
      name: trainee.name,
      documentNumber: trainee.documentNumber,
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
