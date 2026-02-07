import { Pencil, Trash2, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import { EmployeeDetailsCard } from "./EmployeeDetailsCard";

import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";

interface EmployeeDetailsDialogProps {
  handleToggleEmployeeDetailsDialog: (
    _openStatus: boolean,
    _employee: Employee | null,
  ) => void;
  handleToggleUpdateEmployeeDialog: (
    _openStatus: boolean,
    _employee: Employee | null,
  ) => void;
  handleRestoreEmployee?: (employee: Employee) => void;
  handleHardDeleteEmployee?: (employee: Employee) => void;
  isEmployeeDetailsModalOpen: boolean;
  selectedEmployee: Employee | null;
  isRestoring?: boolean;
  isHardDeleting?: boolean;
}

export function EmployeeDetailsDialog({
  handleToggleEmployeeDetailsDialog,
  handleToggleUpdateEmployeeDialog,
  handleRestoreEmployee,
  handleHardDeleteEmployee,
  isEmployeeDetailsModalOpen,
  selectedEmployee,
  isRestoring = false,
  isHardDeleting = false,
}: EmployeeDetailsDialogProps) {
  const { user } = useAuth();

  function handleOpenUpdateEmployeeDialog() {
    handleToggleEmployeeDetailsDialog(false, null);
    handleToggleUpdateEmployeeDialog(true, selectedEmployee);
  }

  const isVisible = selectedEmployee?.isVisible !== false;

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
            Detalhes do funcionário:
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <EmployeeDetailsCard selectedEmployee={ selectedEmployee } />

          <DialogFooter className="border-t pt-4 flex-wrap gap-2">
            {user?.role === USER_ROLES.MASTER &&
              !isVisible &&
              selectedEmployee && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600 hover:bg-green-50 gap-2"
                  onClick={ () => {
                    handleRestoreEmployee?.(selectedEmployee);
                    handleToggleEmployeeDetailsDialog(false, null);
                  } }
                  disabled={ isRestoring }
                >
                  <RefreshCcw className="h-4 w-4" />
                    Restaurar
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 gap-2"
                  onClick={ () => {
                    handleHardDeleteEmployee?.(selectedEmployee);
                    handleToggleEmployeeDetailsDialog(false, null);
                  } }
                  disabled={ isHardDeleting }
                >
                  <Trash2 className="h-4 w-4" />
                    Excluir Definitivamente
                </Button>
              </>
            )}
            <Can module={ SYSTEM_MODULES.EMPLOYEES } action="canEdit">
              {isVisible && (
                <Button
                  onClick={ handleOpenUpdateEmployeeDialog }
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Editar Funcionário
                </Button>
              )}
            </Can>
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
