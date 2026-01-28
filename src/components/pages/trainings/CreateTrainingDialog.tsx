"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
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
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/DatePicker";

// Components
import PriceInput from "@/components/shared/PriceInput";
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { SelectTrainee } from "./SelectTrainee";
import { SelectVolunteer } from "./SelectVolunteer";
// import { SelectTrainingAddress } from "./SelectTrainingAddress"; // Removed
import { EmbeddedTrainingAddressForm } from "./EmbeddedTrainingAddressForm";
import { TrainingPaymentSection } from "./TrainingPaymentSection";
import { SelectFilial } from "@/components/shared/SelectFilial";

// Services & Utils
import { CreateTraining } from "@/services/trainings.service";
import {
  GetAllTraineeAddresses,
  CreateGenericAddress,
} from "@/services/addresses.service";
import {
  getDayCheckouts,
  GetDayCheckoutsResponse,
} from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { Filial } from "@/utils/@types/filials";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";

// Types & Schemas
import {
  CreateTrainingBackendPayload,
  CreateTrainingDataType,
  CreateTrainingSchema,
} from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import { Address } from "@/utils/@types/address";

interface CreateTrainingDialogProps {
  dialogNovoTreinamento: boolean;
  setDialogNovoTreinamento: (openStatus: boolean) => void;
  gears: Gear[] | undefined;
}

// Estrutura padrão para inicializar o form
const defaultPaymentInfoStructure: CreateTrainingDataType["traineePayment"]["paymentInfo"] =
  {
    paymentStatus: "Pendente",
    firstPaymentDate: null,
    secondPaymentDate: null,
    firstPaymentAmount: "0",
    firstPaymentStatus: "Pendente",
    secondPaymentAmount: "0",
    secondPaymentStatus: "Pendente",
    secondPaymentMethod: "",
    firstPaymentMethod: "",
  };

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

  const createTrainingMethods = useForm<CreateTrainingDataType>({
    resolver: zodResolver(CreateTrainingSchema),
    defaultValues: {
      filialId: defaultFilialId || "",
      traineeIds: [], // Changed to array
      volunteerIds: [], // Changed to array
      gearId: "",
      addressId: "",

      // Estrutura aninhada conforme novo Schema
      traineePayment: {
        price: "",
        additionalCost: "",
        additionalCostDescription: "",
        paymentInfo: { ...defaultPaymentInfoStructure },
      },
      volunteerPayment: {
        price: "",
        paymentInfo: { ...defaultPaymentInfoStructure },
      },
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
    reset,
  } = createTrainingMethods;

  // --- UI States ---
  const [ isCreatingAddress, setIsCreatingAddress ] = useState(false);

  // --- Watchers ---
  const watchSelectedTraineeIds = watch("traineeIds") || [];
  const watchSelectedVolunteerIds = watch("volunteerIds") || [];
  const watchSelectedAddress = watch("addressId");
  const watchSelectedGear = watch("gearId");
  const watchFilialId = watch("filialId");
  const watchDueDate = watch("dueDate");
  const watchHour = watch("hourInMinutes");

  // --- Helper de Formatação do Submit ---
  const formatPaymentPayload = (
    priceStr: string | undefined,
    paymentInfo: CreateTrainingDataType["traineePayment"]["paymentInfo"],
    additionalCostStr?: string,
    additionalCostDesc?: string,
  ) => {
    return {
      // Se preço não for preenchido, envia 0
      price: parseStringToCents(priceStr || "0"),

      // Se additionalCost não for preenchido, envia 0
      additionalCost: additionalCostStr
        ? parseStringToCents(additionalCostStr)
        : 0,

      // Descrição pode ser undefined
      additionalCostDescription: additionalCostDesc,

      paymentInfo: {
        paymentStatus: paymentInfo.paymentStatus || "Pendente",

        // Datas: Se não existir, envia null
        firstPaymentDate: paymentInfo.firstPaymentDate
          ? new Date(paymentInfo.firstPaymentDate)
          : null,

        // Valores: Se string vazia ou null, parseStringToCents devolve 0 (assumindo que sua func trata isso),
        // mas garantimos null se não houver pagamento.
        firstPaymentAmount: paymentInfo.firstPaymentAmount
          ? parseStringToCents(String(paymentInfo.firstPaymentAmount))
          : 0, // ou null, dependendo do seu backend. Normalmente 0 é mais seguro para cálculos.

        firstPaymentMethod: paymentInfo.firstPaymentMethod || null,

        // Se status é Pendente, firstPaymentStatus tbm é Pendente por coerência
        firstPaymentStatus: paymentInfo.firstPaymentStatus || "Pendente",

        secondPaymentDate: paymentInfo.secondPaymentDate
          ? new Date(paymentInfo.secondPaymentDate)
          : null,

        secondPaymentAmount: paymentInfo.secondPaymentAmount
          ? parseStringToCents(String(paymentInfo.secondPaymentAmount))
          : 0,

        secondPaymentMethod: paymentInfo.secondPaymentMethod || null,
        secondPaymentStatus: paymentInfo.secondPaymentStatus || "Pendente",
      },
    };
  };

  // --- Submit Handler ---
  const onSubmitTraining = async (data: CreateTrainingDataType) => {
    try {
      let finalAddressId = data.addressId;

      // Se não selecionou um endereço existente mas preencheu os campos de novo endereço
      if (!finalAddressId && data.cityName && data.stateName) {
        const addressPayload = {
          zipCode: data.zipCode,
          stateName: data.stateName,
          cityName: data.cityName,
          neighborhoodName: data.neighborhoodName,
          streetName: data.streetName,
          buildingNumber: data.buildingNumber,
          addressComplement: data.addressComplement,
        };

        const addressResponse = await CreateGenericAddress({
          body: addressPayload,
        });

        if (addressResponse?.data?.addressId) {
          finalAddressId = addressResponse.data.addressId;
        } else {
          toast.error("Erro ao criar endereço. Verifique os campos.");
          return;
        }
      }

      if (!finalAddressId) {
        toast.warning("Selecione um endereço ou preencha o novo endereço.");
        return;
      }

      const payload: CreateTrainingBackendPayload = {
        // Campos raiz
        hourInMinutes: data.hourInMinutes,
        gearId: data.gearId,
        volunteerIds: data.volunteerIds,
        traineeIds: data.traineeIds,
        addressId: finalAddressId,
        dueDate: data.dueDate,
        filialId: data.filialId,

        // 1. Pagamento do Trainee
        traineePayment: formatPaymentPayload(
          data.traineePayment.price,
          data.traineePayment.paymentInfo,
          data.traineePayment.additionalCost,
          data.traineePayment.additionalCostDescription,
        ),

        // 2. Pagamento do Volunteer
        volunteerPayment: formatPaymentPayload(
          data.volunteerPayment.price,
          data.volunteerPayment.paymentInfo,
        ),
      };

      const response = await CreateTraining(payload);

      if (response.statusCode !== 201) {
        toast.warning(response.message, { style: { fontSize: "1rem" } });
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        toast.success(response.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
        reset();
        setDialogNovoTreinamento(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar dados");
    }
  };

  // --- Queries ---
  // Assuming address logic might rely on specific trainee, but with multiple trainees we might default to no addresses or logic to select one.
  // For now, if multiple trainees are selected, maybe we fetch addresses for the first one or logic needs adjustment?
  // Previous logic: queryKey based on watchSelectedTraineeId (single).
  // Now we have watchSelectedTraineeIds (array).
  // Ideally, addresses should belong to one of the trainees or generic?
  // Assuming we pick addresses from the first selected trainee for now or update GetAllTraineeAddresses to support array (unlikely).
  // Let's use the first traineeId for address fetching if available.
  const firstTraineeId = watchSelectedTraineeIds[0];

  const addressesData = useQuery<ApiResponse<Address[]>, Error>({
    queryKey: [ "get-all-trainee-addresses", firstTraineeId ],
    queryFn: () => GetAllTraineeAddresses({ traineeId: firstTraineeId }),
    enabled: !!firstTraineeId,
    staleTime: 1000 * 60,
  });
  const allCustomerAddresses = addressesData.data?.data;

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
    setValue("hourInMinutes", 0);
  }, [ setValue, watchSelectedGear ]);

  return (
    <Dialog
      open={ dialogNovoTreinamento }
      onOpenChange={ setDialogNovoTreinamento }
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card">
        <form onSubmit={ handleSubmit(onSubmitTraining) }>
          <FormProvider { ...createTrainingMethods }>
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
              <DialogDescription>
                Configure os detalhes do agendamento, participantes e local.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-4">
              {/* --- BLOCO 1: LOGÍSTICA E PARTICIPANTES --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2 mb-4">
                  Logística e Participantes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Filial *</Label>
                    <SelectFilial
                      control={ control }
                      name="filialId"
                      accessibleFilials={ accessibleFilialsIds }
                      defaultFilial={ defaultFilialId }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gearId">Equipamento *</Label>
                    <SelectTrainingGear
                      disabled={ !watchFilialId }
                      filialId={ watchFilialId }
                      selectedGear={ watchSelectedGear }
                      onGearChange={ (gearId) => {
                        setValue("gearId", gearId);
                      } }
                    />
                    {errors.gearId && (
                      <p className="text-sm text-red-600">
                        {errors.gearId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Alunos *</Label>
                    <SelectTrainee
                      disabled={ !watchFilialId }
                      filialId={ watchFilialId }
                      selectedTraineeIds={ watchSelectedTraineeIds }
                      onTraineesChange={ (trainees) => {
                        setValue(
                          "traineeIds",
                          trainees.map((t) => t.traineeId),
                        );
                      } }
                    />
                    {errors.traineeIds && (
                      <p className="text-sm text-red-600">
                        {errors.traineeIds.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Pacientes modelo *</Label>
                    <SelectVolunteer
                      disabled={ !watchFilialId }
                      filialId={ watchFilialId }
                      selectedVolunteerIds={ watchSelectedVolunteerIds }
                      onVolunteersChange={ (volunteers) => {
                        setValue(
                          "volunteerIds",
                          volunteers.map((v) => v.volunteerId),
                        );
                      } }
                    />
                    {errors.volunteerIds && (
                      <p className="text-sm text-red-600">
                        {errors.volunteerIds.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* --- BLOCO 2: DATA E HORA --- */}
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
                          value={ field.value! }
                          onChange={ (e) => {
                            field.onChange(e);
                            if (e) setValue("dueDate", e);
                          } }
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
                    {/* Feedback if missing selections */}
                    {(!watchFilialId ||
                      !watchDueDate ||
                      !watchSelectedGear) && (
                      <p className="text-sm text-muted-foreground italic">
                        Selecione Filial, Equipamento e Data para visualizar os
                        horários.
                      </p>
                    )}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                      {checkoutSchedule?.map((hour) => {
                        const hasSomeAvailableGapTime = hour.availability.some(
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
                            disabled={ !hasSomeAvailableGapTime }
                            onClick={ () =>
                              setValue("hourInMinutes", hour.hourInMinutes)
                            }
                            className={ `text-xs h-9 transition-all ${
                              watchHour === hour.hourInMinutes
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            } ${!hasSomeAvailableGapTime ? "opacity-50" : "hover:scale-105"}` }
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

              {/* --- BLOCO 3: LOCALIZAÇÃO --- */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <EmbeddedTrainingAddressForm />
                  {errors.addressId && (
                    <p className="text-sm text-red-600">
                      {errors.addressId.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-md">
                  <p>
                    O endereço informado será automaticamente vinculado a este
                    treinamento.
                  </p>
                </div>
              </div>
              <Separator />

              {/* --- BLOCO 4: FINANCEIRO E CUSTOS --- */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" /> Financeiro e Custos
                </h4>

                <div className="flex flex-col gap-6">
                  {/* --- BLOCO ALUNO --- */}
                  <div className="border rounded-md p-5 bg-muted/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        Financeiro do Aluno
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Valor do Curso (Preço Base)</Label>
                        <Controller
                          control={ control }
                          name="traineePayment.price"
                          render={ ({ field }) => (
                            <PriceInput
                              withLabel={ false }
                              register={ createTrainingMethods.register(
                                "traineePayment.price",
                              ) }
                              value={ field.value?.toString() ?? "" }
                              setValue={ setValue }
                              name="traineePayment.price"
                              placeholder="R$ 0,00"
                            />
                          ) }
                        />
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-900/50 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-yellow-800 dark:text-yellow-200 text-xs font-bold uppercase tracking-wide">
                            Custos Operacionais Extras
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                              control={ control }
                              name="traineePayment.additionalCost"
                              render={ ({ field }) => (
                                <PriceInput
                                  withLabel={ false }
                                  register={ createTrainingMethods.register(
                                    "traineePayment.additionalCost",
                                  ) }
                                  value={ field.value?.toString() ?? "" }
                                  setValue={ setValue }
                                  name="traineePayment.additionalCost"
                                  placeholder="Valor: R$ 0,00"
                                />
                              ) }
                            />
                            <Textarea
                              { ...createTrainingMethods.register(
                                "traineePayment.additionalCostDescription",
                              ) }
                              placeholder="Descrição: Taxa de sala, material..."
                              className="resize-none min-h-[40px]"
                              rows={ 1 }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <TrainingPaymentSection
                      prefix="traineePayment"
                      label="Informações de Pagamento do Aluno"
                    />
                  </div>

                  {/* --- BLOCO MODELO --- */}
                  <div className="border rounded-md p-5 bg-muted/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <User className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        Financeiro do Paciente Modelo
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Valor cobrado do Modelo (se houver)</Label>
                        <Controller
                          control={ control }
                          name="volunteerPayment.price"
                          render={ ({ field }) => (
                            <PriceInput
                              withLabel={ false }
                              register={ createTrainingMethods.register(
                                "volunteerPayment.price",
                              ) }
                              value={ field.value?.toString() ?? "" }
                              setValue={ setValue }
                              name="volunteerPayment.price"
                              placeholder="R$ 0,00"
                            />
                          ) }
                        />
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-900/50 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-yellow-800 dark:text-yellow-200 text-xs font-bold uppercase tracking-wide">
                            Custos Operacionais Extras
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                              control={ control }
                              name="volunteerPayment.additionalCost"
                              render={ ({ field }) => (
                                <PriceInput
                                  withLabel={ false }
                                  register={ createTrainingMethods.register(
                                    "volunteerPayment.additionalCost",
                                  ) }
                                  value={ field.value?.toString() ?? "" }
                                  setValue={ setValue }
                                  name="volunteerPayment.additionalCost"
                                  placeholder="Valor: R$ 0,00"
                                />
                              ) }
                            />
                            <Textarea
                              { ...createTrainingMethods.register(
                                "volunteerPayment.additionalCostDescription",
                              ) }
                              placeholder="Descrição: Taxa de sala, material..."
                              className="resize-none min-h-[40px]"
                              rows={ 1 }
                            />
                          </div>
                        </div>
                      </div>

                      <TrainingPaymentSection
                        prefix="volunteerPayment"
                        label="Informações de Pagamento do Modelo"
                      />
                    </div>
                  </div>
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
