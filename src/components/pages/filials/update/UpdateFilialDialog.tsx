import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { UpdateFilialForm } from "./UpdateFilialForm";
import { Filial } from "@/utils/@types/filials";

interface UpdateFilialDialogProps {
  isUpdateFilialDialogOpen: boolean;
  selectedFilial: Filial;
  setSelectedFilial: Dispatch<SetStateAction<Filial | null>>;
  handleToggleUpdateFilialDialog: (
    _openStatus: boolean,
    _filial: Filial | null
  ) => void;
}

export function UpdateFilialDialog({
    isUpdateFilialDialogOpen,
    selectedFilial,
    handleToggleUpdateFilialDialog,
}: UpdateFilialDialogProps) {
    const handleSaveUpdatedCustomer = () => {
        console.log("UPDATED2:");
    };

    return (
        <Dialog
            open={ isUpdateFilialDialogOpen }
            onOpenChange={ (status) =>
                handleToggleUpdateFilialDialog(status, selectedFilial)
            }
        >
            <DialogContent
                className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-5 ml-5">
            Edite a filial:
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <UpdateFilialForm selectedFilial={ selectedFilial } />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={ () =>
                                handleToggleUpdateFilialDialog(false, selectedFilial)
                            }
                        >
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
