"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Timer, CheckCircle2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { GetDayCheckoutsResponse } from "./CreateBookingForm";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";

interface TimePickerProps {
  selectedDate?: Date
  checkoutSchedule: GetDayCheckoutsResponse[] | undefined
//   setMaximumGearAmountAvailable: Dispatch<SetStateAction<number>>
}

export default function TimePicker({ selectedDate, checkoutSchedule }: TimePickerProps) {
    const [ durationInMinutes, setDurationInMinutes ] = useState(0);
    const [ selectedHour, setSelectedHour ] = useState<GetDayCheckoutsResponse | undefined>(undefined);

    const calculateEndTime = (startTime: number, durationHoursInMinutes: number) => {
        const hours = Math.floor(startTime / 60);
        const minutes = startTime % 60;

        const totalMinutes = hours * 60 + minutes + durationHoursInMinutes;
        return minutesToHHMM(totalMinutes);
    };

    const { setValue, watch, getValues } = useFormContext<CreateCheckoutFormSchemaType>();

    const watchStartHourInMinutes = watch("startHourInMinutes");
    const watchGears = watch("gears");
    const watchTotalDuration = watch("totalDurationInMinutes");
    const startHour = watch("startHourInMinutes");

    useEffect(() => {
        const handleShowHourDurations = () => {
            if(startHour) {
                const selectedTimeDurations = checkoutSchedule?.filter(hour => hour.hourInMinutes === startHour)[0];
                setSelectedHour(selectedTimeDurations);
            } else {
                setSelectedHour(undefined);
            }
        };
        handleShowHourDurations();
    }, [ checkoutSchedule, getValues, startHour ]);

    const handleDurationButtonClick = (durationValue: number, maxGearAmount: number) => {
        setValue("totalDurationInMinutes", durationValue);
        // setMaximumGearAmountAvailable(maxGearAmount);
        setDurationInMinutes(durationValue);
    };

    if (!selectedDate || watchGears?.length === 0) {
        return (
            <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
            Horário da Reserva
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        <Calendar className="h-5 w-5 mr-2 shrink-0" />
                        <span className="text-sm">Selecione primeiro um equipamento e uma data para ver os horários disponíveis</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
          Horário da Reserva
                    {watchStartHourInMinutes && (
                        <Badge variant="secondary" className="ml-auto">
                            <Timer className="h-3 w-3 mr-1" />
                            {minutesToHHMM(watchStartHourInMinutes)} - {calculateEndTime(watchStartHourInMinutes, durationInMinutes)} ({durationInMinutes/60}h)
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Seleção de Horário por Período */}
                <div className="space-y-6">
                    <Label className="text-sm font-medium">Horário de início</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {
                            checkoutSchedule?.map((hour) => {
                                const hasSomeAvailableGapTime = hour.availability.some(item => item.available);
                                return (
                                    <Button
                                        type="button"
                                        key={ hour.hourInMinutes }
                                        variant={ watchStartHourInMinutes === hour.hourInMinutes ? "default" : "outline" }
                                        size="sm"
                                        disabled={ !hasSomeAvailableGapTime }
                                        onClick={ () => setValue("startHourInMinutes", hour.hourInMinutes) }
                                        className={ `
                                                    relative text-xs h-9 transition-all duration-200
                                                    ${watchStartHourInMinutes === hour.hourInMinutes ? "ring-2 ring-primary ring-offset-2" : ""}
                                                    ${!hasSomeAvailableGapTime ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                                                ` }
                                    >
                                        {hour.formattedTime}
                                        {watchStartHourInMinutes === hour.hourInMinutes && (
                                            <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                                        )}
                                    </Button>
                                );
                            })
                        }
                    </div>

                    {/* Botões de duração rápida */}
                    {
                        selectedHour && (
                            <>
                                <Separator />
                                <div className="space-y-4">

                                    <Label className="text-sm font-medium">Duração da reserva</Label>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedHour && selectedHour.availability.map((option) => {
                                            return (
                                                <Button
                                                    type="button"
                                                    key={ option.durationInMinutes }
                                                    disabled={ !option.available }
                                                    variant={ watchTotalDuration === option.durationInMinutes ? "default" : "outline" }
                                                    size="sm"
                                                    onClick={ () => handleDurationButtonClick(option.durationInMinutes, option.maxGearAmount) }
                                                    className="text-xs"
                                                >
                                                    {option.durationInMinutes / 60} hora{option.durationInMinutes / 60 > 1 ? "s" : ""}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )
                    }

                </div>
            </CardContent>
        </Card>
    );
}
