"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    CalendarIcon,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

// Components
import PriceInput from "@/components/shared/PriceInput";
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { SelectTrainee } from "./SelectTrainee";
import { SelectVolunteer } from "./SelectVolunteer";
import { SelectTrainingAddress } from "./SelectTrainingAddress";

// Services & Utils
import { CreateTraining } from "@/services/trainings.service";
import { GetAllTraineeAddresses } from "@/services/addresses.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents"; // Certifique-se que esta função converte "R$ 10,00" para 1000

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
import { useAuth } from "@/contexts/auth-provider";
import { GetDayCheckoutsResponse } from "../bookings/create/CreateBookingForm";
import { getDayCheckouts } from "@/services/checkouts.service";
import { DatePicker } from "@/components/ui/DatePicker";
import { TrainingPaymentSection } from "./TrainingPaymentSection";

interface CreateTrainingDialogProps {
  dialogNovoTreinamento: boolean;
  setDialogNovoTreinamento: (openStatus: boolean) => void;
  volunteers: Volunteer[] | undefined;
  trainees: Trainee[] | undefined;
  gears: Gear[] | undefined;
}

export function CreateTrainingDialog({
    dialogNovoTreinamento,
    setDialogNovoTreinamento,
    volunteers,
    trainees,
}: CreateTrainingDialogProps) {
    const { user } = useAuth();

    const createTrainingMethods = useForm<CreateTrainingDataType>({
        resolver: zodResolver(CreateTrainingSchema),
        defaultValues: {
            volunteerId: "",
            traineeId: "",
            gearId: "",
            addressId: "",
            price: "",
            additionalCost: "",
            additionalCostDescription: "",
            filialId: user?.sourceFilial.filialId,
            paymentInfo: {
                paymentStatus: "Pendente",
                firstPaymentDate: null,
                secondPaymentDate: null,
                firstPaymentAmount: "0",
                firstPaymentStatus: "Pendente",
                secondPaymentAmount: "0",
                secondPaymentStatus: "Pendente",
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

    // --- States Auxiliares para UI ---
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

    // --- Effects para Sincronizar UI ---
    useEffect(() => {
        const trainee = trainees?.find(
            (trainee) => trainee.traineeId === watchSelectedTraineeId
        );
        setSelectedTraineeName(trainee?.name);
    }, [ watchSelectedTraineeId, trainees ]);

    useEffect(() => {
        const volunteer = volunteers?.find(
            (volunteer) => volunteer.volunteerId === watchSelectedVolunteerId
        );
        setSelectedVolunteerName(volunteer?.name);
    }, [ watchSelectedVolunteerId, volunteers ]);

    // --- Submit Handler ---
    const onSubmitTraining = async (data: CreateTrainingDataType) => {
        try {
            const payload: CreateTrainingBackendPayload = {
                ...data,
                price: parseStringToCents(data.price),
                additionalCost: parseStringToCents(data.additionalCost),

                paymentInfo: {
                    paymentStatus: data.paymentInfo.paymentStatus,
                    firstPaymentDate: data.paymentInfo.firstPaymentDate ?? null,

                    firstPaymentAmount: data.paymentInfo.firstPaymentAmount
                        ? parseStringToCents(data.paymentInfo.firstPaymentAmount)
                        : null,

                    firstPaymentMethod: data.paymentInfo.firstPaymentMethod,
                    firstPaymentStatus: data.paymentInfo.firstPaymentStatus,

                    secondPaymentDate: data.paymentInfo.secondPaymentDate ?? null,

                    secondPaymentAmount: data.paymentInfo.secondPaymentAmount
                        ? parseStringToCents(data.paymentInfo.secondPaymentAmount)
                        : null,

                    secondPaymentMethod: data.paymentInfo.secondPaymentMethod,
                    secondPaymentStatus: data.paymentInfo.secondPaymentStatus,
                },
            };

            const response = await CreateTraining(payload);

            if (response.statusCode !== 201) {
                toast.warning(response.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
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

    // --- Query de Endereços ---
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

    const handleOpenChange = (open: boolean) => {
        setDialogNovoTreinamento(open);
        if (!open) {
            // Opcional: Resetar form ao fechar se desejar que os dados sumam
            // reset();
        }
    };

    return (
        <Dialog open={ dialogNovoTreinamento } onOpenChange={ handleOpenChange }>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
          Novo Treinamento
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={ handleSubmit(onSubmitTraining) }>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Sessão</DialogTitle>
                        <DialogDescription>
              Configure os detalhes do agendamento e valores.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* --- DADOS GERAIS --- */}
                        <div className="grid gap-4">
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
                                                if (e) {
                                                    setValue("dueDate", e);
                                                }
                                            } }
                                            placeholder="Selecione a data do treinamento"
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
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Selecione o Horário de Início *
                                </Label>
                                <div className="space-y-6">
                                    <Label className="text-sm font-medium">
                    Horário de início
                                    </Label>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
                                                    className={ `
                                                    relative text-xs h-9 transition-all duration-200
                                                    ${
                                                watchHour ===
                                                      hour.hourInMinutes
                                                    ? "ring-2 ring-primary ring-offset-2"
                                                    : ""
                                                }
                                                    ${
                                                !hasSomeAvailableGapTime
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "hover:scale-105"
                                                }
                                                ` }
                                                >
                                                    {hour.formattedTime}
                                                    {watchHour === hour.hourInMinutes && (
                                                        <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {errors.hourInMinutes && (
                                    <p className="text-sm text-red-600">
                    Selecione um horário válido.
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* --- FINANCEIRO --- */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                                <DollarSign className="h-4 w-4" /> Financeiro
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preço Base (Opcional)</Label>
                                    <Controller
                                        control={ control }
                                        name="price"
                                        render={ ({ field }) => (
                                            <PriceInput
                                                withLabel={ false }
                                                register={ createTrainingMethods.register("price") }
                                                value={ field.value?.toString() ?? "" }
                                                setValue={ setValue }
                                                name="price"
                                                placeholder="R$ 0,00"
                                            />
                                        ) }
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-600">
                                            {errors.price.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Custo Adicional (Opcional)</Label>
                                    <Controller
                                        control={ control }
                                        name="additionalCost"
                                        render={ ({ field }) => (
                                            <PriceInput
                                                withLabel={ false }
                                                register={ createTrainingMethods.register(
                                                    "additionalCost"
                                                ) }
                                                value={ field.value?.toString() ?? "" }
                                                setValue={ setValue }
                                                name="additionalCost"
                                                placeholder="R$ 0,00"
                                            />
                                        ) }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Descrição do Custo Adicional
                                </Label>
                                <Textarea
                                    { ...createTrainingMethods.register(
                                        "additionalCostDescription"
                                    ) }
                                    placeholder="Ex: Taxa de deslocamento, material extra..."
                                    className="resize-none"
                                    rows={ 2 }
                                />
                            </div>

                            <Separator />

                            <FormProvider { ...createTrainingMethods }>
                                <TrainingPaymentSection />
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
