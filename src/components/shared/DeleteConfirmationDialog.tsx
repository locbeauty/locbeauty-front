import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting: boolean;
  itemName?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isDeleting,
  itemName,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={ isOpen } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-[400px] space-y-4">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
            {itemName && (
              <>
                {" "}
                <span className="font-bold text-foreground">{itemName}</span>?
              </>
            )}{" "}
            Esta ação ocultará o item para todos os usuários menos para
            administradores de nível Master.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={ () => onOpenChange(false) }
            disabled={ isDeleting }
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={ onConfirm }
            disabled={ isDeleting }
          >
            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
