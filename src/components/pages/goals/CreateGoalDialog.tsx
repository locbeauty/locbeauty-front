"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import PriceInput from "@/components/shared/PriceInput";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { CreateGoalDataType, CreateGoalDataWithMoneyInCents, CreateGoalSchema } from "@/lib/zod/CreateGoalValidation";
import { CreateGoal } from "@/services/goals.service";
import { getMonthName } from "@/utils/getMonthName";
import { SelectGear } from "../bookings/create/SelectGear";
import { Gear } from "@/utils/@types/gears";
import { SelectTrainingGear } from "../trainings/SelectTrainingGear";
import { queryClient } from "@/app/(main)/layout";

export function CreateGoalDialog() {
    const [ dialogNovaMeta, setDialogNovaMeta ] = useState(false);
    const [ isSubmitting, setIsSubmitting ] = useState(false); // Adicionado estado de submitting

    const { control, register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CreateGoalDataType>({
        resolver: zodResolver(CreateGoalSchema),
        defaultValues: {
            monthIndex: new Date().getMonth(),
            year: new Date().getFullYear(), // Adicionado ano padrão
            status: "EM_ANDAMENTO",
            goalType: "MONEY", // 4. Definir "Faturamento" como padrão
            targetCents: "",
            targetQuantity: 0,
        }
    });
    const watchTargetCents = watch("targetCents");
    const watchGoalType = watch("goalType"); // 5. Observar o tipo de meta
    const watchFilialId = watch("filialId"); // 5. Observar o tipo de meta
    const [ selectedGearName, setSelectedGearName ] = useState<string | undefined>(undefined);

    useEffect(() => {
        if(selectedGearName) {
            setValue("gearId", selectedGearName);
        }

    }, [ setValue, selectedGearName ]);
    async function handleCreateGoal(newGoalData: CreateGoalDataType) {
        setIsSubmitting(true); // Desabilita o botão
        // 6. Preparar o payload condicionalmente
        let payload: CreateGoalDataWithMoneyInCents;

        if (newGoalData.goalType === "MONEY") {
            // Se for 'MONEY', envie 'targetCents' como centavos
            payload = {
                ...newGoalData,
                goalType: "MONEY", // Garante o tipo correto
                targetCents: parseStringToCents(String(newGoalData.targetCents)), // Converte R$ para centavos
            };
            delete payload.targetQuantity; // Remove o campo não utilizado
        } else { // goalType === "GEAR"
            // Se for 'GEAR', envie 'targetQuantity' como número
            payload = {
                ...newGoalData,
                goalType: "GEAR", // Garante o tipo correto
                targetQuantity: newGoalData.targetQuantity, // Já é um número
                targetCents: undefined
            };
            delete payload.targetCents; // Remove o campo não utilizado
        }

        try {
            console.log("payload: ", payload);
            const response = await CreateGoal(payload);

            if (response.statusCode !== 201) {
                toast.warning(response.message || "Erro desconhecido", { style: { fontSize: "1rem" } });
            } else {
                toast.success("Meta criada com sucesso!", {
                    style: { fontSize: "1rem" },
                });
                queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
                setDialogNovaMeta(false); // Fecha o diálogo
                reset(); // Reseta o formulário
            }
        } catch (error) {
            console.error("Erro ao criar meta:", error);
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsSubmitting(false); // Reabilita o botão
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset(); // Reseta o formulário ao fechar
        }
        setDialogNovaMeta(open);
    };

    // --- FIM DAS MUDANÇAS ---

    return (
        <Dialog open={ dialogNovaMeta } onOpenChange={ handleOpenChange }>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                Nova Meta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={ handleSubmit(handleCreateGoal) }>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Meta Mensal</DialogTitle>
                        <DialogDescription>Defina uma nova meta de vendas para uma filial</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="filial">Filial *</Label>
                                <SelectFilial control={ control } name="filialId" />
                                <div className="h-3">
                                    {errors.filialId && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.filialId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 8. Seletor do Tipo de Meta (Atualizado para MONEY/GEAR) */}
                            <div className="space-y-2">
                                <Label htmlFor="goalType">Tipo de Meta *</Label>
                                <Controller
                                    name="goalType"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value }
                                            onValueChange={ (value: "MONEY" | "GEAR") => {
                                                field.onChange(value);
                                                // Limpa os valores ao trocar o tipo
                                                if(value === "MONEY") {
                                                    setValue("targetQuantity", 0, { shouldValidate: true });
                                                } else {
                                                    setValue("targetCents", "", { shouldValidate: true });
                                                }
                                            } }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MONEY">Faturamento (R$)</SelectItem>
                                                <SelectItem value="GEAR">Máquinas Agendadas (Qtd)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                <div className="h-3">
                                    {/* O Zod cuidará do erro se não for MONEY ou GEAR, mas é improvável */}
                                </div>
                            </div>
                        </div>

                        {/* 9. Renderização Condicional do Input da Meta (Atualizado para MONEY/GEAR) */}
                        {watchGoalType === "MONEY" && (
                            <div className="space-y-2">
                                <Label htmlFor="valorMeta">Valor da Meta (R$) *</Label>
                                <PriceInput
                                    register={ register("targetCents") }
                                    value={ watchTargetCents }
                                    setValue={ setValue }
                                    name="targetCents"
                                    withLabel={ false }
                                />
                                <div className="h-3">
                                    {errors.targetCents && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.targetCents.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {watchGoalType === "GEAR" && (
                            <div className="space-y-2">
                                <SelectTrainingGear
                                    disabled={ !watchFilialId }
                                    selectedGear={ selectedGearName }
                                    onGearChange={ (gearName) => {
                                        setSelectedGearName(gearName);
                                    } }
                                />
                                <Label htmlFor="quantidadeMeta">Qtd. de Máquinas *</Label>
                                <Input
                                    id="quantidadeMeta"
                                    type="number"
                                    { ...register("targetQuantity", { valueAsNumber: true }) }
                                    placeholder="Ex: 50"
                                />
                                <div className="h-3">
                                    {errors.targetQuantity && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.targetQuantity.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ano">Ano *</Label>
                                <Input
                                    type="number"
                                    defaultValue={ new Date().getFullYear() } // Adicionado valor padrão
                                    { ...register("year", { valueAsNumber: true }) }
                                    placeholder="Ex: 2025"
                                />
                                <div className="h-3">
                                    {errors.year && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.year.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mes">Mês *</Label>
                                <Controller
                                    name="monthIndex"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value.toString() }
                                            onValueChange={ (value) => field.onChange(Number(value)) }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione o mês" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <SelectItem key={ i } value={ i.toString() }>
                                                        {getMonthName(i)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                <div className="h-3">
                                    {errors.monthIndex && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.monthIndex.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={ () => handleOpenChange(false) }>
                  Cancelar
                        </Button>
                        <Button type="submit" disabled={ isSubmitting }>
                            {isSubmitting ? "Criando..." : "Criar Meta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}