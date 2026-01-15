"use client";

import { Switch } from "@/components/ui/switch";
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
import { Controller, useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";

export function CreateGoalDialog() {
  const [ dialogNovaMeta, setDialogNovaMeta ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateGoalDataType>({
    resolver: zodResolver(CreateGoalSchema),
    defaultValues: {
      monthIndex: new Date().getMonth(),
      year: new Date().getFullYear(),
      status: "EM_ANDAMENTO",
      goalType: "MONEY",
      targetCents: "",
      targetQuantity: 0,
      isGlobal: false,
    },
  });

  const watchTargetCents = watch("targetCents");
  const watchGoalType = watch("goalType");
  const watchFilialId = watch("filialId");
  const watchIsGlobal = watch("isGlobal");
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
    if (newGoalData.isGlobal) {
      newGoalData.filialId = null;
    }

    let payload: CreateGoalDataWithMoneyInCents;

    if (newGoalData.goalType === "MONEY") {
      // Se for 'MONEY', envie 'targetCents' como centavos
      payload = {
        ...newGoalData,
        goalType: "MONEY",
        targetCents: parseStringToCents(String(newGoalData.targetCents)),
      };
      delete payload.targetQuantity;
    } else {
      // goalType === "GEAR"
      // Se for 'GEAR', envie 'targetQuantity' como número
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
        toast.warning(response.message || "Erro desconhecido", {
          style: { fontSize: "1rem" },
        });
      } else {
        toast.success("Meta criada com sucesso!", {
          style: { fontSize: "1rem" },
        });
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={ handleSubmit(handleCreateGoal) }>
          <DialogHeader>
            <DialogTitle>Criar Nova Meta Mensal</DialogTitle>
            <DialogDescription>
              Defina uma nova meta de vendas para uma filial
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={ control }
                    name="isGlobal"
                    render={ ({ field }) => (
                      <Switch
                        checked={ field.value }
                        onCheckedChange={ field.onChange }
                        id="global-mode"
                      />
                    ) }
                  />
                  <Label htmlFor="global-mode">
                    Meta Global (Todas as Filiais)
                  </Label>
                </div>
              </div>

              {!watchIsGlobal && (
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
              )}

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
                        if (value === "MONEY") {
                          setValue("targetQuantity", 0, {
                            shouldValidate: true,
                          });
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
                        <SelectItem value="GEAR">
                          Máquinas Agendadas (Qtd)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) }
                />
                <div className="h-3"></div>
              </div>
            </div>

            {watchGoalType === "MONEY" && (
              <div className="space-y-2">
                <Label htmlFor="valorMeta">Valor da Meta (R$) *</Label>
                <PriceInput
                  register={ register("targetCents") }
                  value={ watchTargetCents ?? "" }
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
                  disabled={ !watchFilialId && !watchIsGlobal }
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
                  defaultValue={ new Date().getFullYear() }
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
                      value={ field.value?.toString() ?? "" }
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
      </DialogContent>
    </Dialog>
  );
}
