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
import { SelectTrainingAddress } from "./SelectTrainingAddress";
import { TrainingPaymentSection } from "./TrainingPaymentSection";
import { SelectFilial } from "@/components/shared/SelectFilial";

// Services & Utils
import { CreateTraining } from "@/services/trainings.service";
import { GetAllTraineeAddresses } from "@/services/addresses.service";
import { getDayCheckouts } from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findAllFilials } from "@/services/filials.service";
import { Filial } from "@/utils/@types/filials";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";

// Types & Schemas
import {
  CreateTrainingBackendPayload,
  CreateTrainingDataType,
  CreateTrainingSchema,
} from "@/lib/zod/CreateTrainingValidation";
import { Volunteer } from "@/utils/@types/volunteer";
import { Trainee } from "@/utils/@types/trainee";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import { Address } from "@/utils/@types/address";
import { GetDayCheckoutsResponse } from "../bookings/create/CreateBookingForm";

interface CreateTrainingDialogProps {
  dialogNovoTreinamento: boolean;
  setDialogNovoTreinamento: (openStatus: boolean) => void;
  volunteers: Volunteer[] | undefined;
  trainees: Trainee[] | undefined;
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
    firstPaymentMethod: "",
    secondPaymentMethod: "",
  };

export function CreateTrainingDialog({
  dialogNovoTreinamento,
  setDialogNovoTreinamento,
  volunteers,
  trainees,
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
          ? user?.sourceFilial.filialId
          : accessibleFilialsIds?.includes(user?.sourceFilial.filialId || "")
            ? user?.sourceFilial.filialId
            : accessibleFilialsIds?.[0];

  const createTrainingMethods = useForm<CreateTrainingDataType>({
    resolver: zodResolver(CreateTrainingSchema),
    defaultValues: {
      filialId: defaultFilialId || "",
      traineeId: undefined,
      volunteerId: undefined,
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
  const [ selectedTraineeName, setSelectedTraineeName ] = useState<
    string | undefined
  >(undefined);
  const [ selectedVolunteerName, setSelectedVolunteerName ] = useState<
    string | undefined
  >(undefined);
  const [ selectedGearId, setSelectedGearId ] = useState<string | undefined>(
    undefined
  );

  // --- Watchers ---
  const watchSelectedTraineeId = watch("traineeId");
  const watchSelectedVolunteerId = watch("volunteerId");
  const watchSelectedAddress = watch("addressId");
  const watchSelectedGear = watch("gearId");
  const watchDueDate = watch("dueDate");
  const watchHour = watch("hourInMinutes");

  // --- Effects: Sync UI ---
  useEffect(() => {
    const trainee = trainees?.find(
      (t) => t.traineeId === watchSelectedTraineeId
    );
    setSelectedTraineeName(trainee?.name);
  }, [ watchSelectedTraineeId, trainees ]);

  useEffect(() => {
    const volunteer = volunteers?.find(
      (v) => v.volunteerId === watchSelectedVolunteerId
    );
    setSelectedVolunteerName(volunteer?.name);
  }, [ watchSelectedVolunteerId, volunteers ]);

  // --- Helper de Formatação do Submit ---
  const formatPaymentPayload = (
    priceStr: string | undefined,
    paymentInfo: CreateTrainingDataType["traineePayment"]["paymentInfo"],
    additionalCostStr?: string,
    additionalCostDesc?: string
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
      const payload: CreateTrainingBackendPayload = {
        // Campos raiz
        hourInMinutes: data.hourInMinutes,
        gearId: data.gearId,
        volunteerId: data.volunteerId,
        traineeId: data.traineeId,
        addressId: data.addressId,
        dueDate: data.dueDate,
        filialId: data.filialId,

        // 1. Pagamento do Trainee
        traineePayment: formatPaymentPayload(
          data.traineePayment.price,
          data.traineePayment.paymentInfo,
          data.traineePayment.additionalCost,
          data.traineePayment.additionalCostDescription
        ),

        // 2. Pagamento do Volunteer
        volunteerPayment: formatPaymentPayload(
          data.volunteerPayment.price,
          data.volunteerPayment.paymentInfo
        ),
      };

      const response = await CreateTraining(payload);

      if (response.statusCode !== 201) {
        toast.warning(response.message, { style: { fontSize: "1rem" } });
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        toast.success(response.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
        reset();
        setSelectedVolunteerName(undefined);
        setSelectedTraineeName(undefined);
        setDialogNovoTreinamento(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar dados");
    }
  };

  // --- Queries ---
  const addressesData = useQuery<ApiResponse<Address[]>, Error>({
    queryKey: [ "get-all-trainee-addresses", watchSelectedTraineeId ],
    queryFn: () =>
      GetAllTraineeAddresses({ traineeId: watchSelectedTraineeId }),
    enabled: !!watchSelectedTraineeId,
    staleTime: 1000 * 60,
  });
  const allCustomerAddresses = addressesData.data?.data;

  const params = {
    filialId: user?.sourceFilial.filialId,
    gears: [ { gearId: watchSelectedGear, gearName: "" } ],
    date: watchDueDate,
  };
  const { data } = useQuery<ApiResponse<GetDayCheckoutsResponse[]>, Error>({
    queryKey: [ "get-day-checkouts", params ],
    queryFn: () => getDayCheckouts({ body: params }),
    enabled:
      !!user?.sourceFilial.filialId && !!watchDueDate && !!watchSelectedGear,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <form onSubmit={ handleSubmit(onSubmitTraining) }>
          <DialogHeader>
            <DialogTitle>Criar Nova Sessão</DialogTitle>
            <DialogDescription>
              Configure os detalhes do agendamento e valores para Aluno e
              Modelo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* --- DADOS GERAIS --- */}
            <div className="grid gap-4">
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
                  selectedGear={ selectedGearId }
                  onGearChange={ (gearId) => {
                    setValue("gearId", gearId);
                    setSelectedGearId(gearId);
                  } }
                />
                {errors.gearId && (
                  <p className="text-sm text-red-600">
                    {errors.gearId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aluno *</Label>
                  <SelectTrainee
                    trainees={ trainees }
                    selectedTrainee={ selectedTraineeName }
                    onTraineeChange={ (traineeName) => {
                      const trainee = trainees?.find(
                        (s) => s.name === traineeName
                      );
                      if (trainee) {
                        setValue("traineeId", trainee.traineeId);
                        setSelectedTraineeName(traineeName);
                      }
                    } }
                  />
                  {errors.traineeId && (
                    <p className="text-sm text-red-600">
                      {errors.traineeId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Paciente modelo *</Label>
                  <SelectVolunteer
                    volunteers={ volunteers }
                    selectedVolunteer={ selectedVolunteerName }
                    onVolunteerChange={ (volunteerName) => {
                      const volunteer = volunteers?.find(
                        (p) => p.name === volunteerName
                      );
                      if (volunteer) {
                        setValue("volunteerId", volunteer.volunteerId);
                        setSelectedVolunteerName(volunteerName);
                      }
                    } }
                  />
                  {errors.volunteerId && (
                    <p className="text-sm text-red-600">
                      {errors.volunteerId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço de Realização *</Label>
                <SelectTrainingAddress
                  addresses={ allCustomerAddresses }
                  selectedAddress={ watchSelectedAddress }
                  onAddressChange={ (addressId) =>
                    setValue("addressId", addressId)
                  }
                />
                {errors.addressId && (
                  <p className="text-sm text-red-600">
                    {errors.addressId.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* --- DATA E HORA --- */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                <CalendarIcon className="h-4 w-4" /> Data e Horário
              </h4>
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
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                  {checkoutSchedule?.map((hour) => {
                    const hasSomeAvailableGapTime = hour.availability.some(
                      (item) => item.available
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
                        } ${
                          !hasSomeAvailableGapTime
                            ? "opacity-50"
                            : "hover:scale-105"
                        }` }
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
                  <p className="text-sm text-red-600">Selecione um horário.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* --- FINANCEIRO E CUSTOS --- */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" /> Financeiro e Custos
              </h4>

              {/* Envolvendo ambas as seções com o FormProvider */}
              <FormProvider { ...createTrainingMethods }>
                <div className="flex flex-col gap-8">
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
                      {/* 1. Preço Base */}
                      <div className="space-y-2">
                        <Label>Valor do Curso (Preço Base)</Label>
                        <Controller
                          control={ control }
                          name="traineePayment.price"
                          render={ ({ field }) => (
                            <PriceInput
                              withLabel={ false }
                              register={ createTrainingMethods.register(
                                "traineePayment.price"
                              ) }
                              value={ field.value?.toString() ?? "" }
                              setValue={ setValue }
                              name="traineePayment.price"
                              placeholder="R$ 0,00"
                            />
                          ) }
                        />
                      </div>

                      {/* 2. Custo Adicional */}
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
                                    "traineePayment.additionalCost"
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
                                "traineePayment.additionalCostDescription"
                              ) }
                              placeholder="Descrição: Taxa de sala, material..."
                              className="resize-none min-h-[40px]"
                              rows={ 1 }
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Pagamento */}
                      {/* <Separator className="my-2" />
                                            <TrainingPaymentSection prefix="traineePayment" /> */}
                    </div>
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
                                "volunteerPayment.price"
                              ) }
                              value={ field.value?.toString() ?? "" }
                              setValue={ setValue }
                              name="volunteerPayment.price"
                              placeholder="R$ 0,00"
                            />
                          ) }
                        />
                      </div>

                      {/* <Separator className="my-2" />
                                            <TrainingPaymentSection prefix="volunteerPayment" /> */}
                    </div>
                  </div>
                </div>
              </FormProvider>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
