import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Employee } from "@/utils/@types/employee";
import { UpdateEmployeeForm } from "./UpdateEmployeeForm";
import { FormProvider, useForm } from "react-hook-form";
import { CreateEmployeeFormSchemaType, updateEmployeeFormSchema, UpdateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithToken } from "@/utils/fetchWithToken";

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
    const updateEmployeeMethods = useForm<UpdateEmployeeFormSchemaType>({
        resolver: zodResolver(updateEmployeeFormSchema),
    });

    const { handleSubmit, reset, formState: { isDirty, errors } } = updateEmployeeMethods;

    useEffect(() => {
        if(selectedEmployee) {
            reset({
                birthdate: selectedEmployee.birthdate ? new Date(selectedEmployee.birthdate) : null,
                cellphone: selectedEmployee.cellphone,
                documentNumber: selectedEmployee.documentNumber,
                email: selectedEmployee.email,
                fullname: selectedEmployee.fullname,
                role: selectedEmployee.role,
                sourceFilialId: selectedEmployee.SourceFilial.filialId,
                address: {
                    zipCode: selectedEmployee.Address.zipCode,
                    stateName: selectedEmployee.Address.State.stateName,
                    cityName: selectedEmployee.Address.City.cityName,
                    addressComplement: selectedEmployee.Address.addressComplement,
                    buildingNumber: selectedEmployee.Address.buildingNumber,
                    neighborhoodName: selectedEmployee.Address.Neighborhood.neighborhoodName,
                    streetName: selectedEmployee.Address.Street.streetName
                }
            }
            );
        }
    }, [ reset, selectedEmployee ]);

    async function handleUpdateEmployee(
        updatedEmployeeData: UpdateEmployeeFormSchemaType
    ) {
        try {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/employees/update?employeeId=${selectedEmployee.employeeId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEmployeeData),
            });
            const data = await response.json();

            if (!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
            } else {
                toast.success("Funcionário atualizado com sucesso!", {
                    style: { fontSize: "1rem" },
                });
                window.scroll({ top: 0 });
                reset();
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
                                    onClick={ () =>
                                        handleToggleUpdateEmployeeDialog(false, selectedEmployee)
                                    }
                                >
              Cancelar
                                </Button>
                                <Button disabled={ !isDirty }>
                                    <Save className="mr-2 h-4 w-4" />
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
