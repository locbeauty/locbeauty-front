import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee } from "@/utils/@types/employees";
import {
    createEmployeeFormSchema,
    CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { EmployeeForm } from "../forms/EmployeeForm";

interface UpdateEmployeeFormProps {
  selectedEmployee: Employee;
}

export function UpdateEmployeeForm({
    selectedEmployee,
}: UpdateEmployeeFormProps) {
    const updateEmployeeMethods = useForm<CreateEmployeeFormSchemaType>({
        resolver: zodResolver(createEmployeeFormSchema),
        defaultValues: {
            birthdate: selectedEmployee.birthdate,
            cellphone: selectedEmployee.cellphone,
            address: {
                zipCode: selectedEmployee.address.zipCode,
                cityName: selectedEmployee.address.city,
                buildingNumber: selectedEmployee.address.buildingNumber,
                addressComplement: selectedEmployee.address.addressComplement,
                neighborhoodName: selectedEmployee.address.neighborhood,
                stateName: selectedEmployee.address.state.stateName,
            },
            CPF: selectedEmployee.CPF,
            email: selectedEmployee.email,
            fullname: selectedEmployee.fullname,
            role: selectedEmployee.role,
            sourceRegionalId: selectedEmployee.sourceRegionalId,
        },
    });

    const { handleSubmit } = updateEmployeeMethods;

    function handleUpdateEmployee(
        updatedEmployeeData: CreateEmployeeFormSchemaType
    ) {
    // TODO: selecionar as informações antes de enviar pra
        console.log("updatedEmployeeData: ", updatedEmployeeData);
        toast.success("Funcionário editado com sucesso!");
    }
    return (
        <form
            id="update-customer-form"
            onSubmit={ handleSubmit(handleUpdateEmployee) }
            className="flex flex-col gap-5 mt-5"
        >
            <FormProvider { ...updateEmployeeMethods }>
                <EmployeeForm />
            </FormProvider>
        </form>
    );
}
