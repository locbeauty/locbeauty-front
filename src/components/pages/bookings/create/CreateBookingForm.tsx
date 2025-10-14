"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AlertCircle, User, MessageSquare, Check, DollarSign, Settings, Pin, Truck, X, Copy } from "lucide-react";
import { useState } from "react";
import PriceInput from "@/components/shared/PriceInput";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { SelectFilial } from "@/components/shared/SelectFilial";
import CheckoutTimeSelector from "./CheckoutTimeSelector";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { SelectAddress } from "./SelectAddress";
import { CheckoutPaymentMethod } from "./CheckoutPaymentMethod";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { SelectEmployee } from "@/components/shared/SelectEmployee";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import { createCheckoutFormSchema, CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { CreateCheckout, getDayCheckouts } from "@/services/checkouts.service";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { hideDocumentNumber } from "@/utils/hideDocumentNumber";
import { useQuery } from "@tanstack/react-query";

export interface GetDayCheckoutsResponse {
  hourInMinutes: number,
  formattedTime: string,
  availability: {
        durationInMinutes: number,
        available: boolean,
        maxGearAmount: number
    }[],
}

export function GearsSection() {
    const {
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const watchSelectedGears = watch("gears") || [];

    function handleAddGear(gear: Gear) {
        setValue("gears", [ ...watchSelectedGears, { gearId: gear.gearId, gearName: gear.gearName } ]);
    }

    function handleRemoveGear(gearId: string) {
        const updated = watchSelectedGears.filter((g: Gear) => g.gearId !== gearId);
        setValue("gears", updated);
    }

    return (
        <div className="space-y-2">
            <Label
                htmlFor="equipamento"
                className="text-sm font-medium flex items-center gap-1"
            >
                <Settings className="w-4 h-4" />
    Equipamento
            </Label>

            {/* Container horizontal */}
            <div className="flex flex-wrap gap-2">
                {/* Lista de máquinas selecionadas */}
                {watchSelectedGears.map((gear: { gearName: string; gearId: string }) => (
                    <div
                        key={ gear.gearId }
                        className="flex items-center space-x-2"
                    >
                        <Button
                            variant="outline"
                            className="justify-start text-black font-black"
                            disabled
                        >
                            {gear.gearName}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={ () => handleRemoveGear(gear.gearId) }
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {/* Select aparece ao lado das máquinas */}
                {watchSelectedGears.length < 3 && (
                    <div className="min-w-[200px]">
                        <SelectGear onSelect={ handleAddGear } />
                    </div>
                )}
            </div>

            {errors.gears && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gears.message?.toString()}
                </p>
            )}
        </div>

    );
}

export function CreateBookingForm() {
    const { user } = useAuth();
    const createBookingFormMethods = useForm<CreateCheckoutFormSchemaType>({
        resolver: zodResolver(createCheckoutFormSchema),
        defaultValues: {
            bookingStatus: "Pendente",
            paymentStatus: "Pendente",
            paymentMode: undefined,
            totalPrice: "",
            addressId: "",
            filialId: user?.sourceFilial.filialId,
            accountableEmployeeId: user?.sub
        },
    });

    const [ isQuickBookingPaymentModeDialogOpen, setQuickBookingPaymentModeDialogOpen ] = useState(false);
    const [ addressString, setAddressString ] = useState("");
    const [ driverString, setDriverString ] = useState("");

    const {
        handleSubmit,
        register,
        watch,
        setValue,
        formState: { errors },
        control,
        reset
    } = createBookingFormMethods;

    const startHour = watch("startHourInMinutes");
    const watchTotalDurationInMinutes = watch("totalDurationInMinutes");
    const selectedDate = watch("date");
    const watchFilialId = watch("filialId");
    const watchSelectedGears = watch("gears");
    const watchPrice = watch("totalPrice");
    const watchCustomer = watch("customer");
    const isDateInPast = selectedDate && selectedDate < new Date();

    const params = {
        filialId: watchFilialId,
        gears: watchSelectedGears,
        date: selectedDate
    };

    const { data } = useQuery<ApiResponse<GetDayCheckoutsResponse[]>,Error>({
        queryKey: [ "get-day-checkouts", params ],
        queryFn: () => getDayCheckouts({ body: params }),
        enabled: !!watchFilialId && !!selectedDate, // só executa se houver filial e data
        staleTime: 1000 * 60,
    });
    const checkoutSchedule = data?.data;

    function handleResetValues() {
        reset({
            bookingStatus: "Pendente",
            paymentStatus: "Pendente",
            paymentMode: undefined,
            totalPrice: "",
            addressId: "",
            filialId: user?.sourceFilial.filialId,
            accountableEmployeeId: user?.sub,
            customer: undefined,
            gears: [],
            date: undefined,
            startHourInMinutes: 0,
            totalDurationInMinutes: 0,
            observations: "",
            driverId: "",
            partialPayment: "",
        });
    }

    async function handleCreateNewCheckout(newCheckoutData: CreateCheckoutFormSchemaType) {
        const response = await CreateCheckout(
            {
                ...newCheckoutData,
                totalPrice: parseStringToCents(newCheckoutData.totalPrice),
                partialPayment: parseStringToCents(newCheckoutData.partialPayment || "0"),
            });

        if(response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        }

        handleResetValues();
    };

    return (
        <div className="">
            <div className="space-y-2 mb-8 flex flex-col md:flex-row md:items-center">
                <div className="ml-auto mr-auto w-[50%]">
                    {
                        user?.role === "Gerente" && (
                            <Controller
                                control={ control }
                                name="filialId"
                                render={ ({ field }) => (
                                    <SelectFilial
                                        control={ control }
                                        name={ field.name }
                                        defaultFilial={ user?.sourceFilial.filialId }
                                    />
                                ) }
                            />
                        )
                    }
                </div>
            </div>

            <form id="new-booking-form">
                <FormProvider { ...createBookingFormMethods }>
                    <div className="flex flex-col gap-10">
                        {/* Customer and Gear Selection */}
                        <Card className="transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-primary" />
                  Informações básicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 w-full">
                                <div className="space-y-2 w-full">
                                    <Label htmlFor="cliente" className="text-sm font-medium">
                                        <User />
                                        Cliente
                                    </Label>
                                    <SelectCustomer />
                                    {errors.customer && errors.customer.customerId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.customer.customerId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 w-full">
                                    <Label htmlFor="cliente" className="text-sm font-medium">
                                        <Pin />
                                        Endereço
                                    </Label>
                                    <SelectAddress setAddressString={ setAddressString } />
                                    {errors.customer && errors.customer.customerId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.customer.customerId.message}
                                        </p>
                                    )}
                                </div>

                                <GearsSection />

                                <div className="space-y-2">
                                    <Label htmlFor="equipamento" className="text-sm font-medium">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        Valor
                                    </Label>
                                    <div className="flex flex-col flex-1">
                                        <PriceInput withLabel={ false } register={ register("totalPrice") } value={ watchPrice } setValue={ setValue } name="totalPrice" />
                                        {errors.totalPrice && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.totalPrice.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipamento" className="text-sm font-medium">
                                        <Truck className="h-5 w-5 text-primary" />
                                        Motorista
                                    </Label>
                                    <div className="flex flex-col flex-1">
                                        <SelectEmployee
                                            control={ control }
                                            name="driverId"
                                            setDriverString={ setDriverString }
                                            employeeRole="Motorista"
                                            filialId={ user?.role === "Gerente" ? undefined : user?.sourceFilial.filialId }
                                        />

                                        {errors.driverId && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.driverId.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date and Time Selection */}
                        <CheckoutTimeSelector
                            name="date"
                            control={ control }
                            checkoutSchedule={ checkoutSchedule }
                        />
                        {/* Amount and Price */}
                        <div className="pb-0 flex flex-col w-full justify-center gap-3">

                            {/* Observations */}
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Observações
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="observacoes" className="text-sm font-medium">
                                        Detalhes adicionais (opcional)
                                        </Label>
                                        <Textarea
                                            { ...register("observations") }
                                            className="min-h-[120px] resize-none placeholder:text-muted-foreground/60 pb-0"
                                            placeholder="Digite informações adicionais sobre o agendamento, requisitos especiais, ou outras observações relevantes..."
                                        />

                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                        <Card>
                            <CheckoutPaymentMethod />
                        </Card>

                        {/* Resumo Final */}
                        {selectedDate && startHour && watchTotalDurationInMinutes && watchPrice && !isDateInPast && (
                            <Card className="bg-primary/5 border-primary/20 w-[80%] ml-auto mr-auto">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary flex justify-between">
                                        Resumo da Reserva
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={ () => {
                                                const textToCopy = `
Equipamento${watchSelectedGears.length > 1 ? "s" : ""}: ${watchSelectedGears.map(item => item.gearName).join(", ")}
Data: ${selectedDate.toLocaleDateString("pt-BR")}
Horário: ${minutesToHHMM(startHour)} - ${minutesToHHMM(startHour + watchTotalDurationInMinutes)}
Duração: ${watchTotalDurationInMinutes / 60}h
Preço: R$ ${watchPrice}
Cliente: ${watchCustomer.fullname} - ${hideDocumentNumber(watchCustomer.documentNumber)}
Contato: ${watchCustomer.cellphone}
Endereço: ${addressString}
Motorista: ${driverString}
    `
                                                    .replace(/[ \t]+\n/g, "\n")
                                                    .trim();

                                                navigator.clipboard.writeText(textToCopy);
                                                toast.success("Resumo copiado para a área de transferência.");
                                            } }
                                        >
                                            <Copy className="w-4 h-4 text-primary" />
                                        </Button></CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Equipamento{watchSelectedGears.length > 1 ? "s" : ""}:</span>
                                        <span className="font-medium">{watchSelectedGears.map(item => item.gearName).join(", ")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Data:</span>
                                        <span className="font-medium">{selectedDate.toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Horário:</span>
                                        <span className="font-medium">
                                            {minutesToHHMM(startHour)} - {minutesToHHMM(startHour + watchTotalDurationInMinutes)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Duração:</span>
                                        <span className="font-medium">{watchTotalDurationInMinutes/60}h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Preço:</span>
                                        <span className="font-medium">R$ {watchPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-medium">{watchCustomer.fullname} - {hideDocumentNumber(watchCustomer.documentNumber)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contato:</span>
                                        <span className="font-medium">{watchCustomer.cellphone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Endereço:</span>
                                        <span className="font-medium text-right">{addressString}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Motorista:</span>
                                        <span className="font-medium text-right">{driverString}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Popover open={ isQuickBookingPaymentModeDialogOpen } onOpenChange={ setQuickBookingPaymentModeDialogOpen }>
                                <PopoverTrigger asChild>
                                    <Button
                                        disabled={ !startHour || watchSelectedGears.length < 0 || !watchPrice }
                                        type="button"
                                        onClick={ handleSubmit((data) => handleCreateNewCheckout(data)) }
                                        className="flex-1">

                                        <Check className="h-4 w-4 mr-2" />
                                        <span className="md:flex hidden md:items-center">Finalizar Reserva</span>
                                    </Button>
                                </PopoverTrigger>
                            </Popover>
                        </div>
                    </div>
                </FormProvider>
            </form>
        </div>
    );

}
