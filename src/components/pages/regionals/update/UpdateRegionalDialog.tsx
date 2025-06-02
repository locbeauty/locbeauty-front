import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { UpdateRegionalForm } from "./UpdateRegionalForm";
import { Regional } from "@/utils/@types/regionals";

interface UpdateRegionalDialogProps {
  isUpdateRegionalDialogOpen: boolean;
  selectedRegional: Regional;
  setSelectedRegional: Dispatch<SetStateAction<Regional | null>>;
  handleToggleUpdateRegionalDialog: (_openStatus: boolean, _regional: Regional | null) => void;
}

export function UpdateRegionalDialog({
    isUpdateRegionalDialogOpen,
    selectedRegional,
    handleToggleUpdateRegionalDialog
}: UpdateRegionalDialogProps) {

    const handleSaveUpdatedCustomer = () => {
        console.log("UPDATED:");
    };

    return (
        <Dialog
            open={ isUpdateRegionalDialogOpen }
            onOpenChange={ (status) => handleToggleUpdateRegionalDialog(status, selectedRegional) }
        >
            <DialogContent
                className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-5 ml-5">Edite a regional:</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <UpdateRegionalForm selectedRegional={ selectedRegional } />
                    <DialogFooter>
                        <Button variant="outline" onClick={ () => handleToggleUpdateRegionalDialog(false, selectedRegional) }>
                            Cancelar
                        </Button>
                        <Button onClick={ handleSaveUpdatedCustomer }>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar alterações
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
