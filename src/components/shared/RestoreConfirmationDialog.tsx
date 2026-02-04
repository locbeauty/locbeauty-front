import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gear } from "@/utils/@types/gears";

interface RestoreConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isRestoring: boolean;
  itemName?: string;
  itemId?: string;
  setGears?: (gears: Gear[]) => void;
}

export function RestoreConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isRestoring,
  itemName,
  itemId,
  setGears,
}: RestoreConfirmationDialogProps) {
  return (
    <Dialog open={ isOpen } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-[400px] space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <RefreshCcw className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
            {itemName && (
              <>
                {" "}
                <span className="font-bold text-foreground">{itemName}</span>?
              </>
            )}{" "}
            Esta ação fará com que o item volte a ser visível para todos os
            usuários.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={ () => onOpenChange(false) }
            disabled={ isRestoring }
          >
            Cancelar
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={ onConfirm }
            disabled={ isRestoring }
          >
            {isRestoring ? "Restaurando..." : "Confirmar Restauração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
