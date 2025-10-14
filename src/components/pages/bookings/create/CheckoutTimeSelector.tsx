"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import TimePicker from "./time-picker";
import { Control, Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { GetDayCheckoutsResponse } from "./CreateBookingForm";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";

interface CheckoutTimeSelectorProps<T extends FieldValues> {
    control: Control<T>
    name: Path<T>
    checkoutSchedule: GetDayCheckoutsResponse[] | undefined
}

export default function CheckoutTimeSelector<T extends FieldValues>({ name, checkoutSchedule, control }: CheckoutTimeSelectorProps<T>) {
    const { setValue, watch } = useFormContext<CreateCheckoutFormSchemaType>();

    const watchDate = watch("date");

    const isDateInPast = watchDate && watchDate < new Date();

    useEffect(() => {
        console.log("checkoutSchedule: ", checkoutSchedule);
    },[ checkoutSchedule ]);

    return (
        <div className="space-y-10">
            {/* Seleção de Data */}
            <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
            Data da Reserva
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">
              Selecione a data
                        </Label>
                        <Controller
                            control={ control }
                            name={ name }
                            render={ ({ field }) => (
                                <DatePicker
                                    value={ field.value! }
                                    onChange={ (e) => {
                                        field.onChange(e);
                                        if(e) {
                                            setValue("date", e);
                                        }
                                    } }
                                    placeholder="Selecione a data da reserva"
                                    clearable
                                />
                            ) }
                        />
                    </div>

                    {isDateInPast && (
                        <div className="flex items-center gap-2 p-3 text-destructive bg-destructive/5 rounded-lg border border-destructive/20">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium">A data precisa ser no futuro</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Seleção de Horário */}
            <TimePicker
                checkoutSchedule={ checkoutSchedule }
                selectedDate={ watchDate && !isDateInPast ? watchDate : undefined }
            />
        </div>
    );
}
