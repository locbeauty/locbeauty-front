import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Employee } from "@/utils/@types/employee";
import { FormProvider, useForm } from "react-hook-form";
import {
  CreateEmployeeFormSchemaType,
  updateEmployeeFormSchema,
  UpdateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { UpdateEmployeeForm } from "./UpdateEmployeeForm";

interface UpdateEmployeeDialogProps {
  isUpdateEmployeeDialogOpen: boolean;
  selectedEmployee: Employee;
  setSelectedEmployee: Dispatch<SetStateAction<Employee | null>>;
  handleToggleUpdateEmployeeDialog: (
    _openStatus: boolean,
    _employee: Employee | null,
  ) => void;
  onEmployeeUpdated?: (updatedEmployee: Employee) => void;
}

export function UpdateEmployeeDialog({
  isUpdateEmployeeDialogOpen,
  selectedEmployee,
  setSelectedEmployee,
  handleToggleUpdateEmployeeDialog,
  onEmployeeUpdated,
}: UpdateEmployeeDialogProps) {
  const updateEmployeeMethods = useForm<UpdateEmployeeFormSchemaType>({
    resolver: zodResolver(updateEmployeeFormSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, errors, isSubmitting },
  } = updateEmployeeMethods;

  useEffect(() => {
    if (isUpdateEmployeeDialogOpen && selectedEmployee) {
      reset({
        birthdate: selectedEmployee.birthdate
          ? new Date(selectedEmployee.birthdate)
          : null,
        cellphone: selectedEmployee.cellphone,
        username: selectedEmployee.username,
        email: selectedEmployee.email ?? undefined,
        fullname: selectedEmployee.fullname,
        role: selectedEmployee.role,
        sourceFilialId: selectedEmployee.SourceFilial.filialId,
      });
    }
  }, [ reset, selectedEmployee, isUpdateEmployeeDialogOpen ]);

  async function handleUpdateEmployee(
    updatedEmployeeData: UpdateEmployeeFormSchemaType,
  ) {
    const payload = { ...updatedEmployeeData };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/employees/update?employeeId=${selectedEmployee.employeeId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        toast.warning(data.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
      } else {
        toast.success("Funcionário atualizado com sucesso!", {
          style: { fontSize: "1rem" },
        });
        window.scroll({ top: 0 });

        // Update local form state with the new data to prevent reverting to old values
        reset(updatedEmployeeData);

        // Update parent state to ensure consistency if the dialog is reopened or other components depend on it
        // Assuming the response 'data' might simplify contain the updated employee or we just optimistically update part of it.
        // Since we don't know the exact shape of 'data' for sure without checking the backend, we will merge the updates into selectedEmployee.
        // Be careful with types here.
        setSelectedEmployee((prev) => {
          if (!prev) return null;
          const { password, ...rest } = updatedEmployeeData;
          return {
            ...prev,
            ...rest,
            SourceFilial: {
              ...prev.SourceFilial,
              filialId:
                updatedEmployeeData.sourceFilialId ??
                prev.SourceFilial.filialId,
            },
          };
        });

        if (onEmployeeUpdated) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...restData } = updatedEmployeeData;
          const updatedEmployee: Employee = {
            ...selectedEmployee,
            ...restData,
            SourceFilial: {
              ...selectedEmployee.SourceFilial,
              filialId:
                updatedEmployeeData.sourceFilialId ??
                selectedEmployee.SourceFilial.filialId,
            },
          };
          onEmployeeUpdated(updatedEmployee);
        }
      }
    } catch {
      toast.error("Erro ao criar equipamento.");
    }
  }

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
          <form
            id="update-customer-form"
            onSubmit={ handleSubmit(handleUpdateEmployee) }
            className="flex flex-col gap-5 mt-5"
          >
            <FormProvider { ...updateEmployeeMethods }>
              <UpdateEmployeeForm selectedEmployee={ selectedEmployee } />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={ () =>
                    handleToggleUpdateEmployeeDialog(false, selectedEmployee)
                  }
                  disabled={ isSubmitting }
                >
                  Cancelar
                </Button>
                <Button disabled={ !isDirty || isSubmitting } type="submit">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </FormProvider>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
