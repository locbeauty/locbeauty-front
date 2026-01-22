import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { FilialDetailsCard } from "./FilialDetailsCard";
import { Filial } from "@/utils/@types/filials";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

interface FilialDetailsDialogProps {
  handleToggleFilialDetailsDialog: (
    _openStatus: boolean,
    _filial: Filial | null
  ) => void;
  handleToggleUpdateFilialDialog: (
    _openStatus: boolean,
    _filial: Filial | null
  ) => void;
  isFilialDetailsModalOpen: boolean;
  selectedFilial: Filial | null;
}

export function FilialDetailsDialog({
  handleToggleFilialDetailsDialog,
  handleToggleUpdateFilialDialog,
  isFilialDetailsModalOpen,
  selectedFilial,
}: FilialDetailsDialogProps) {
  function handleOpenUpdateFilialDialog() {
    handleToggleFilialDetailsDialog(false, null);
    handleToggleUpdateFilialDialog(true, selectedFilial);
  }
  return (
    <Dialog
      open={ isFilialDetailsModalOpen }
      onOpenChange={ (status) =>
        handleToggleFilialDetailsDialog(status, selectedFilial)
      }
    >
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby={ undefined }
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-3xl font-bold">
            Detalhes da filial:
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <FilialDetailsCard selectedFilial={ selectedFilial } />

          <DialogFooter className="border-t pt-4">
            <Can module={ SYSTEM_MODULES.FILIALS } action="canEdit">
              <Button onClick={ handleOpenUpdateFilialDialog } className="gap-2">
                <Pencil className="h-4 w-4" />
                Editar Filial
              </Button>
            </Can>
            <Button
              variant="outline"
              onClick={ () => handleToggleFilialDetailsDialog(false, null) }
            >
              Fechar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
