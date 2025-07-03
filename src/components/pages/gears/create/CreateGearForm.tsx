"use client";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectRegional } from "@/components/shared/SelectRegional";
import {
    createGearFormSchema,
    CreateGearFormSchemaType,
} from "@/lib/zod/CreateGearValidation";
import { toast } from "sonner";
import { TransferableCheckbox } from "../shared/canBeTransferredCheckbox";

export function CreateGearForm() {
    const createGearMethods = useForm<CreateGearFormSchemaType>({
        resolver: zodResolver(createGearFormSchema),
        defaultValues: {
            transferable: false,
            availableUnits: 0,
        },
    });

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        reset,
        formState: { errors },
    } = createGearMethods;

    const acquisitionDate = watch("acquisitionDate");

    async function handleCreateGear(newGearData: CreateGearFormSchemaType) {
        try {
            const response = await fetch("http://localhost:3333/api/gears/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newGearData),
            });
            const data = await response.json();

            if(!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
                // if(response.status === 409) {
                //     setError("documentNumber", { message: "Documento já cadastrado." });
                // }
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
                            {errors.name && (
                                <p className="text-sm text-destructive mt-2">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Regional</Label>
                            <FormProvider { ...createGearMethods }>
                                <SelectRegional<CreateGearFormSchemaType>
                                    control={ control }
                                    name="sourceFilialId"
                                />
                            </FormProvider>
                            {errors.sourceFilialId && (
                                <p className="text-sm text-destructive mt-2">
                                    {errors.sourceFilialId.message}
                                </p>
                            )}
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
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2 flex-1 mt-4">
                    <Label htmlFor="availableUnits">Unidades disponíveis</Label>
                    <Controller
                        control={ control }
                        name="availableUnits"
                        render={ ({ field }) => (
                            <AmountControlButton
                                value={ field.value || 0 }
                                onChange={ field.onChange }
                                error={ !!errors.availableUnits }
                            />
                        ) }
                    />
                    {errors.availableUnits && (
                        <p className="text-sm text-destructive mt-2">
                            {errors.availableUnits.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="acquisitionDate">Data de aquisição</Label>
                        <Controller
                            control={ control }
                            name="acquisitionDate"
                            render={ () => (
                                <DatePicker
                                    placeholder="Selecione a data de aquisição"
                                    value={ acquisitionDate }
                                    onChange={ (date) => {
                                        setValue("acquisitionDate", date!);
                                        trigger("acquisitionDate");
                                    } }
                                    classNames={ {
                                        trigger:
                      errors.acquisitionDate &&
                      "border-destructive focus-visible:ring-destructive",
                                    } }
                                />
                            ) }
                        />
                        {errors.acquisitionDate && (
                            <p className="text-sm text-destructive">
                                {errors.acquisitionDate.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <TransferableCheckbox
                            control={ control }
                            errors={ errors }
                            name="transferable"
                        />
                    </div>
                </div>
            </form>
        </CardContent>
    );
}
