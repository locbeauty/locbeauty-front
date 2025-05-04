"use client";

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
import { CreateCustomerFormSchemaType } from "./CreateCustomerForm";
import { StateSelect } from "./StateSelect";

export function CustomerAddressForm() {
    const {
        register,
        formState: { errors },
    } = useFormContext<CreateCustomerFormSchemaType>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
          Preencha os dados de endereço do cliente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input { ...register("city") } placeholder="Cidade" id="cidade" />
                        { errors.city && (
                            <p className="text-sm font-medium text-destructive">
                                { errors.city.message }
                            </p>
                        ) }
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <StateSelect />
                        { errors.UF && (
                            <p className="text-sm font-medium text-destructive">
                                { errors.UF.message }
                            </p>
                        ) }
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                        { ...register("neighborhood") }
                        placeholder="Bairro"
                        id="bairro"
                    />
                    { errors.neighborhood && (
                        <p className="text-sm font-medium text-destructive">
                            { errors.neighborhood.message }
                        </p>
                    ) }
                </div>
                <div className="flex md:flex-row flex-col md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                            { ...register("street") }
                            id="rua"
                            className=""
                            placeholder="Nome da rua"
                        />
                        { errors.street && (
                            <p className="text-sm font-medium text-destructive">
                                { errors.street.message }
                            </p>
                        ) }
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                            { ...register("houseNumber") }
                            id="number"
                            className=""
                            placeholder="Número"
                        />
                        { errors.houseNumber && (
                            <p className="text-sm font-medium text-destructive">
                                { errors.houseNumber.message }
                            </p>
                        ) }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
