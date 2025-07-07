import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import { EmployeeDetailsCard } from "./EmployeeDetailsCard";

interface EmployeeDetailsDialogProps {
  handleToggleEmployeeDetailsDialog: (
    _openStatus: boolean,
    _employee: Employee | null
  ) => void;
  handleToggleUpdateEmployeeDialog: (
    _openStatus: boolean,
    _employee: Employee | null
  ) => void;
  isEmployeeDetailsModalOpen: boolean;
  selectedEmployee: Employee | null;
}

export function EmployeeDetailsDialog({
    handleToggleEmployeeDetailsDialog,
    handleToggleUpdateEmployeeDialog,
    isEmployeeDetailsModalOpen,
    selectedEmployee,
}: EmployeeDetailsDialogProps) {
    function handleOpenUpdateEmployeeDialog() {
        handleToggleEmployeeDetailsDialog(false, null);
        handleToggleUpdateEmployeeDialog(true, selectedEmployee);
    }

    return (
        <Dialog
            open={ isEmployeeDetailsModalOpen }
            onOpenChange={ (status) =>
                handleToggleEmployeeDetailsDialog(status, selectedEmployee)
            }
        >
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-3xl font-bold">
            Detalhes do Cliente:
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <EmployeeDetailsCard selectedEmployee={ selectedEmployee } />
                    <DialogFooter className="border-t pt-4">
                        <Button onClick={ handleOpenUpdateEmployeeDialog } className="gap-2">
                            <Pencil className="h-4 w-4" />
              Editar Cliente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={ () =>
                                handleToggleEmployeeDetailsDialog(false, selectedEmployee)
                            }
                        >
              Fechar
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
