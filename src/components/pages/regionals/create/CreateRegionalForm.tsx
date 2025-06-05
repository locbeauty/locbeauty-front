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
import { Textarea } from "@/components/ui/textarea";

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

    function handleCreateRegional(newRegionalData: CreateRegionalFormSchemaType) {
        console.log("newRegionalData: ", newRegionalData);
        toast.success("Regional criada com sucesso!");
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
                            <Label htmlFor="email">Description</Label>
                            <Textarea
                                { ...register("description") }
                                placeholder="Informações adicionais sobre a filial"
                                className="placeholder:text-placeholder max-h-[200px]"
                            />
                        </div>
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

                    <RegionalAddressForm />
                </CardContent>
            </FormProvider>
        </form>
    );
}
