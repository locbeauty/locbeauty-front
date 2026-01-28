import { useEffect, useState } from "react";
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
}

export function AddParticipantDialog({
  open,
  onOpenChange,
  type,
  onAdd,
  excludeIds = [],
}: AddParticipantDialogProps) {
  const [ options, setOptions ] = useState<(Trainee | Volunteer)[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ selectedId, setSelectedId ] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadOptions();
      setSelectedId(null);
    }
  }, [ open, type ]);

  const loadOptions = async () => {
    setIsLoading(true);
    try {
      if (type === "TRAINEE") {
        const response = await GetAllTrainees();
        setOptions(response.data || []);
      } else {
        const response = await GetAllVolunteers();
        setOptions(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
      toast.error("Erro ao carregar lista de participantes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    await onAdd(id);
    onOpenChange(false);
  };

  const filteredOptions = options.filter(
    (opt) =>
      !excludeIds.includes(
        type === "TRAINEE"
          ? (opt as Trainee).traineeId
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
                      ? (option as Trainee).traineeId
                      : (option as Volunteer).volunteerId;
                  const name = option.name;
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
