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
import { CreateRegionalFormSchemaType } from "@/lib/zod/CreateRegionalValidation";

export function RegionalAddressForm() {
    const {
        register,
        formState: { errors },
    } = useFormContext<CreateRegionalFormSchemaType>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
          Preencha os dados de endereço do cliente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <CEPInput />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                            disabled
                            { ...register("city") }
                            placeholder="Cidade"
                            className=""
                            id="cidade"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                            disabled
                            { ...register("state") }
                            placeholder="Estado"
                            className=""
                            id="cidade"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                        disabled
                        { ...register("neighborhood") }
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
                            { ...register("street") }
                            id="rua"
                            className="placeholder:text-placeholder"
                            placeholder="Nome da rua"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                            { ...register("houseNumber") }
                            id="number"
                            className="placeholder:text-placeholder"
                            placeholder="Número"
                        />
                        {errors.houseNumber && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.houseNumber.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="number">Complemento</Label>

                    <Textarea
                        { ...register("addressComplement") }
                        className="h-[120px] resize-none max-w-[80vw] placeholder:text-placeholder"
                        placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
