"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AlertCircle, User, MessageSquare, Check, Settings, Pin, Truck, X, Copy, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { AdditionalCostsDialog } from "./AdditionalCostsDialog";
import { centsToString } from "@/utils/centsToString";
import { queryClient } from "@/app/(main)/layout";

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
        register,
        formState: { errors },
    } = useFormContext<CreateCheckoutFormSchemaType>();

    const watchedGears = watch("gears");

    const watchSelectedGears = useMemo(() => watchedGears || [], [ watchedGears ]);

    useEffect(() => {
        const selectedGearsCost = watchSelectedGears.reduce(
            (acc, item) => acc + parseStringToCents(item.individualPrice),
            0
        );

        setValue("basePrice", centsToString(selectedGearsCost));
        setValue("totalPrice", centsToString(selectedGearsCost));
    }, [ watchSelectedGears, setValue ]);

    function handleAddGear(gear: Gear) {
        setValue("gears", [
            ...watchSelectedGears,
            {
                gearId: gear.gearId,
                gearName: gear.gearName,
                individualPrice: "0",
            },
        ]);
    }

    function handleRemoveGear(gearId: string) {
        setValue(
            "gears",
            watchSelectedGears.filter((g) => g.gearId !== gearId)
        );
    }

    function handlePriceChange(index: number, value: string) {
        const updatedGears = [ ...watchSelectedGears ];
        updatedGears[index].individualPrice = value;
        setValue("gears", updatedGears);
    }

    return (
        <div className="space-y-2">
            <Label
                htmlFor="equipamento"
                className="text-sm font-medium flex items-center gap-1"
            >
                <Settings className="w-4 h-4" />
                Equipamentos
            </Label>

            <div className="flex flex-col gap-2">
                {watchSelectedGears.map((gear, index) => (
                    <div key={ gear.gearId } className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            className="justify-start text-black font-black min-w-[200px]"
                            disabled
                        >
                            {gear.gearName}
                        </Button>

                        <div className="flex flex-col w-[150px]">
                            <PriceInput
                                withLabel={ false }
                                name={ `gears.${index}.individualPrice` }
                                value={ gear.individualPrice }
                                onChange={ (val: string) =>
                                    handlePriceChange(index, val)
                                }
                            />
                            <div>
                                {errors.gears?.[index]?.individualPrice && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {
                                            errors.gears[index].individualPrice.message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={ () => handleRemoveGear(gear.gearId) }
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ))}

                {watchSelectedGears.length < 3 && (
                    <div className="w-[200px]">
                        <SelectGear onSelect={ handleAddGear } />
                    </div>
                )}
            </div>

            {typeof errors.gears?.message === "string" && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gears.message}
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
            checkoutStatus: "Pendente",
            paymentStatus: "Pendente",
            paymentMode: undefined,
            basePrice: "",
            addressId: "",
            filialId: user?.sourceFilial.filialId,
            accountableEmployeeId: user?.sub
        },
    });

    const [ isAdditionalCostsDialogOpen, setAdditionalCostsDialogOpen ] = useState(false);
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
    const watchCustomer = watch("customer");
    const isDateInPast = selectedDate && selectedDate < new Date();

    const watchBasePrice = watch("basePrice");
    const watchTotalPrice = watch("totalPrice");
    const watchExtraMachineCosts = watch("extraMachineCosts");

    const watchDistanceInKm = watch("distanceInKm");
    const watchLodgingCost = watch("lodgingCost");
    const watchFoodCost = watch("foodCost");
    const watchFuelCost = watch("fuelCost");
    const watchAdditionalTransportCost = watch("additionalTransportCost");

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
            checkoutStatus: "Pendente",
            paymentStatus: "Pendente",
            paymentMode: undefined,
            totalPrice: "0",
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
            additionalTransportCost: "0",
            basePrice: "0",
            distanceInKm: 0,
            extraMachineCosts: "0",
            foodCost: "0",
            fuelCost: "0",
            lodgingCost: "0",
        });
    }

    async function handleCreateNewCheckout(newCheckoutData: CreateCheckoutFormSchemaType) {
        const response = await CreateCheckout({
            ...newCheckoutData,
            basePrice: newCheckoutData.basePrice ? parseStringToCents(newCheckoutData.basePrice) : 0,
            extraMachineCosts: newCheckoutData.extraMachineCosts ? parseStringToCents(newCheckoutData.extraMachineCosts) : 0,
            lodgingCost: newCheckoutData.lodgingCost ? parseStringToCents(newCheckoutData.lodgingCost) : 0,
            foodCost: newCheckoutData.foodCost ? parseStringToCents(newCheckoutData.foodCost) : 0,
            fuelCost: newCheckoutData.fuelCost ? parseStringToCents(newCheckoutData.fuelCost) : 0,
            additionalTransportCost: newCheckoutData.additionalTransportCost ? parseStringToCents(newCheckoutData.additionalTransportCost) : 0,
            totalPrice: newCheckoutData.totalPrice ? parseStringToCents(newCheckoutData.totalPrice) : 0,
            partialPayment: newCheckoutData.partialPayment ? parseStringToCents(newCheckoutData.partialPayment) : 0,
            gears: newCheckoutData.gears.map(item => ({
                ...item,
                individualPrice: item.individualPrice ? parseStringToCents(item.individualPrice) : 0
            }))
        });

        if(response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            queryClient.invalidateQueries({
                queryKey: [ "get-all-checkouts" ]
            });
            handleResetValues();
            window.scroll({ top: 0 });
        } else {
            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        }

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

                                <AdditionalCostsDialog
                                    setAdditionalCostsDialogOpen={ setAdditionalCostsDialogOpen }
                                    isAdditionalCostsDialogOpen={ isAdditionalCostsDialogOpen }
                                />

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
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
                        {selectedDate && startHour && watchTotalDurationInMinutes && watchTotalPrice && !isDateInPast && (
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
Preço: R$ ${watchTotalPrice}
Cliente: ${watchCustomer.fullname} - ${watchCustomer.documentNumber}
Contato: ${watchCustomer.cellphone}
Endereço: ${addressString}
Motorista: ${driverString || "A definir"}
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
                                        <span className="font-medium">R$ {watchTotalPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-medium">{watchCustomer.fullname} - {watchCustomer.documentNumber}</span>
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
                                        <span className="font-medium text-right">{driverString || "A definir"}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                disabled={ !startHour || watchSelectedGears.length < 0 || !watchTotalPrice || watchTotalPrice === "0,00" }
                                type="button"
                                onClick={ handleSubmit((data) => handleCreateNewCheckout(data)) }
                                className="flex-1">

                                <Check className="h-4 w-4 mr-2" />
                                <span className="md:flex hidden md:items-center">Finalizar Reserva</span>
                            </Button>
                        </div>
                    </div>
                </FormProvider>
            </form>
        </div>
    );

}
