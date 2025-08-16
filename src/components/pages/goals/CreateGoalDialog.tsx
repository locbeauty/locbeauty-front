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
import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { getMonthName } from "@/utils/getMonthName";
import { toast } from "sonner";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";

const CreateGoalSchema = z.object({
    filialId: z.string({ message: "Filial é obrigatória" }),
    year: z.number({ message: "Ano é obrigatório" }),
    monthIndex: z.number(),
    targetValue: z.string({ message: "Adicione um valor objetivo" }),
    status: z.enum([ "Concluida", "EM_ANDAMENTO", "NAO_ATINGIDA" ]),
}).refine((data) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return (
        data.year > currentYear ||
        (data.year === currentYear && data.monthIndex >= currentMonth)
    );
}, {
    message: "Não é possível criar metas para meses anteriores",
    path: [ "monthIndex" ],
});

type CreateGoalType = z.infer<typeof CreateGoalSchema>

export function CreateGoalDialog() {
    const [ dialogNovaMeta, setDialogNovaMeta ] = useState(false);

    const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateGoalType>({
        resolver: zodResolver(CreateGoalSchema),
        defaultValues: {
            monthIndex: new Date().getMonth(),
            status: "EM_ANDAMENTO",
            targetValue: ""
        }
    });
    const watchTargetValue = watch("targetValue");

    async function handleCreateGoal(newGoalData: CreateGoalType) {
        const fixedGoalData = {
            ...newGoalData,
            targetValue: parseStringToCents(String(newGoalData.targetValue))
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/goals/create`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(fixedGoalData)
            });

        const data = await response.json();

        if (!response.ok) {
            toast.warning(data.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            toast.success("Meta criada com sucesso!", {
                style: { fontSize: "1rem" },
            });
            window.scroll({ top: 0 });
            setDialogNovaMeta(false);
        }
    }

    return (
        <Dialog open={ dialogNovaMeta } onOpenChange={ setDialogNovaMeta }>
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
                            <div className="space-y-2">
                                <Label htmlFor="valorMeta">Valor da Meta *</Label>
                                {/* <Input
                                    id="valorMeta"
                                    type="number"
                                    { ...register("targetValue", { valueAsNumber: true }) }
                                    placeholder="Ex: 500000"
                                /> */}
                                <PriceInput
                                    register={ register("targetValue") }
                                    value={ watchTargetValue }
                                    setValue={ setValue }
                                    name="targetValue"
                                    withLabel={ false }
                                />
                                <div className="h-3">
                                    {errors.targetValue && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.targetValue.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ano">Ano *</Label>
                                <Input
                                    type="number"
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
                        <Button variant="outline" onClick={ () => setDialogNovaMeta(false) }>
                  Cancelar
                        </Button>
                        <Button>Criar Meta</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}