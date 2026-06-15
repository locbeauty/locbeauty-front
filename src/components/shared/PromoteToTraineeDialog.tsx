import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromoteToTraineeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function PromoteToTraineeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: PromoteToTraineeDialogProps) {
  return (
    <Dialog open={ isOpen } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-[440px] space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> Cadastrar também
            como aluno?
          </DialogTitle>
          <DialogDescription className="text-center">
            Esse CPF/CNPJ já pertence a um cliente. Deseja cadastrá-lo também
            como aluno? Ele continuará aparecendo na lista de clientes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={ () => onOpenChange(false) }
            disabled={ isLoading }
          >
            Cancelar
          </Button>
          <Button onClick={ onConfirm } disabled={ isLoading }>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GraduationCap className="mr-2 h-4 w-4" />
            )}
            Cadastrar como aluno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
