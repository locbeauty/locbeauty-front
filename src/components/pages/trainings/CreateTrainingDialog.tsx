"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/DatePicker";

// Components
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { SelectTrainee } from "./SelectTrainee";
import { EmbeddedTrainingAddressForm } from "./EmbeddedTrainingAddressForm";
import { SelectFilial } from "@/components/shared/SelectFilial";
import PriceInput from "@/components/shared/PriceInput";

// Services & Utils
import { CreateTraining } from "@/services/trainings.service";
import { CreateGenericAddress } from "@/services/addresses.service";
import {
  getDayCheckouts,
  GetDayCheckoutsResponse,
} from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";

// Types & Schemas
import {
  CreateTrainingBackendPayload,
  NewTrainingDataType,
  NewTrainingSchema,
  TrainingChargePayload,
  TrainingParticipantPayload,
} from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import { Trainee } from "@/utils/@types/trainee";

interface CreateTrainingDialogProps {
  dialogNovoTreinamento: boolean;
  setDialogNovoTreinamento: (openStatus: boolean) => void;
  gears: Gear[] | undefined;
}

const MAX_CAPACITY = 15;

export function CreateTrainingDialog({
  dialogNovoTreinamento,
  setDialogNovoTreinamento,
  gears,
}: CreateTrainingDialogProps) {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.TRAININGS);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const defaultFilialId =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? user?.sourceFilialId
      : accessibleFilialsIds?.includes(user?.sourceFilialId || "")
        ? user?.sourceFilialId
        : accessibleFilialsIds?.[0];

  const emptyDefaults = (): NewTrainingDataType =>
    ({
      filialId: defaultFilialId || "",
      gearId: "",
      trainingType: "COMUM",
      buildingNumber: "",
      participants: [],
    }) as unknown as NewTrainingDataType;

  const methods = useForm<NewTrainingDataType>({
    resolver: zodResolver(NewTrainingSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: emptyDefaults(),
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
    reset,
    register,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
    keyName: "key",
  });

  const [ selectedTrainees, setSelectedTrainees ] = useState<Trainee[]>([]);

  const watchFilialId = watch("filialId");
  const watchSelectedGear = watch("gearId");
  const watchDueDate = watch("dueDate");
  const watchHour = watch("hourInMinutes");
  const watchTrainingType = watch("trainingType");
  const selectedParticipantIds = fields.map((f) => f.customerId);

  // --- Sincroniza a seleção de pessoas com o field array de participantes ---
  const handleTraineesChange = (trainees: Trainee[]) => {
    setSelectedTrainees(trainees);

    // Adiciona novos
    trainees.forEach((t) => {
      const exists = fields.some((f) => f.customerId === t.customerId);
      if (!exists) {
        append({
          customerId: t.customerId,
          name: t.fullname,
          document: t.cpf || t.cnpj || "",
          isTrainee: true,
          isModel: false,
          observations: "",
          baseValue: "",
          placeGuaranteeValue: "",
          shotsValue: "",
          extraCharges: [],
          paymentStatus: "Pendente",
        });
      }
    });

    // Remove desmarcados
    const keep = new Set(trainees.map((t) => t.customerId));
    const toRemove: number[] = [];
    fields.forEach((f, index) => {
      if (!keep.has(f.customerId)) toRemove.push(index);
    });
    toRemove.reverse().forEach((index) => remove(index));
  };

  const buildChargesForParticipant = (
    p: NewTrainingDataType["participants"][number],
    trainingType: "COMUM" | "MPT",
  ): TrainingChargePayload[] => {
    const charges: TrainingChargePayload[] = [];

    if (trainingType === "MPT") {
      charges.push({
        kind: "GARANTIA_VAGA",
        description: "Garantia de vaga",
        amountCents: parseStringToCents(p.placeGuaranteeValue || "0"),
        isRequired: true,
      });
      charges.push({
        kind: "DISPAROS",
        description: "Disparos",
        amountCents: parseStringToCents(p.shotsValue || "0"),
        isRequired: true,
      });
    } else {
      charges.push({
        kind: "BASE",
        description: "Valor base",
        amountCents: parseStringToCents(p.baseValue || "0"),
        isRequired: true,
      });
    }

    (p.extraCharges || []).forEach((ec) => {
      charges.push({
        kind: "EXTRA",
        description: ec.description || "Cobrança adicional",
        amountCents: parseStringToCents(ec.value || "0"),
        isRequired: false,
      });
    });

    return charges;
  };

  const onSubmit = async (data: NewTrainingDataType) => {
    try {
      let finalAddressId = data.addressId || undefined;

      if (!finalAddressId && data.cityName && data.stateName) {
        const addressResponse = await CreateGenericAddress({
          body: {
            zipCode: data.zipCode,
            stateName: data.stateName,
            cityName: data.cityName,
            neighborhoodName: data.neighborhoodName,
            streetName: data.streetName,
            buildingNumber: data.buildingNumber,
            addressComplement: data.addressComplement,
          },
        });

        if (addressResponse?.data?.addressId) {
          finalAddressId = addressResponse.data.addressId;
        } else {
          toast.error("Erro ao criar endereço. Verifique os campos.");
          return;
        }
      }

      if (!finalAddressId) {
        toast.warning("Preencha o endereço do treinamento.");
        return;
      }

      const participants: TrainingParticipantPayload[] = data.participants.map(
        (p) => ({
          customerId: p.customerId,
          isTrainee: p.isTrainee,
          isModel: p.isModel,
          observations: p.observations || null,
          charges: buildChargesForParticipant(p, data.trainingType),
          paymentInfo: { paymentStatus: p.paymentStatus || "Pendente" },
        }),
      );

      const payload: CreateTrainingBackendPayload = {
        hourInMinutes: data.hourInMinutes,
        gearId: data.gearId,
        addressId: finalAddressId,
        dueDate: data.dueDate,
        filialId: data.filialId,
        trainingType: data.trainingType,
        capacity: MAX_CAPACITY,
        participants,
      };

      const response = await CreateTraining(payload);

      if (response.statusCode !== 201) {
        toast.warning(response.message, { style: { fontSize: "1rem" } });
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        toast.success(response.message, { style: { fontSize: "1rem" } });
        reset(emptyDefaults());
        setSelectedTrainees([]);
        setDialogNovoTreinamento(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar dados");
    }
  };

  useEffect(() => {
    if (dialogNovoTreinamento) {
      reset(emptyDefaults());
      setSelectedTrainees([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ dialogNovoTreinamento ]);

  const onInvalid = () => {
    toast.warning("Verifique os campos obrigatórios.", {
      style: { fontSize: "1rem" },
    });
  };

  // --- Disponibilidade de horários ---
  const availableGears = gears;
  const params = {
    filialId: (watchFilialId || "") as string,
    gears: [
      {
        gearId: watchSelectedGear || "",
        gearName:
          availableGears?.find((g) => g.gearId === watchSelectedGear)
            ?.gearName || "",
        individualPrice: "0,00",
      },
    ],
    date: watchDueDate,
  };
  const { data } = useQuery<ApiResponse<GetDayCheckoutsResponse[]>, Error>({
    queryKey: [ "get-day-checkouts", params ],
    queryFn: () => getDayCheckouts({ body: params }),
    enabled: !!watchFilialId && !!watchDueDate && !!watchSelectedGear,
    staleTime: 0,
  });
  const checkoutSchedule = data?.data;

  useEffect(() => {
    setValue("hourInMinutes", 0 as unknown as number);
  }, [ setValue, watchSelectedGear ]);

  return (
    <Dialog open={ dialogNovoTreinamento } onOpenChange={ setDialogNovoTreinamento }>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
        </Button>
      </DialogTrigger>
      <DialogContent
        id="create-training-dialog-content"
        className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card"
      >
        <form onSubmit={ handleSubmit(onSubmit, onInvalid) }>
          <FormProvider { ...methods }>
            <DialogHeader>
              <DialogTitle>Criar Treinamento (Turma)</DialogTitle>
              <DialogDescription>
                Configure o tipo, a data, os participantes (aluno e/ou paciente
                modelo) e os valores. Máximo de {MAX_CAPACITY} vagas por turma.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-4">
              {/* --- TIPO + LOGÍSTICA --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2 mb-4">
                  Tipo e Logística
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Treinamento *</Label>
                    <Controller
                      control={ control }
                      name="trainingType"
                      render={ ({ field }) => (
                        <Select
                          value={ field.value }
                          onValueChange={ field.onChange }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COMUM">Comum</SelectItem>
                            <SelectItem value="MPT">
                              MPT (garantia de vaga + disparos)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Filial *</Label>
                    <SelectFilial
                      control={ control }
                      name="filialId"
                      accessibleFilials={ accessibleFilialsIds }
                      defaultFilial={ defaultFilialId }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gearId">Equipamento *</Label>
                    <SelectTrainingGear
                      disabled={ !watchFilialId }
                      filialId={ watchFilialId }
                      selectedGear={ watchSelectedGear }
                      onGearChange={ (gearId) => {
                        setValue("gearId", gearId, { shouldValidate: true });
                      } }
                    />
                    {errors.gearId && (
                      <p className="text-sm text-red-600">
                        {errors.gearId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* --- DATA E HORA --- */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" /> Data e Horário
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Data do Treinamento *</Label>
                    <Controller
                      control={ control }
                      name="dueDate"
                      render={ ({ field }) => (
                        <DatePicker
                          modal={ true }
                          value={ field.value || null }
                          onChange={ (e) => field.onChange(e) }
                          placeholder="Selecione a data"
                          clearable
                        />
                      ) }
                    />
                    {errors.dueDate && (
                      <p className="text-sm text-red-600">
                        {errors.dueDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {checkoutSchedule && (
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Horário de Início *
                      </Label>
                    )}
                    {(!watchFilialId || !watchDueDate || !watchSelectedGear) && (
                      <p className="text-sm text-muted-foreground italic">
                        Selecione Filial, Equipamento e Data para ver os
                        horários.
                      </p>
                    )}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                      {checkoutSchedule?.map((hour) => {
                        const hasGap = hour.availability.some(
                          (item) => item.available,
                        );
                        return (
                          <Button
                            type="button"
                            key={ hour.hourInMinutes }
                            variant={
                              watchHour === hour.hourInMinutes
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            disabled={ !hasGap }
                            onClick={ () =>
                              setValue("hourInMinutes", hour.hourInMinutes, {
                                shouldValidate: true,
                              })
                            }
                            className="text-xs h-9"
                          >
                            {hour.formattedTime}
                            {watchHour === hour.hourInMinutes && (
                              <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    {errors.hourInMinutes && (
                      <p className="text-sm text-red-600">
                        Selecione um horário.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* --- LOCALIZAÇÃO --- */}
              <div className="space-y-2">
                <EmbeddedTrainingAddressForm />
              </div>

              <Separator />

              {/* --- PARTICIPANTES --- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="flex items-center gap-2 font-semibold text-lg">
                    <Users className="h-5 w-5" /> Participantes
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    Vagas: {fields.length}/{MAX_CAPACITY}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label>Adicionar pessoas</Label>
                  <SelectTrainee
                    disabled={ !watchFilialId }
                    filialId={ watchFilialId }
                    selectedTraineeIds={ selectedParticipantIds }
                    onTraineesChange={ handleTraineesChange }
                  />
                  {errors.participants && (
                    <p className="text-sm text-red-600">
                      {errors.participants.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => (
                    <ParticipantCard
                      key={ field.key }
                      index={ index }
                      trainingType={ watchTrainingType }
                      control={ control }
                      register={ register }
                      watch={ watch }
                      setValue={ setValue }
                      onRemove={ () => {
                        remove(index);
                        setSelectedTrainees((prev) =>
                          prev.filter((t) => t.customerId !== field.customerId),
                        );
                      } }
                    />
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum participante adicionado.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={ () => setDialogNovoTreinamento(false) }
              >
                Cancelar
              </Button>
              <Button disabled={ isSubmitting } type="submit">
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Criar Treinamento
              </Button>
            </DialogFooter>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ParticipantCardProps {
  index: number;
  trainingType: "COMUM" | "MPT";
  control: Control<NewTrainingDataType>;
  register: UseFormRegister<NewTrainingDataType>;
  watch: UseFormWatch<NewTrainingDataType>;
  setValue: UseFormSetValue<NewTrainingDataType>;
  onRemove: () => void;
}

function ParticipantCard({
  index,
  trainingType,
  control,
  register,
  watch,
  setValue,
  onRemove,
}: ParticipantCardProps) {
  const base = `participants.${index}` as const;

  const {
    fields: chargeFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({
    control,
    name: `${base}.extraCharges` as "participants.0.extraCharges",
    keyName: "key",
  });

  const name = watch(`${base}.name` as "participants.0.name");
  const isTrainee = watch(`${base}.isTrainee` as "participants.0.isTrainee");
  const isModel = watch(`${base}.isModel` as "participants.0.isModel");

  return (
    <div className="border rounded-md p-4 bg-muted/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="font-semibold">{name || "Participante"}</span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={ onRemove }>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {/* Papéis */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={ isTrainee }
            onCheckedChange={ (c) =>
              setValue(
                `${base}.isTrainee` as "participants.0.isTrainee",
                c === true,
                { shouldValidate: true },
              )
            }
          />
          Aluno
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={ isModel }
            onCheckedChange={ (c) =>
              setValue(
                `${base}.isModel` as "participants.0.isModel",
                c === true,
                { shouldValidate: true },
              )
            }
          />
          Paciente modelo
        </label>
      </div>

      {/* Observação */}
      <div className="space-y-1">
        <Label className="text-xs uppercase text-muted-foreground">
          Observação
        </Label>
        <Textarea
          { ...register(
            `${base}.observations` as "participants.0.observations",
          ) }
          placeholder="Anotação livre desta inscrição..."
          className="resize-none min-h-[40px]"
          rows={ 1 }
        />
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingType === "MPT" ? (
          <>
            <div className="space-y-1">
              <Label>Garantia de vaga *</Label>
              <PriceInput
                withLabel={ false }
                value={
                  (watch(
                    `${base}.placeGuaranteeValue` as "participants.0.placeGuaranteeValue",
                  ) as string) || ""
                }
                onChange={ (v) =>
                  setValue(
                    `${base}.placeGuaranteeValue` as "participants.0.placeGuaranteeValue",
                    v,
                    { shouldValidate: true },
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Disparos *</Label>
              <PriceInput
                withLabel={ false }
                value={
                  (watch(
                    `${base}.shotsValue` as "participants.0.shotsValue",
                  ) as string) || ""
                }
                onChange={ (v) =>
                  setValue(
                    `${base}.shotsValue` as "participants.0.shotsValue",
                    v,
                    { shouldValidate: true },
                  )
                }
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label>Valor base</Label>
            <PriceInput
              withLabel={ false }
              value={
                (watch(
                  `${base}.baseValue` as "participants.0.baseValue",
                ) as string) || ""
              }
              onChange={ (v) =>
                setValue(`${base}.baseValue` as "participants.0.baseValue", v)
              }
            />
          </div>
        )}
      </div>

      {/* Cobranças adicionais */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" /> Cobranças adicionais
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={ () => appendCharge({ description: "", value: "" }) }
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar cobrança
          </Button>
        </div>

        {chargeFields.map((c, ci) => (
          <div key={ c.key } className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Descrição</Label>
              <Input
                { ...register(
                  `${base}.extraCharges.${ci}.description` as "participants.0.extraCharges.0.description",
                ) }
                placeholder="Ex.: Disparos adicionais"
              />
            </div>
            <div className="w-40 space-y-1">
              <Label className="text-xs">Valor</Label>
              <PriceInput
                withLabel={ false }
                value={
                  (watch(
                    `${base}.extraCharges.${ci}.value` as "participants.0.extraCharges.0.value",
                  ) as string) || ""
                }
                onChange={ (v) =>
                  setValue(
                    `${base}.extraCharges.${ci}.value` as "participants.0.extraCharges.0.value",
                    v,
                  )
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={ () => removeCharge(ci) }
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
