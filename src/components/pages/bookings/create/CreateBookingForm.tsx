import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { CreateBookingFormSchemaType, createBookingFormSchema } from "@/lib/zod/CreateBookingValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { DatePicker } from "@/components/ui/DatePicker";
import { AlertCircle, Clock, Info, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearSelection, getBadgeStyle, handleMouseEnter, handleMouseLeave, handleTimeClick, isHourInRange, isValidEndHour } from "@/utils/create-booking-helpers";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";

export const availableHours = [
    { hour: 5, available: true },
    { hour: 6, available: true },
    { hour: 7, available: true },
    { hour: 8, available: false },
    { hour: 9, available: false },
    { hour: 10, available: false },
    { hour: 11, available: false },
    { hour: 12, available: false },
    { hour: 13, available: false },
    { hour: 14, available: false },
    { hour: 15, available: true },
    { hour: 16, available: true },
    { hour: 17, available: true },
    { hour: 18, available: true },
    { hour: 19, available: true },
    { hour: 20, available: true },
    { hour: 21, available: true },
    { hour: 22, available: false },
];

export function CreateBookingForm() {

    const createBookingFormMethods = useForm<CreateBookingFormSchemaType>({
        resolver: zodResolver(createBookingFormSchema),
        defaultValues: {
            amount: 0,
            price: "",
            bookingStatus: "Não iniciado",
            paymentStatus: "Não pago",
        },
    });

    const { handleSubmit, register, watch, formState: { errors }, control, setValue, trigger } = createBookingFormMethods;
    const [ hoverHour, setHoverHour ] = useState<number | null>(null);

    const bookingDate = watch("date");
    const watchStartHour = watch("startHour");
    const watchEndHour = watch("endHour");

    useEffect(() =>{
        setValue("totalDuration", watchEndHour && watchStartHour ? watchEndHour - watchStartHour : 0);
    }, [ watchEndHour, watchStartHour, setValue ]);

    function handleCreateBooking(newBookingData: CreateBookingFormSchemaType) {
        console.log("newBookingData", newBookingData);
    }

    return (
        <CardContent>
            <form id="new-booking-form" className="space-y-6" onSubmit={ handleSubmit(handleCreateBooking) }>
                <FormProvider { ...createBookingFormMethods }>
                    <div className="space-y-2">
                        <Label htmlFor="cliente">Cliente</Label>
                        <SelectCustomer />
                        <div className="h-2">
                            {errors.customerId && (
                                <p className="text-sm text-destructive mt-2">
                                    {errors.customerId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="equipamento">Equipamento</Label>
                        <SelectGear />
                        <div className="h-2">
                            {errors.gearName && (
                                <p className="text-sm text-destructive mt-2">
                                    {errors.gearName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Quantidade</Label>
                            <Controller
                                control={ control }
                                name="amount"
                                render={ ({ field }) => (
                                    <AmountControlButton
                                        value={ field.value || 0 }
                                        onChange={ field.onChange }
                                        error={ !!errors.amount }
                                    />
                                ) }
                            />
                            <div className="h-2">
                                {errors.amount && (
                                    <p className="text-sm text-destructive mt-2">
                                        {errors.amount.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <PriceInput register={ register("price") } />
                        <div className="h-2">
                            {errors.price && (
                                <p className="text-sm text-destructive m-0">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <CardContent className="space-y-4 p-4 rounded-lg border-1 border-gray-300">
                        <div className="space-y-2">
                            <Label htmlFor="data" className="font-medium">
                  Data da reserva
                            </Label>
                            <Controller
                                control={ control }
                                name="date"
                                render={ ({ field }) => (
                                    <DatePicker
                                        value={ field.value! }
                                        onChange={ field.onChange }
                                        placeholder="Selecione a data da reserva"
                                        clearable
                                    />
                                ) }
                            />
                            {errors.date && (
                                <p className="text-sm text-destructive flex items-center mt-1">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.date.message}
                                </p>
                            )}
                        </div>

                        {bookingDate && bookingDate > new Date() && (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center flex-col gap-2 mb-3">
                                    <div className="flex gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <Label className="font-medium">Horário da reserva</Label>
                                    </div>

                                    {watchStartHour && (
                                        <div className="md:ml-auto flex flex-col md:flex-row justify-center items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {watchStartHour}:00
                                                {watchEndHour !== null && ` até ${watchEndHour}:00`}
                                                {watchEndHour === null &&
                                                                hoverHour !== null &&
                                                                isValidEndHour(hoverHour, watchStartHour) &&
                                                                ` até ${hoverHour}:00`}
                                            </span>
                                            <Button onClick={ () => clearSelection(setValue) } type="button" variant="outline" size="sm" className="h-8 px-2">
                                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                <span className="text-xs">Limpar</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-muted/40 p-4 rounded-lg">
                                    <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-18 gap-1.5">
                                        {availableHours.map(({ hour, available }) => (
                                            <Badge
                                                key={ hour }
                                                variant={ isHourInRange(hour, watchStartHour, hoverHour, watchEndHour) ? "default" : "outline" }
                                                className={ cn(
                                                    "h-9 w-full flex items-center justify-center transition-all",
                                                    getBadgeStyle(hour, available, watchStartHour, watchEndHour, hoverHour),
                                                ) }
                                                onClick={ () => handleTimeClick(hour, available, watchStartHour, watchEndHour, setValue, trigger) }
                                                onMouseEnter={ () => handleMouseEnter(hour, available, watchStartHour, watchEndHour, setHoverHour) }
                                                onMouseLeave={ () => handleMouseLeave(setHoverHour) }
                                            >
                                                {hour}:00
                                            </Badge>
                                        ))}
                                    </div>

                                    {watchStartHour !== null && watchEndHour === null && (
                                        <div className="text-xs text-muted-foreground mt-3 text-center">
                        Selecione um horário final (apenas horários consecutivos disponíveis)
                                        </div>
                                    )}

                                    {!watchStartHour && (
                                        <div className="text-xs text-muted-foreground mt-3 text-center">
                        Selecione um horário inicial para começar
                                        </div>
                                    )}
                                </div>
                                {errors.startHour && (
                                    <p className="text-sm text-destructive flex items-center mt-1">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.startHour.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {(!bookingDate || bookingDate < new Date()) && (
                            <div className="flex items-center justify-center p-6 text-muted-foreground">
                                <Info className="h-4 w-4 mr-2 shrink-0" />
                                <span className="text-sm">Selecione uma data futura para ver os horários disponíveis</span>
                            </div>
                        )}

                    </CardContent>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            { ...register("observations") }
                            className="h-[120px] resize-none max-w-[80vw] placeholder:text-placeholder"
                            placeholder="Digite detalhes adicionais."
                        />
                    </div>
                </FormProvider>
            </form>
        </CardContent>
    );
}
