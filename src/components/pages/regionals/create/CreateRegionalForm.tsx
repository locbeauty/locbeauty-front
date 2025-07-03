"use client";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectEmployee } from "./SelectEmployee";
import { RegionalAddressForm } from "./RegionalAddressForm";
import {
    createRegionalFormSchema,
    CreateRegionalFormSchemaType,
} from "@/lib/zod/CreateRegionalValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import PhoneInput from "../../../shared/PhoneInput";
import { toast } from "sonner";

export function CreateRegionalForm() {
    const createRegionalMethods = useForm<CreateRegionalFormSchemaType>({
        resolver: zodResolver(createRegionalFormSchema),
    });

    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
    } = createRegionalMethods;

    async function handleCreateRegional(newRegionalData: CreateRegionalFormSchemaType) {
        try {
            const response = await fetch("http://localhost:3333/api/filials/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newRegionalData)
            });
            const data = await response.json();

            if(!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
                // if(response.status === 409) {
                //     setError("documentNumber", { message: "Documento já cadastrado." });
                // }
            } else {
                toast.success("Filial criado com sucesso!", { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
                // reset();
            }
        } catch {
            toast.error("Erro ao criar filial.");
        }
    }

    return (
        <form
            id="create-regional-form"
            onSubmit={ handleSubmit(handleCreateRegional) }
            className="flex flex-col gap-5"
        >
            <FormProvider { ...createRegionalMethods }>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Descrição</Label>
                            <Input
                                { ...register("description") }
                                placeholder="Identificador da filial"
                                className="placeholder:text-placeholder max-h-[200px]"
                            />
                        </div>
                        <div className="space-y-2 w-[196px]">
                            <Label htmlFor="telefone">Telefone</Label>
                            <PhoneInput register={ register("cellphone") } />
                            {errors.cellphone && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.cellphone.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                { ...register("email") }
                                id="email"
                                type="email"
                                placeholder="email@exemplo.com"
                                className="placeholder:text-placeholder"
                            />
                            {errors.email && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gerente">Gerente</Label>
                            <SelectEmployee control={ control } name="managerEmployeeId" />
                            {errors.managerEmployeeId && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.managerEmployeeId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <RegionalAddressForm />
                </CardContent>
            </FormProvider>
        </form>
    );
}
