"use client";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
    createEmployeeFormSchema,
    CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectRegional } from "@/components/shared/SelectRegional";
import DocumentInput from "../../../shared/DocumentInput";
import { SelectRole } from "@/components/shared/SelectRole";
import PhoneInput from "../../../shared/PhoneInput";
import { toast } from "sonner";

export function CreateEmployeeForm() {
    const {
        control,
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<CreateEmployeeFormSchemaType>({
        resolver: zodResolver(createEmployeeFormSchema),
        defaultValues: {
            sourceRegional: "",
            role: "",
        },
    });

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
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                            { ...register("employeeName") }
                            id="nome"
                            placeholder="Nome completo"
                            className="placeholder:text-placeholder"
                        />
                        <div className="h-3">
                            {errors.employeeName && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.employeeName.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <DocumentInput documentType="CPF" register={ register("CPF") } />
                        <div className="h-3">
                            {errors.CPF && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.CPF.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Cargo:</Label>
                        <SelectRole control={ control } name="role" />
                        <div className="h-3">
                            {errors.role && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.role.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nome">Regional:</Label>
                        <SelectRegional control={ control } name="sourceRegional" />
                        <div className="h-3">
                            {errors.sourceRegional && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.sourceRegional.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <PhoneInput register={ register("cellphone") } />
                        <div className="h-3">
                            {errors.cellphone && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.cellphone.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            { ...register("email") }
                            id="email"
                            type="email"
                            placeholder="exemple@exemple.com"
                            className="placeholder:text-placeholder"
                        />
                        <div className="h-3">
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </CardContent>
    );
}
