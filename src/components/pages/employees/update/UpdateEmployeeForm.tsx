import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee } from "@/utils/@types/employee";
import {
    createEmployeeFormSchema,
    CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { EmployeeForm } from "../forms/EmployeeForm";
import { UpdateEmployeeDialog } from "./UpdateEmployeeDialog";
import { FilialUpdateAddressForm } from "../../filials/update/FilialUpdateAddressForm";
import { useEffect } from "react";

interface UpdateEmployeeFormProps {
  selectedEmployee: Employee;
}

export function UpdateEmployeeForm({
    selectedEmployee,
}: UpdateEmployeeFormProps) {

    // useEffect(() => {
    //     if (selectedEmployee) {
    //         reset({

    //         });
    //     }
    // }, [ selectedEmployee, reset ]);

    return (
        <>
            <EmployeeForm />
            <FilialUpdateAddressForm />
        </>
    );
}
