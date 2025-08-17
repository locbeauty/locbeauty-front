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
import { fetchWithToken } from "@/utils/fetchWithToken";

export function CreateEmployeeForm() {
    const CreateEmployeeMethods = useForm<CreateEmployeeFormSchemaType>({
        resolver: zodResolver(createEmployeeFormSchema),
    });

    const {
        handleSubmit,
        reset,
        setError
    } = CreateEmployeeMethods;

    async function handleCreateEmployee(newEmployeeData: CreateEmployeeFormSchemaType) {
        try {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/employees/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newEmployeeData)
            });
            const data = await response.json();

            if(!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
                if(response.status === 409) {
                    setError("documentNumber", { message: "Documento já cadastrado." });
                }
            } else {
                toast.success("Funcionário criado com sucesso!", { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
                reset();
            }
        } catch {
            toast.error("Erro ao criar funcionário.");
        }
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
