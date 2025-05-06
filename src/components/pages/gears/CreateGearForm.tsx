"use client";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    createGearFormSchema,
    type CreateGearFormSchemaType,
} from "./CreateGearValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectRegional } from "../../shared/SelectRegional";
import { Checkbox } from "@/components/ui/checkbox";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { SingleDatePicker } from "@/components/shared/SingleDatePicker";

export function CreateGearForm() {
    const createGearMethods = useForm<CreateGearFormSchemaType>({
        resolver: zodResolver(createGearFormSchema),
        defaultValues: {
            sourceRegional: "",
            canBeTransferred: false,
            availableUnits: 1,
        },
    });

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = createGearMethods;

    function handleCreateGear(data: CreateGearFormSchemaType) {
        console.log("data: ", data);
    }

    return (
        <CardContent className="">
            <form id="create-gear-form" onSubmit={ handleSubmit(handleCreateGear) }>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="name">Nome do equipamento</Label>
                            <Input
                                id="name"
                                placeholder="Nome do equipamento"
                                className={ `placeholder:text-sm placeholder:text-placeholder ${
                                    errors.name
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                }` }
                                { ...register("name") }
                            />
                            { errors.name && (
                                <p className="text-sm text-destructive mt-2">
                                    { errors.name.message }
                                </p>
                            ) }
                        </div>
                        <div className="space-y-2">
                            <Label>Regional</Label>
                            <FormProvider { ...createGearMethods }>
                                <SelectRegional<CreateGearFormSchemaType>
                                    control={ control }
                                    name="sourceRegional"
                                />
                            </FormProvider>
                            { errors.sourceRegional && (
                                <p className="text-sm text-destructive mt-2">
                                    { errors.sourceRegional.message }
                                </p>
                            ) }
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            placeholder="Descreva o equipamento"
                            className={ `placeholder:text-sm placeholder:text-placeholder ${
                                errors.description
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }` }
                            { ...register("description") }
                        />
                        { errors.description && (
                            <p className="text-sm text-destructive">
                                { errors.description.message }
                            </p>
                        ) }
                    </div>
                </div>
                <div className="space-y-2 flex-1 mt-4">
                    <Label htmlFor="availableUnits">Unidades disponíveis</Label>
                    <Controller
                        control={ control }
                        name="availableUnits"
                        render={ ({ field }) => (
                            <AmountControlButton
                                value={ field.value || 1 }
                                onChange={ field.onChange }
                                error={ !!errors.availableUnits }
                            />
                        ) }
                    />
                    { errors.availableUnits && (
                        <p className="text-sm text-destructive mt-2">
                            { errors.availableUnits.message }
                        </p>
                    ) }
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="acquisitionDate">Data de aquisição</Label>
                        <Controller
                            control={ control }
                            name="acquisitionDate"
                            render={ () => (
                                <SingleDatePicker
                                    control={ control }
                                    name="acquisitionDate"
                                    placeholder="Selecione a data de aquisição"
                                    className={ `placeholder:text-sm placeholder:text-placeholder ${
                                        errors.acquisitionDate
                                            ? "border-destructive focus-visible:ring-destructive"
                                            : ""
                                    }` }
                                />
                            ) }
                        />
                        { errors.acquisitionDate && (
                            <p className="text-sm text-destructive">
                                { errors.acquisitionDate.message }
                            </p>
                        ) }
                    </div>
                    <div>
                        <Controller
                            control={ control }
                            name="canBeTransferred"
                            render={ ({ field }) => (
                                <div className="flex items-center h-full">
                                    <div
                                        className={ `bg-white dark:bg-gray-800 rounded-lg p-4 border ${
                                            errors.canBeTransferred
                                                ? "border-destructive"
                                                : "border-gray-200 dark:border-gray-700"
                                        } w-full flex items-center space-x-3` }
                                    >
                                        <Checkbox
                                            id="canBeTransferred"
                                            checked={ field.value }
                                            onCheckedChange={ field.onChange }
                                        />
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="canBeTransferred"
                                                className={ `font-medium cursor-pointer ${
                                                    errors.canBeTransferred ? "text-destructive" : ""
                                                }` }
                                            >
                        Pode ser transferido?
                                            </Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                        Marque esta opção se o equipamento pode ser transferido
                        entre regionais
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) }
                        />
                    </div>
                </div>
            </form>
        </CardContent>
    );
}
