"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
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
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/DatePicker";

// Components
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { SelectTrainee } from "./SelectTrainee";
import { SelectVolunteer } from "./SelectVolunteer";
import { EmbeddedTrainingAddressForm } from "./EmbeddedTrainingAddressForm";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { FinancialInputSection } from "./FinancialInputSection";

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
import { Customer } from "@/utils/@types/customer";
import { Volunteer } from "@/utils/@types/volunteer";

interface CreateTrainingDialogProps {
  dialogNovoTreinamento: boolean;
  setDialogNovoTreinamento: (openStatus: boolean) => void;
  gears: Gear[] | undefined;
}

// Estrutura padrão para inicializar o form
const defaultPaymentInfoStructure: {
  paymentStatus: "Pendente" | "Pago" | "Parcial";
  firstPaymentDate: null;
  secondPaymentDate: null;
  firstPaymentAmount: string;
  firstPaymentStatus: string;
  secondPaymentAmount: string;
  secondPaymentStatus: string;
  secondPaymentMethod: string;
  firstPaymentMethod: string;
} = {
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
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      filialId: defaultFilialId || "",
      traineeIds: [],
      volunteerIds: [],
      gearId: "",
      addressId: "",
      traineePayments: [],
      volunteerPayments: [],
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
    reset,
    register,
  } = createTrainingMethods;

  // --- Field Arrays para gerenciar sincronia ---
  const {
    fields: traineeFields,
    append: appendTrainee,
    remove: removeTrainee,
  } = useFieldArray({
    control,
    name: "traineePayments",
    keyName: "key",
  });

  const {
    fields: volunteerFields,
    append: appendVolunteer,
    remove: removeVolunteer,
  } = useFieldArray({
    control,
    name: "volunteerPayments",
    keyName: "key",
  });

  // --- UI States for Participant Names ---
  const [ selectedTrainees, setSelectedTrainees ] = useState<Customer[]>([]);
  const [ selectedVolunteers, setSelectedVolunteers ] = useState<Volunteer[]>([]);

  // --- Watchers ---
  const watchSelectedTraineeIds = watch("traineeIds") || [];
  const watchSelectedVolunteerIds = watch("volunteerIds") || [];
  const watchSelectedGear = watch("gearId");
  const watchFilialId = watch("filialId");
  const watchDueDate = watch("dueDate");
  const watchHour = watch("hourInMinutes");

  // --- Handlers de Sincronização (Select -> Field Array) ---

  const handleTraineesChange = (trainees: Customer[]) => {
    setSelectedTrainees(trainees);
    // Atualiza campo de IDs para validação
    setValue(
      "traineeIds",
      trainees.map((t) => t.customerId),
      { shouldValidate: true },
    );

    // Sync Array: Adicionar novos
    trainees.forEach((t) => {
      const exists = traineeFields.some(
        (field) => field.participantId === t.customerId,
      );
      if (!exists) {
        appendTrainee({
          participantId: t.customerId,
          price: "",
          additionalCost: "",
          additionalCostDescription: "",
          paymentInfo: { ...defaultPaymentInfoStructure },
        });
      }
    });

    // Sync Array: Remover excluídos
    // Precisamos iterar ao contrário ou buscar índices cuidadosamente
    // O jeito mais seguro é reconstruir ou filtrar.
    // Mas removeTrainee usa index.
    const idsToKeep = new Set(trainees.map((t) => t.customerId));

    // Encontrar indices para remover (do maior para o menor para não afetar indices subsequentes)
    const indicesToRemove: number[] = [];
    traineeFields.forEach((field, index) => {
      if (!idsToKeep.has(field.participantId)) {
        indicesToRemove.push(index);
      }
    });

    // Remove in reverse order
    indicesToRemove.reverse().forEach((index) => removeTrainee(index));
  };

  const handleVolunteersChange = (volunteers: Volunteer[]) => {
    setSelectedVolunteers(volunteers);
    setValue(
      "volunteerIds",
      volunteers.map((v) => v.volunteerId),
      { shouldValidate: true },
    );

    volunteers.forEach((v) => {
      const exists = volunteerFields.some(
        (field) => field.participantId === v.volunteerId,
      );
      if (!exists) {
        appendVolunteer({
          participantId: v.volunteerId,
          price: "",
          paymentInfo: { ...defaultPaymentInfoStructure },
        });
      }
    });

    const idsToKeep = new Set(volunteers.map((v) => v.volunteerId));
    const indicesToRemove: number[] = [];
    volunteerFields.forEach((field, index) => {
      if (!idsToKeep.has(field.participantId)) {
        indicesToRemove.push(index);
      }
    });
    indicesToRemove.reverse().forEach((index) => removeVolunteer(index));
  };

  // --- Helper de Formatação do Submit ---
  const formatPaymentPayload = (
    priceStr: string | undefined,
    paymentInfo: CreateTrainingDataType["traineePayments"][number]["paymentInfo"],
    additionalCostStr?: string,
    additionalCostDesc?: string,
  ) => {
    return {
      price: parseStringToCents(priceStr || "0"),
      additionalCost: additionalCostStr
        ? parseStringToCents(additionalCostStr)
        : 0,
      additionalCostDescription: additionalCostDesc,
      paymentInfo: {
        paymentStatus: paymentInfo.paymentStatus || "Pendente",
        firstPaymentDate: paymentInfo.firstPaymentDate
          ? new Date(paymentInfo.firstPaymentDate)
          : null,
        firstPaymentAmount: paymentInfo.firstPaymentAmount
          ? parseStringToCents(String(paymentInfo.firstPaymentAmount))
          : 0,
        firstPaymentMethod: paymentInfo.firstPaymentMethod || null,
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

      // Preparar Arrays de Pagamento Backend
      const formattedTraineePayments = data.traineePayments.map((p) => ({
        customerId: p.participantId,
        ...formatPaymentPayload(
          p.price,
          p.paymentInfo,
          p.additionalCost,
          p.additionalCostDescription,
        ),
      }));

      const formattedVolunteerPayments = data.volunteerPayments.map((p) => ({
        volunteerId: p.participantId,
        ...formatPaymentPayload(p.price, p.paymentInfo),
      }));

      const payload: CreateTrainingBackendPayload = {
        hourInMinutes: data.hourInMinutes,
        gearId: data.gearId,
        addressId: finalAddressId,
        dueDate: data.dueDate,
        filialId: data.filialId,

        traineePayments: formattedTraineePayments,
        volunteerPayments: formattedVolunteerPayments,
      };

      const response = await CreateTraining(payload);

      if (response.statusCode !== 201) {
        toast.warning(response.message, { style: { fontSize: "1rem" } });
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        toast.success(response.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
        reset({
          filialId: defaultFilialId || "",
          traineeIds: [],
          volunteerIds: [],
          gearId: "",
          addressId: "",
          traineePayments: [],
          volunteerPayments: [],
        });
        setSelectedTrainees([]);
        setSelectedVolunteers([]);
        setDialogNovoTreinamento(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar dados");
    }
  };

  useEffect(() => {
    console.log("customerForm.formState.errors: ", errors);
  }, [ errors ]);

  useEffect(() => {
    if (dialogNovoTreinamento) {
      reset({
        filialId: defaultFilialId || "",
        traineeIds: [],
        volunteerIds: [],
        gearId: "",
        addressId: "",
        traineePayments: [],
        volunteerPayments: [],
      });
      setSelectedTrainees([]);
      setSelectedVolunteers([]);
    }
  }, [ dialogNovoTreinamento, reset, defaultFilialId ]);

  // --- Queries ---
  // Use first trainee for address hint (legacy behavior maintained)
  const firstTraineeId = watchSelectedTraineeIds[0];

  const addressesData = useQuery<ApiResponse<Address[]>, Error>({
    queryKey: [ "get-all-trainee-addresses", firstTraineeId ],
    queryFn: () => GetAllTraineeAddresses({ customerId: firstTraineeId }),
    enabled: !!firstTraineeId,
    staleTime: 1000 * 60,
  });

  // --- Helper: Scroll to top on error ---
  const onInvalid = () => {
    const dialogContent = document.getElementById(
      "create-training-dialog-content",
    );
    if (dialogContent) {
      // Small delay to let React render error messages
      setTimeout(() => {
        const firstError = dialogContent.querySelector(
          "p.text-red-600, p.text-destructive",
        );
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          dialogContent.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
    toast.warning("Verifique os campos obrigatórios.", {
      style: { fontSize: "1rem" },
    });
  };

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
      <DialogContent
        id="create-training-dialog-content"
        className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card"
      >
        <form onSubmit={ handleSubmit(onSubmitTraining, onInvalid) }>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Alunos *</Label>
                    <SelectTrainee
                      disabled={ !watchFilialId }
                      filialId={ watchFilialId }
                      selectedTraineeIds={ watchSelectedTraineeIds }
                      onTraineesChange={ handleTraineesChange }
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
                      onVolunteersChange={ handleVolunteersChange }
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
                              setValue("hourInMinutes", hour.hourInMinutes, {
                                shouldValidate: true,
                              })
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

                    <FinancialInputSection
                      control={ control }
                      register={ register }
                      setValue={ setValue }
                      watch={ watch }
                      errors={ errors }
                      participants={ selectedTrainees.map((t) => ({
                        id: t.customerId,
                        name: t.fullname,
                      })) }
                      type="trainee"
                      fields={ traineeFields }
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

                    <FinancialInputSection
                      control={ control }
                      register={ register }
                      setValue={ setValue }
                      watch={ watch }
                      errors={ errors }
                      participants={ selectedVolunteers.map((v) => ({
                        id: v.volunteerId,
                        name: v.name,
                      })) }
                      type="volunteer"
                      fields={ volunteerFields }
                    />
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
