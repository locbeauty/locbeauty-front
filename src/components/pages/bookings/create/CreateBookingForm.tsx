"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AlertCircle, User, MessageSquare, Plus, Check, DollarSign, Settings, Pin, ShipWheel, FerrisWheel, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import PriceInput from "@/components/shared/PriceInput";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { SelectFilial } from "@/components/shared/SelectFilial";
import BookingTimeSelector from "./BookingTimeSelector";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-provider";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { SelectAddress } from "./SelectAddress";
import { QuickBookingPaymentModePopover } from "./QuickBookingPaymentModePopover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { createBookingFormSchema, CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { SelectEmployee } from "@/components/shared/SelectEmployee";

export interface GetDayBookingsResponse {
  hourInMinutes: number,
  formattedTime: string,
  availability: {
        durationInMinutes: number,
        available: boolean,
        maxGearAmount: number
    }[],
}

export function CreateBookingForm() {
    const { user } = useAuth();
    const createBookingFormMethods = useForm<CreateBookingFormSchemaType>({
        resolver: zodResolver(createBookingFormSchema),
        defaultValues: {
            gearAmount: 0,
            bookingStatus: "Pendente",
            paymentStatus: "Pendente",
            paymentMode: undefined,
            price: "",
            addressId: "",
            filialId: user?.sourceFilial.filialId,
        },
    });

    const [ bookingSchedule, setBookingSchedule ] = useState<GetDayBookingsResponse[] | undefined>();
    const [ maximumGearAmountAvailable, setMaximumGearAmountAvailable ] = useState(0);
    const [ shouldCheckout, setShouldCheckout ] = useState(false);
    const [ isQuickBookingPaymentModeDialogOpen, setQuickBookingPaymentModeDialogOpen ] = useState(false);
    const {
        handleSubmit,
        register,
        watch,
        setValue,
        formState: { errors },
        control,
    } = createBookingFormMethods;

    const { addItem, getTotalItems, items, clearCart, handleCheckout } = useCart();

    const startHour = watch("startHourInMinutes");
    const watchTotalDurationInMinutes = watch("totalDurationInMinutes");
    const watchGearAmount = watch("gearAmount");
    const selectedDate = watch("date");
    const watchFilialId = watch("filialId");
    const watchGearId = watch("gear");
    const watchPrice = watch("price");
    const isDateInPast = selectedDate && selectedDate < new Date();

    useEffect(() => {
        setBookingSchedule(undefined);
    }, [ items ]);

    useEffect(() => {
        setValue("startHourInMinutes", 0);
        setValue("totalDurationInMinutes", 0);
        setValue("gearAmount", 0);
        async function getDayBookings() {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/bookings/available?filialId=${watchFilialId}&gearId=${watchGearId.gearId}&date=${selectedDate}`, {
                credentials: "include",
            });
            const { data }: {data: GetDayBookingsResponse[]} = await response.json();
            setBookingSchedule(data);
        }
        if(watchFilialId && watchGearId && selectedDate) {
            getDayBookings();
        }
    }, [ selectedDate, watchFilialId, watchGearId, setValue ]);

    async function handleAddToCart(newBookingData: CreateBookingFormSchemaType, showAddToCartToast?: boolean) {
        if (!startHour || !watchGearId || !selectedDate) {
            alert("Por favor, preencha todos os campos obrigatórios");
            return;
        }

        addItem(newBookingData);
        if(showAddToCartToast) {
            toast.success("Agendamento adicionado ao carrinho!", {
                style: { fontSize: "1rem" },
            });
        }
        console.log("HANDLE ADD TO CART");
        window.scroll({ top: 0 });
        setBookingSchedule(undefined);
        // @ts-expect-error booking cannot be sended without date, but is set as undefined to reset after user put some item in the cart.
        setValue("date", undefined);
        setValue("startHourInMinutes", 0);
        setValue("totalDurationInMinutes", 0);
        // @ts-expect-error same as date
        setValue("gear", undefined);
        setValue("gearAmount", 0);
        setValue("price", "");
        setValue("observations", "");
    };

    useEffect(() => {
        if (shouldCheckout && items.length > 0) {
            handleCheckout();
            setShouldCheckout(false);
            clearCart();
        }
    }, [ items, shouldCheckout, clearCart, handleCheckout ]);

    useEffect(() => {
        console.log("errors;" ,errors);
    }, [ errors ]);

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
                                    <SelectCustomer disabled={ getTotalItems() > 0 } />
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
                                    <SelectAddress disabled={ getTotalItems() > 0 } />
                                    {errors.customer && errors.customer.customerId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.customer.customerId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="equipamento" className="text-sm font-medium">
                                        <Settings />
                                Equipamento
                                    </Label>
                                    <SelectGear />

                                    {errors.gear && errors.gear.gearId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.gear.gearId.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipamento" className="text-sm font-medium">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        Valor
                                    </Label>
                                    {/* <div className="flex md:flex-row flex-col md:items-end items-center gap-5"> */}
                                    <div className="flex flex-col flex-1">
                                        <PriceInput withLabel={ false } register={ register("price") } value={ watchPrice } setValue={ setValue } name="price" />
                                        {errors.price && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                    {/* </div> */}

                                    {errors.gear && errors.gear.gearId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.gear.gearId.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipamento" className="text-sm font-medium">
                                        <Truck className="h-5 w-5 text-primary" />
                                        Motorista
                                    </Label>
                                    {/* <div className="flex md:flex-row flex-col md:items-end items-center gap-5"> */}
                                    <div className="flex flex-col flex-1">
                                        <SelectEmployee control={ control } name="driverId" />

                                        {errors.price && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                    {/* </div> */}

                                    {errors.gear && errors.gear.gearId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.gear.gearId.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* <div className=""> */}
                        {/* <Card className="transition-all duration-200 hover:shadow-md">
                            <CardHeader className="">
                                <CardTitle className="flex items-center gap-2 text-lg">

                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                            </CardContent>
                        </Card> */}
                        {/* </div> */}

                        {/* Date and Time Selection */}
                        <BookingTimeSelector
                            name="date"
                            control={ control }
                            setMaximumGearAmountAvailable={ setMaximumGearAmountAvailable }
                            bookingSchedule={ bookingSchedule }
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

                        {/* Resumo Final */}
                        {selectedDate && startHour && watchTotalDurationInMinutes && watchPrice && !isDateInPast && (
                            <Card className="bg-primary/5 border-primary/20 w-[80%] ml-auto mr-auto">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">Resumo da Reserva</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={ handleSubmit((data) => handleAddToCart(data, true)) }
                                className="flex-1 bg-transparent"
                                disabled={ !startHour || !watchGearId || !watchPrice || watchGearAmount === 0 }
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="md:flex hidden md:items-center">Adicionar ao Carrinho</span>
                            </Button>
                            <Popover open={ isQuickBookingPaymentModeDialogOpen } onOpenChange={ setQuickBookingPaymentModeDialogOpen }>
                                <PopoverTrigger asChild>
                                    <Button
                                        disabled={ !startHour || !watchGearId || items.length > 0 || !watchPrice || watchGearAmount === 0 }
                                        type="button"
                                        // onClick={ handleSubmit((data) => handleQuickBooking(data)) }
                                        className="flex-1">

                                        <Check className="h-4 w-4 mr-2" />
                                        <span className="md:flex hidden md:items-center">Criar Reserva Rápida</span>
                                    </Button>
                                </PopoverTrigger>
                                <QuickBookingPaymentModePopover
                                    setQuickBookingPaymentModeDialogOpen={ setQuickBookingPaymentModeDialogOpen }
                                    handleAddToCart={ handleAddToCart }
                                    setShouldCheckout={ setShouldCheckout }
                                />
                            </Popover>
                        </div>
                    </div>
                </FormProvider>
            </form>
        </div>
    );

}
