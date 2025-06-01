import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogTitle
} from "@/components/ui/dialog";
import { Regional } from "@/utils/mocks/regionals";
import { Pencil } from "lucide-react";
import { RegionalDetailsCard } from "./RegionalDetailsCard";

interface RegionalDetailsDialogProps {
  handleToggleRegionalDetailsDialog: (_openStatus: boolean, _regional: Regional | null) => void;
  handleToggleUpdateRegionalDialog: (_openStatus: boolean, _regional: Regional | null) => void;
  isRegionalDetailsModalOpen: boolean
  selectedRegional: Regional | null
}

export function RegionalDetailsDialog({ handleToggleRegionalDetailsDialog, handleToggleUpdateRegionalDialog, isRegionalDetailsModalOpen, selectedRegional }: RegionalDetailsDialogProps) {

    function handleOpenUpdateRegionalDialog() {
        handleToggleRegionalDetailsDialog(false, null);
        handleToggleUpdateRegionalDialog(true, selectedRegional);
    }
    return (
        <Dialog
            open={ isRegionalDetailsModalOpen }
            onOpenChange={ (status) => handleToggleRegionalDetailsDialog(status, selectedRegional) }
        >
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-3xl font-bold">Detalhes da regional:</DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <RegionalDetailsCard selectedRegional={ selectedRegional } />

                    <DialogFooter className="border-t pt-4">
                        <Button onClick={ handleOpenUpdateRegionalDialog } className="gap-2">
                            <Pencil className="h-4 w-4" />
                    Editar Cliente
                        </Button>
                        <Button variant="outline" onClick={ () => handleToggleRegionalDetailsDialog(false, null) }>
                    Fechar
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}