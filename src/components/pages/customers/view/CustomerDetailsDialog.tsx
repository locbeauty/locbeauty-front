import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/mocks/customers";
import { BookingHistoryCard } from "./BookingHistoryCard";
import { CustomerDetailsCard } from "./CustomerDetailsCard";

interface CustomerDetailsDialogProps {
  handleToggleCustomerDetailsDialog: (_openStatus: boolean, _customer: Customer | null) => void;
  handleToggleUpdateCustomerDialog: (_openStatus: boolean, _customer: Customer | null) => void;
  isCustomerDetailsModalOpen: boolean
  selectedCustomer: Customer | null
}

export function CustomerDetailsDialog({
    handleToggleCustomerDetailsDialog,
    handleToggleUpdateCustomerDialog,
    isCustomerDetailsModalOpen,
    selectedCustomer
}: CustomerDetailsDialogProps) {

    function handleOpenUpdateCustomerDialog() {
        handleToggleCustomerDetailsDialog(false, null);
        handleToggleUpdateCustomerDialog(true, selectedCustomer);
    }

    return (
        <Dialog
            open={ isCustomerDetailsModalOpen }
            onOpenChange={ (status) => handleToggleCustomerDetailsDialog(status, selectedCustomer) }
        >
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-3xl font-bold">Detalhes do Cliente:</DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <CustomerDetailsCard selectedCustomer={ selectedCustomer } />

                    <BookingHistoryCard isCustomerDetailsModalOpen={ isCustomerDetailsModalOpen } selectedCustomer={ selectedCustomer } />
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button onClick={ handleOpenUpdateCustomerDialog } className="gap-2">
                        <Pencil className="h-4 w-4" />
            Editar Cliente
                    </Button>
                    <Button variant="outline" onClick={ () => handleToggleCustomerDetailsDialog(false, selectedCustomer) }>
            Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

