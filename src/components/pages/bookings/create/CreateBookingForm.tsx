"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { type CreateBookingFormSchemaType, createBookingFormSchema } from "@/lib/zod/CreateBookingValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { AlertCircle, User, Package, MessageSquare, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import PriceInput from "@/components/shared/PriceInput";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { Gear } from "@/utils/@types/gears";
import BookingTimeSelector from "./BookingTimeSelector";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentStatuses } from "@/utils/@types/bookings";
import { Button } from "@/components/ui/button";

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
            filialId: user?.sourceFilial.filialId
        },
    });

    const [ selectedTime, setSelectedTime ] = useState<{
    start: string
    end: string
    duration: number
  }>();

    const [ selectedGear, setSelectedGear ] = useState<Gear | null>(null);
    const [ bookingSchedule, setBookingSchedule ] = useState<GetDayBookingsResponse[] | undefined>();
    const [ maximumGearAmountAvailable, setMaximumGearAmountAvailable ] = useState(0);

    const {
        handleSubmit,
        register,
        watch,
        reset,
        formState: { errors },
        control,
        setValue,
    } = createBookingFormMethods;

    const startHour = watch("startHourInMinutes");
    const selectedDate = watch("date");
    const bookingDuration = watch("totalDuration");
    const watchFilialId = watch("filialId");
    const watchGearId = watch("gearId");
    const watchCustomerId = watch("customerId");
    const isDateInPast = selectedDate && selectedDate < new Date();

    useEffect(() => {
        if (!selectedTime) return;

        const [ hour, minute ] = selectedTime.start.split(":").map(Number);
        const parsedHour = hour * 60 + minute;

        setValue("startHourInMinutes", parsedHour);
        setValue("totalDuration", selectedTime.duration);
    }, [ selectedTime, setValue, startHour ]);

    useEffect(() => {
        async function getDayBookings() {
            const response = await fetch(`http://localhost:3333/api/bookings?filialId=${watchFilialId}&gearId=${watchGearId}&date=${selectedDate}`, {
                credentials: "include",
            });
            const { data }: {data: GetDayBookingsResponse[]} = await response.json();
            setBookingSchedule(data);
        }
        if(watchFilialId && watchCustomerId && watchGearId && selectedDate) {
            getDayBookings();
        }
    }, [ selectedDate, watchFilialId, watchCustomerId, watchGearId ]);

    async function handleCreateBooking(newBookingData: CreateBookingFormSchemaType) {
        const bookingInfoWithPrice = {
            ...newBookingData,
            price: parseStringToCents(newBookingData.price)
        };

        try {
            const response = await fetch("http://192.168.0.39:3333/api/bookings/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingInfoWithPrice),
            });
            const data = await response.json();

            if (!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
            } else {
                toast.success("Agendamento criado com sucesso!", {
                    style: { fontSize: "1rem" },
                });
                window.scroll({ top: 0 });
                reset();
            }

            setBookingSchedule(undefined);
        } catch {
            toast.error("Erro ao criar agendamento.");
        }
    }

    return (
        <div className="">
            <div className="ml-5 space-y-2 mb-8 flex flex-col items-center">
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

            <form id="new-booking-form" onSubmit={ handleSubmit(handleCreateBooking) }>
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
                                    <SelectCustomer />
                                    {errors.customerId && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.customerId.message}
                                        </p>
                                    )}
                                </div>

                            </CardContent>

                            <div className="space-y-2 px-5">
                                <Label htmlFor="equipamento" className="text-sm font-medium">
                    Equipamento
                                </Label>
                                <SelectGear setSelectedGear={ setSelectedGear } control={ control } name="gearId" />
                                {errors.gearId && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.gearId.message}
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
                            setSelectedTime={ setSelectedTime }
                        />

                        {/* Amount and Price */}
                        <Card className="transition-all duration-200 hover:shadow-md pb-0">
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
                                            <div className="flex md:flex-row md:items-center md:justify-start gap-3 flex-col justify-center">
                                                <AmountControlButton
                                                    value={ field.value || 0 }
                                                    onChange={ field.onChange }
                                                    error={ !!errors.gearAmount }
                                                    disabled={ selectedGear ? false : true }
                                                    max={ maximumGearAmountAvailable }
                                                />
                                                {
                                                    startHour && selectedDate && bookingDuration && bookingDuration > 0 ? (
                                                        <span className="text-xs text-center">Quantidade máxima disponível: {maximumGearAmountAvailable}</span>
                                                    ) : (
                                                        <span className="text-xs text-center">Escolha a data, a hora inicial e a duração da reserva para mostrar a quantidade máxima de unidades disponíveis</span>
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
                                        <PriceInput register={ register("price") } />
                                        {errors.price && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="">
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
                        </Card>

                        {/* Resumo Final */}
                        {selectedDate && selectedTime && !isDateInPast && (
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">Resumo da Reserva</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex gap-15">
                                        <span className="text-muted-foreground">Data:</span>
                                        <span className="font-medium">{selectedDate.toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    <div className="flex gap-10">
                                        <span className="text-muted-foreground">Horário:</span>
                                        <span className="font-medium">
                                            {selectedTime.start} - {selectedTime.end}
                                        </span>
                                    </div>
                                    <div className="flex gap-9">
                                        <span className="text-muted-foreground">Duração:</span>
                                        <span className="font-medium">{selectedTime.duration}h</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                // onClick={ handleAddToCart }
                                className="flex-1 bg-transparent"
                                disabled={ !selectedTime || !selectedGear }
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="md:flex hidden md:items-center">Adicionar ao Carrinho</span>
                            </Button>

                            <Button type="submit" className="flex-1">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                <span className="md:flex hidden md:items-center">Criar Reserva Direta</span>
                            </Button>
                        </div>
                    </div>
                </FormProvider>
            </form>
        </div>
    );

}
