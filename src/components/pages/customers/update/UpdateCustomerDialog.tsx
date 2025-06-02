import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { UpdateCustomerForm } from "./UpdateCustomerForm";
import { Customer } from "@/utils/@types/customers";

interface UpdateCustomerDialogProps {
  isUpdateCustomerDialogOpen: boolean;
  selectedCustomer: Customer;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
  handleToggleUpdateCustomerDialog: (_openStatus: boolean, _customer: Customer | null) => void;
}

export function UpdateCustomerDialog({
    isUpdateCustomerDialogOpen,
    selectedCustomer,
    handleToggleUpdateCustomerDialog
}: UpdateCustomerDialogProps) {

    const handleSaveUpdatedCustomer = () => {
        console.log("UPDATED:");
    };

    return (
        <Dialog
            open={ isUpdateCustomerDialogOpen }
            onOpenChange={ (status) => handleToggleUpdateCustomerDialog(status, selectedCustomer) }
        >
            <DialogContent
                className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogTitle className="text-3xl font-bold">Edite o cliente:</DialogTitle>
                <div className="space-y-6">

                    <UpdateCustomerForm selectedCustomer={ selectedCustomer } />

                    <DialogFooter>
                        <Button variant="outline" onClick={ () => handleToggleUpdateCustomerDialog(false, selectedCustomer) }>
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
