"use client";

import { CardContent } from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import {
    createEmployeeFormSchema,
    CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EmployeeForm } from "../forms/EmployeeForm";
import { EmployeeAddressForm } from "../forms/EmployeeAddressForm";

export function CreateEmployeeForm() {
    const CreateEmployeeMethods = useForm<CreateEmployeeFormSchemaType>({
        resolver: zodResolver(createEmployeeFormSchema),
    });

    const {
        handleSubmit,
    } = CreateEmployeeMethods;

    async function handleCreateEmployee(newEmployeeData: CreateEmployeeFormSchemaType) {
        console.log("newEmployeeData: ", newEmployeeData);
        toast.success("Funcionário criado com sucesso!");
    }

    return (
        <CardContent>
            <form
                id="create-employee-form"
                className="space-y-6"
                onSubmit={ handleSubmit(handleCreateEmployee) }
            >
                <FormProvider { ...CreateEmployeeMethods }>
                    <EmployeeForm />
                    <EmployeeAddressForm />
                </FormProvider>
            </form>
        </CardContent>
    );
}
