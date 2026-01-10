"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import PriceInput from "@/components/shared/PriceInput";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { parseStringToCents } from "@/utils/parseStringToCents";
import {
    CreateGoalDataType,
    CreateGoalDataWithMoneyInCents,
    CreateGoalSchema,
} from "@/lib/zod/CreateGoalValidation";
import { CreateGoal } from "@/services/goals.service";
import { getMonthName } from "@/utils/getMonthName";
import { SelectTrainingGear } from "../trainings/SelectTrainingGear";
import { queryClient } from "@/app/(main)/layout";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAccess } from "@/contexts/access-provider";
import { useAuth } from "@/contexts/auth-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { USER_ROLES } from "@/utils/constants";

export function CreateGoalDialog() {
    const [ dialogNovaMeta, setDialogNovaMeta ] = useState(false);
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const { user } = useAuth();
    const { getAccessibleFilialsForCreate } = useAccess();

    // Determine accessible filials for select options
    const accessibleFilialsObjects = getAccessibleFilialsForCreate(
        SYSTEM_MODULES.GOALS
    );
    const isRestricted =
    user?.role !== USER_ROLES.ADMIN && user?.role !== USER_ROLES.MASTER;
    const accessibleFilialsIds = isRestricted
        ? accessibleFilialsObjects.map((f) => f.filialId)
        : undefined;

    const defaultFilialId =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? user?.sourceFilial.filialId
        : accessibleFilialsIds?.includes(user?.sourceFilial.filialId || "")
            ? user?.sourceFilial.filialId
            : accessibleFilialsIds?.[0];

    const form = useForm<CreateGoalDataType>({
        resolver: zodResolver(CreateGoalSchema),
        defaultValues: {
            monthIndex: new Date().getMonth(),
            year: new Date().getFullYear(),
            status: "EM_ANDAMENTO",
            goalType: "MONEY",
            targetCents: "",
            targetQuantity: 0,
            filialId: defaultFilialId || "",
        },
    });

    const {
        control,
        setValue,
        watch,
        reset,
        handleSubmit,
        formState: { errors },
    } = form;

    const watchTargetCents = watch("targetCents");
    const watchGoalType = watch("goalType");
    const watchFilialId = watch("filialId");
    const [ selectedGearName, setSelectedGearName ] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
        if (selectedGearName) {
            setValue("gearId", selectedGearName);
        }
    }, [ setValue, selectedGearName ]);

    async function handleCreateGoal(newGoalData: CreateGoalDataType) {
        setIsSubmitting(true);
        let payload: CreateGoalDataWithMoneyInCents;

        if (newGoalData.goalType === "MONEY") {
            payload = {
                ...newGoalData,
                goalType: "MONEY",
                targetCents: parseStringToCents(String(newGoalData.targetCents)),
            };
            delete payload.targetQuantity;
        } else {
            payload = {
                ...newGoalData,
                goalType: "GEAR",
                targetQuantity: newGoalData.targetQuantity,
                targetCents: undefined,
            };
            delete payload.targetCents;
        }

        try {
            const response = await CreateGoal(payload);

            if (response.statusCode !== 201) {
                toast.warning(response.message || "Erro desconhecido");
            } else {
                toast.success("Meta criada com sucesso!");
                queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
                setDialogNovaMeta(false);
                reset();
            }
        } catch (error) {
            console.error("Erro ao criar meta:", error);
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
        }
        setDialogNovaMeta(open);
    };

    return (
        <Dialog open={ dialogNovaMeta } onOpenChange={ handleOpenChange }>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
          Nova Meta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Meta Mensal</DialogTitle>
                    <DialogDescription>
            Defina uma nova meta de vendas para uma filial
                    </DialogDescription>
                </DialogHeader>

                <Form { ...form }>
                    <form onSubmit={ handleSubmit(handleCreateGoal) } className="space-y-6">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Filial - Custom Integration */}
                                <div className="space-y-2">
                                    <FormLabel
                                        className={ errors.filialId ? "text-destructive" : "" }
                                    >
                    Filial *
                                    </FormLabel>
                                    <SelectFilial
                                        control={ control }
                                        name="filialId"
                                        accessibleFilials={ accessibleFilialsIds }
                                    />
                                    {errors.filialId && (
                                        <p className="text-[0.8rem] font-medium text-destructive">
                                            {errors.filialId.message}
                                        </p>
                                    )}
                                </div>

                                <FormField
                                    control={ control }
                                    name="goalType"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Meta *</FormLabel>
                                            <Select
                                                onValueChange={ (value: "MONEY" | "GEAR") => {
                                                    field.onChange(value);
                                                    if (value === "MONEY") {
                                                        setValue("targetQuantity", 0, {
                                                            shouldValidate: true,
                                                        });
                                                    } else {
                                                        setValue("targetCents", "", {
                                                            shouldValidate: true,
                                                        });
                                                    }
                                                } }
                                                defaultValue={ field.value }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MONEY">
                            Faturamento (R$)
                                                    </SelectItem>
                                                    <SelectItem value="GEAR">
                            Máquinas Agendadas (Qtd)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            {watchGoalType === "MONEY" && (
                                <FormField
                                    control={ control }
                                    name="targetCents"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <PriceInput
                                                    withLabel={ true }
                                                    value={ field.value as string }
                                                    onChange={ field.onChange }
                                                    error={ errors.targetCents?.message }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            )}

                            {watchGoalType === "GEAR" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <FormLabel>Equipamento *</FormLabel>
                                        <SelectTrainingGear
                                            disabled={ !watchFilialId }
                                            selectedGear={ selectedGearName }
                                            onGearChange={ (gearName) => {
                                                setSelectedGearName(gearName);
                                            } }
                                        />
                                    </div>
                                    <FormField
                                        control={ control }
                                        name="targetQuantity"
                                        render={ ({ field }) => (
                                            <FormItem>
                                                <FormLabel>Qtd. de Máquinas *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Ex: 50"
                                                        { ...field }
                                                        onChange={ (e) =>
                                                            field.onChange(e.target.valueAsNumber)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={ control }
                                    name="year"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ano *</FormLabel>
                                            <Select
                                                onValueChange={ (val) => field.onChange(Number(val)) }
                                                value={ field.value?.toString() }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o ano" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Array.from({ length: 2 }, (_, i) => {
                                                        const y = new Date().getFullYear() + i;
                                                        return (
                                                            <SelectItem key={ y } value={ y.toString() }>
                                                                {y}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ control }
                                    name="monthIndex"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mês *</FormLabel>
                                            <Select
                                                onValueChange={ (val) => field.onChange(Number(val)) }
                                                value={ field.value?.toString() }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o mês" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <SelectItem key={ i } value={ i.toString() }>
                                                            {getMonthName(i)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={ () => handleOpenChange(false) }
                            >
                Cancelar
                            </Button>
                            <Button type="submit" disabled={ isSubmitting }>
                                {isSubmitting ? "Criando..." : "Criar Meta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
