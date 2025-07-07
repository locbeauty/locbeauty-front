import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Employee } from "@/utils/@types/employee";
import { UpdateEmployeeForm } from "./UpdateEmployeeForm";

interface UpdateEmployeeDialogProps {
  isUpdateEmployeeDialogOpen: boolean;
  selectedEmployee: Employee;
  setSelectedEmployee: Dispatch<SetStateAction<Employee | null>>;
  handleToggleUpdateEmployeeDialog: (
    _openStatus: boolean,
    _employee: Employee | null
  ) => void;
}

export function UpdateEmployeeDialog({
    isUpdateEmployeeDialogOpen,
    selectedEmployee,
    handleToggleUpdateEmployeeDialog,
}: UpdateEmployeeDialogProps) {
    const handleSaveUpdatedEmployee = () => {
        console.log("UPDATED:");
    };

    return (
        <Dialog
            open={ isUpdateEmployeeDialogOpen }
            onOpenChange={ (status) =>
                handleToggleUpdateEmployeeDialog(status, selectedEmployee)
            }
        >
            <DialogContent
                className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogTitle className="text-3xl font-bold">
          Edite o funcionário:
                </DialogTitle>
                <div className="space-y-6">
                    <UpdateEmployeeForm selectedEmployee={ selectedEmployee } />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={ () =>
                                handleToggleUpdateEmployeeDialog(false, selectedEmployee)
                            }
                        >
              Cancelar
                        </Button>
                        <Button onClick={ handleSaveUpdatedEmployee }>
                            <Save className="mr-2 h-4 w-4" />
              Salvar alterações
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
