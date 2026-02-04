import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetAllTrainees } from "@/services/trainees.service";
import { GetAllVolunteers } from "@/services/volunteers.service";
import { Trainee } from "@/utils/@types/trainee";
import { Volunteer } from "@/utils/@types/volunteer";
import { toast } from "sonner";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "TRAINEE" | "VOLUNTEER";
  onAdd: (id: string) => Promise<void>;
  excludeIds?: string[];
  filialId?: string;
}

export function AddParticipantDialog({
  open,
  onOpenChange,
  type,
  onAdd,
  excludeIds = [],
  filialId,
}: AddParticipantDialogProps) {
  const [ options, setOptions ] = useState<(Trainee | Volunteer)[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ selectedId, setSelectedId ] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (type === "TRAINEE") {
        const response = await GetAllTrainees(
          filialId ? { filialId } : undefined,
        );
        setOptions(response.data || []);
      } else {
        const response = await GetAllVolunteers(
          filialId ? { filialId } : undefined,
        );
        setOptions(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
      toast.error("Erro ao carregar lista de participantes.");
    } finally {
      setIsLoading(false);
    }
  }, [ type, filialId ]);

  useEffect(() => {
    if (open) {
      loadOptions();
      setSelectedId(null);
    }
  }, [ open, type, loadOptions ]);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    await onAdd(id);
    onOpenChange(false);
  };

  const filteredOptions = options.filter(
    (opt) =>
      !excludeIds.includes(
        type === "TRAINEE"
          ? (opt as Trainee).customerId
          : (opt as Volunteer).volunteerId,
      ),
  );

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>
            Adicionar {type === "TRAINEE" ? "Aluno" : "Modelo"}
          </DialogTitle>
        </DialogHeader>
        <Command className="overflow-hidden rounded-t-none border-t">
          <CommandInput
            placeholder={ `Buscar ${type === "TRAINEE" ? "aluno" : "modelo"}...` }
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const id =
                    type === "TRAINEE"
                      ? (option as Trainee).customerId
                      : (option as Volunteer).volunteerId;
                  const name =
                    type === "TRAINEE"
                      ? (option as Trainee).fullname
                      : (option as Volunteer).name;
                  const isSelected = selectedId === id;

                  return (
                    <CommandItem
                      key={ id }
                      value={ name }
                      onSelect={ () => handleSelect(id) }
                    >
                      <Check
                        className={ cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        ) }
                      />
                      {name}
                    </CommandItem>
                  );
                })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
