"use client";

import type React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import CEPInput from "@/components/shared/CEPInput";
import { CreateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";

export function EmployeeAddressForm() {
    const {
        register,
        trigger,
        clearErrors,
        control,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext<CreateEmployeeFormSchemaType>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
          Preencha os dados de endereço do cliente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <CEPInput
                    clearErrors={ clearErrors }
                    control={ control }
                    setError={ setError }
                    setValue={ setValue }
                    trigger={ trigger }
                    zipCodeError={ errors.address?.zipCode?.message }
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                            disabled
                            { ...register("address.city") }
                            placeholder="Cidade"
                            className=""
                            id="cidade"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                            disabled
                            { ...register("address.state.title") }
                            placeholder="Estado"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                        disabled
                        { ...register("address.neighborhood") }
                        placeholder="Bairro"
                        className="placeholder:text-placeholder"
                        id="bairro"
                    />
                </div>
                <div className="flex md:flex-row flex-col md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                            disabled
                            { ...register("address.street") }
                            id="rua"
                            className="placeholder:text-placeholder"
                            placeholder="Nome da rua"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                            { ...register("address.buildingNumber") }
                            id="number"
                            className="placeholder:text-placeholder"
                            placeholder="Número"
                        />
                        {errors.address?.buildingNumber && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.address.buildingNumber.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="number">Complemento</Label>

                    <Textarea
                        { ...register("address.addressComplement") }
                        className="h-[120px] resize-none max-w-[80vw] placeholder:text-placeholder"
                        placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
