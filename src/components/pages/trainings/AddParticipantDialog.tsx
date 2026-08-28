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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  onAdd: (id: string, justification?: string) => Promise<void>;
  excludeIds?: string[];
  /**
   * Documentos (só dígitos) já inscritos na turma. O modelo é escolhido da
   * lista legada de Volunteer, cujo id não compara com o customerId da
   * inscrição — o documento é o que liga as duas representações.
   */
  excludeDocuments?: string[];
  filialId?: string;
  /** Treinamento concluído: o backend exige justificativa para alterar valores. */
  requireJustification?: boolean;
}

export function AddParticipantDialog({
  open,
  onOpenChange,
  type,
  onAdd,
  excludeIds = [],
  excludeDocuments = [],
  filialId,
  requireJustification,
}: AddParticipantDialogProps) {
  const [ options, setOptions ] = useState<(Trainee | Volunteer)[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ selectedId, setSelectedId ] = useState<string | null>(null);
  const [ justification, setJustification ] = useState("");

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
      setJustification("");
    }
  }, [ open, type, loadOptions ]);

  const trimmedJustification = justification.trim();

  const handleSelect = async (id: string) => {
    if (requireJustification && !trimmedJustification) {
      toast.warning(
        "Informe a justificativa para alterar um treinamento concluído.",
      );
      return;
    }

    setSelectedId(id);
    await onAdd(id, trimmedJustification || undefined);
    onOpenChange(false);
  };

  const onlyDigits = (value?: string | null) => (value ?? "").replace(/\D/g, "");
  const excludedDocuments = new Set(excludeDocuments.filter(Boolean));

  const filteredOptions = options.filter((opt) => {
    if (type === "TRAINEE") {
      const trainee = opt as Trainee;
      if (excludeIds.includes(trainee.customerId)) return false;
      const document = onlyDigits(trainee.cpf || trainee.cnpj);
      return !document || !excludedDocuments.has(document);
    }

    const volunteer = opt as Volunteer;
    if (excludeIds.includes(volunteer.volunteerId)) return false;
    const document = onlyDigits(volunteer.documentNumber);
    return !document || !excludedDocuments.has(document);
  });

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>
            Adicionar {type === "TRAINEE" ? "Aluno" : "Modelo"}
          </DialogTitle>
        </DialogHeader>
        {requireJustification && (
          <div className="px-4 pb-3 space-y-1.5">
            <Label htmlFor="add-participant-justification" className="text-xs">
              Justificativa da alteração
            </Label>
            <Textarea
              id="add-participant-justification"
              value={ justification }
              onChange={ (e) => setJustification(e.target.value) }
              placeholder="Descreva o motivo da inclusão neste treinamento concluído"
              className="resize-none"
              rows={ 2 }
            />
          </div>
        )}
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
