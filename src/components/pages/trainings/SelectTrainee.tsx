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

import { useQuery } from "@tanstack/react-query";
import { GetAllTrainees } from "@/services/trainees.service";
import { ApiResponse } from "@/lib/api";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SelectTraineeProps {
  disabled?: boolean;
  filialId: string | undefined;
  selectedTraineeIds: string[];
  onTraineesChange: (trainees: Trainee[]) => void;
}

export function SelectTrainee({
  disabled = false,
  filialId,
  selectedTraineeIds,
  onTraineesChange,
}: SelectTraineeProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: traineesData } = useQuery<ApiResponse<Trainee[]>, Error>({
    queryKey: [ "get-all-trainees", filialId ],
    queryFn: () => GetAllTrainees({ filialId: filialId || undefined }),
    enabled: Boolean(filialId),
    staleTime: 1000 * 60,
  });

  const trainees = traineesData?.data;

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      {isDesktop ? (
        <DesktopSelect
          disabled={ disabled || !filialId }
          allTrainees={ trainees }
          selectedTraineeIds={ selectedTraineeIds }
          onTraineesChange={ onTraineesChange }
        />
      ) : (
        <MobileSelect
          allTrainees={ trainees }
          selectedTraineeIds={ selectedTraineeIds }
          onTraineesChange={ onTraineesChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
  disabled?: boolean;
  allTrainees: Trainee[] | undefined;
  selectedTraineeIds: string[];
  onTraineesChange: (trainees: Trainee[]) => void;
}

function DesktopSelect({
  disabled,
  allTrainees,
  selectedTraineeIds,
  onTraineesChange,
}: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedCount = selectedTraineeIds.length;

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
            <span className="text-muted-foreground">Selecione os alunos</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <TraineesList
          allTrainees={ allTrainees }
          selectedTraineeIds={ selectedTraineeIds }
          onTraineesChange={ onTraineesChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  allTrainees,
  selectedTraineeIds,
  onTraineesChange,
}: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedCount = selectedTraineeIds.length;

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedCount > 0 ? (
            <Badge variant="secondary">{selectedCount} selecionado(s)</Badge>
          ) : (
            <span className="text-muted-foreground">Selecione os alunos</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <TraineesList
              allTrainees={ allTrainees }
              selectedTraineeIds={ selectedTraineeIds }
              onTraineesChange={ onTraineesChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface TraineesListProps {
  allTrainees: Trainee[] | undefined;
  selectedTraineeIds: string[];
  onTraineesChange: (trainees: Trainee[]) => void;
}

function TraineesList({
  allTrainees,
  selectedTraineeIds,
  onTraineesChange,
}: TraineesListProps) {
  const handleSelect = (trainee: Trainee) => {
    const isSelected = selectedTraineeIds.includes(trainee.traineeId);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedTraineeIds.filter(
        (id) => id !== trainee.traineeId,
      );
    } else {
      newSelectedIds = [ ...selectedTraineeIds, trainee.traineeId ];
    }

    const newSelectedTrainees =
      allTrainees?.filter((t) => newSelectedIds.includes(t.traineeId)) || [];

    onTraineesChange(newSelectedTrainees);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar alunos..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allTrainees?.map((trainee) => {
            const isSelected = selectedTraineeIds.includes(trainee.traineeId);
            return (
              <CommandItem
                key={ trainee.traineeId }
                value={ `${trainee.name} ${trainee.documentNumber}` }
                onSelect={ () => handleSelect(trainee) }
              >
                <Check
                  className={ cn(
                    "mr-2 h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                  ) }
                />
                {trainee.name} - {hideDocumentNumber(trainee.documentNumber)}
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
