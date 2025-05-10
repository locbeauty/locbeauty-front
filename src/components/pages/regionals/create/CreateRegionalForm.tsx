"use client";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectEmployee } from "./SelectEmployee";
import { RegionalAddressForm } from "./RegionalAddressForm";
import {
    createRegionalFormSchema,
    CreateRegionalFormSchemaType,
} from "./createRegionalValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";
import PhoneInput from "../../customers/create/PhoneInput";

export function CreateRegionalForm() {
    const createRegionalMethods = useForm<CreateRegionalFormSchemaType>({
        resolver: zodResolver(createRegionalFormSchema),
        defaultValues: {
            manager: "",
        },
    });

    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
    } = createRegionalMethods;

    function handleCreateRegional(newRegionalData: CreateRegionalFormSchemaType) {
        console.log("newRegionalData: ", newRegionalData);
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
                            <Label htmlFor="telefone">Telefone</Label>
                            <PhoneInput register={ register("cellphone") } />
                            { errors.cellphone && (
                                <p className="text-sm font-medium text-destructive">
                                    { errors.cellphone.message }
                                </p>
                            ) }
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
                            { errors.email && (
                                <p className="text-sm font-medium text-destructive">
                                    { errors.email.message }
                                </p>
                            ) }
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gerente">Gerente</Label>
                        <SelectEmployee control={ control } name="manager" />
                        { errors.manager && (
                            <p className="text-sm font-medium text-destructive">
                                { errors.manager.message }
                            </p>
                        ) }
                    </div>

                    <RegionalAddressForm />
                </CardContent>
            </FormProvider>
        </form>
    );
}
