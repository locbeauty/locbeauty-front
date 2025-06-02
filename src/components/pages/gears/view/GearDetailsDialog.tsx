import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GearDetailsCard } from "./GearDetailsCard";
import { Gear } from "@/utils/@types/gears";

interface GearDetailsDialogProps {
  handleToggleGearDetailsDialog: (_openStatus: boolean, _gear: Gear | null) => void;
  handleToggleUpdateGearDialog: (_openStatus: boolean, _gear: Gear | null) => void;
  isGearDetailsModalOpen: boolean
  selectedGear: Gear | null
}

export function GearDetailsDialog({
    handleToggleGearDetailsDialog,
    handleToggleUpdateGearDialog,
    isGearDetailsModalOpen,
    selectedGear
}: GearDetailsDialogProps) {

    function handleOpenUpdateGearDialog() {
        handleToggleGearDetailsDialog(false, null);
        handleToggleUpdateGearDialog(true, selectedGear);
    }

    return (
        <Dialog
            open={ isGearDetailsModalOpen }
            onOpenChange={ (status) => handleToggleGearDetailsDialog(status, selectedGear) }
        >
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-3xl font-bold">Detalhes do Equipamento:</DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <GearDetailsCard selectedGear={ selectedGear } />

                    <DialogFooter className="border-t pt-4">
                        <Button onClick={ handleOpenUpdateGearDialog } className="gap-2">
                            <Pencil className="h-4 w-4" />
                    Editar equipamento
                        </Button>
                        <Button variant="outline" onClick={ () => handleToggleGearDetailsDialog(false, null) }>
                    Fechar
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}
