"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { type CreateBookingFormSchemaType, createBookingFormSchema } from "@/lib/zod/CreateBookingValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { AlertCircle, User, Package, MessageSquare, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import PriceInput from "@/components/shared/PriceInput";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { SelectFilial } from "@/components/shared/SelectFilial";
import BookingTimeSelector from "./BookingTimeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentStatuses } from "@/utils/@types/bookings";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-provider";
import { minutesToHHMM } from "@/utils/minutesToHHMM";

export interface GetDayBookingsResponse {
  hourInMinutes: number,
  formattedTime: string,
  availability: {
        durationInMinutes: number,
        available: boolean,
        maxGearAmount: 4
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
            price: "",
            filialId: user?.sourceFilial.filialId,
        },
    });

    const [ bookingSchedule, setBookingSchedule ] = useState<GetDayBookingsResponse[] | undefined>();
    const [ maximumGearAmountAvailable, setMaximumGearAmountAvailable ] = useState(0);
    const [ shouldCheckout, setShouldCheckout ] = useState(false);

    const {
        handleSubmit,
        reset,
        register,
        watch,
        setValue,
        formState: { errors },
        control,
    } = createBookingFormMethods;

    const { addItem, getTotalItems, items, clearCart, handleCheckout } = useCart();

    const startHour = watch("startHourInMinutes");
    const watchTotalDurationInMinutes = watch("totalDuration");
    const watchGearAmount = watch("gearAmount");
    const selectedDate = watch("date");
    const watchFilialId = watch("filialId");
    const watchGearId = watch("gear");
    const watchPrice = watch("price");
    const isDateInPast = selectedDate && selectedDate < new Date();

    useEffect(() => {
        setValue("startHourInMinutes", 0);
        setValue("totalDuration", 0);
        setMaximumGearAmountAvailable(0);
    }, [ watchGearId ]);

    useEffect(() => {
        setBookingSchedule(undefined);
    }, [ items ]);

    useEffect(() => {
        async function getDayBookings() {
            const response = await fetch(`http://localhost:3333/api/bookings?filialId=${watchFilialId}&gearId=${watchGearId.gearId}&date=${selectedDate}`, {
                credentials: "include",
            });
            const { data }: {data: GetDayBookingsResponse[]} = await response.json();
            setBookingSchedule(data);
        }
        if(watchFilialId && watchGearId && selectedDate) {
            getDayBookings();
        }
    }, [ selectedDate, watchFilialId, watchGearId ]);

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

        window.scroll({ top: 0 });
        setBookingSchedule(undefined);
        // @ts-expect-error booking cannot be sended withou date, but is set as undefined to reset after user put some item in the cart.
        setValue("date", undefined);
        setValue("startHourInMinutes", 0);
        setValue("totalDuration", 0);
        // @ts-expect-error same as date
        setValue("gear", undefined);
        setValue("gearAmount", 0);
        setValue("price", "");
        setValue("observations", "");
        setValue("paymentStatus", "Pendente");
    };

    const handleQuickBooking = (formData: CreateBookingFormSchemaType) => {
        handleAddToCart(formData);
        setShouldCheckout(true);
        reset();
    };

    useEffect(() => {
        if (shouldCheckout && items.length > 0) {
            handleCheckout();
            setShouldCheckout(false);
            clearCart();
        }
    }, [ items, shouldCheckout ]);

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

                            </CardContent>

                            <div className="space-y-2 px-5">
                                <Label htmlFor="equipamento" className="text-sm font-medium">
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
                        </Card>

                        {/* Date and Time Selection */}
                        <BookingTimeSelector
                            name="date"
                            control={ control }
                            setMaximumGearAmountAvailable={ setMaximumGearAmountAvailable }
                            bookingSchedule={ bookingSchedule }
                        />
                        {/* Amount and Price */}
                        <div className="pb-0 flex w-full justify-center gap-3">
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5 text-primary" />
                  Quantidade e valor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-sm font-medium">
                    Quantidade
                                        </Label>
                                        <Controller
                                            control={ control }
                                            name="gearAmount"
                                            render={ ({ field }) => (
                                                <div className="flex gap-3 flex-col justify-center">
                                                    <AmountControlButton
                                                        value={ field.value || 0 }
                                                        onChange={ field.onChange }
                                                        error={ !!errors.gearAmount }
                                                        disabled={ watchGearId ? false : true }
                                                        max={ maximumGearAmountAvailable }
                                                    />
                                                    {
                                                        startHour && selectedDate && watchTotalDurationInMinutes && watchTotalDurationInMinutes > 0 ? (
                                                            <span className="text-sm">Máximo: {maximumGearAmountAvailable}</span>
                                                        ) : (
                                                            <span className="text-sm">Escolha a data, a hora inicial e a duração da reserva para mostrar a quantidade máxima de unidades disponíveis</span>
                                                        )
                                                    }
                                                </div>
                                            ) }
                                        />
                                        {errors.gearAmount && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.gearAmount.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex md:flex-row flex-col md:items-end items-center gap-5">
                                        <div className="flex flex-col flex-1">
                                            <PriceInput register={ register("price") } value={ watchPrice } setValue={ setValue } name="price" />
                                            {errors.price && (
                                                <p className="text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.price.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="">
                                            <span className="text-sm font-semibold">Status</span>
                                            <Controller
                                                control={ control }
                                                name="paymentStatus"
                                                render={ ({ field }) => (
                                                    <Select value={ field.value } onValueChange={ field.onChange }>
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Status de pagamento" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentStatuses.map((status) => (
                                                                <SelectItem key={ status } value={ status }>
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) }
                                            />
                                            {errors.paymentStatus && (
                                                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.paymentStatus.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

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

                            <Button
                                disabled={ !startHour || !watchGearId || items.length > 0 || !watchPrice || watchGearAmount === 0 }
                                type="button"
                                onClick={ handleSubmit(handleQuickBooking) }
                                className="flex-1">

                                <Check className="h-4 w-4 mr-2" />
                                <span className="md:flex hidden md:items-center">Criar Reserva Direta</span>
                            </Button>
                        </div>
                    </div>
                </FormProvider>
            </form>
        </div>
    );

}
