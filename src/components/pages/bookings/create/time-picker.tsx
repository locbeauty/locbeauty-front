"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Timer, CheckCircle2 } from "lucide-react";
import { GetDayBookingsResponse } from "./CreateBookingForm";
import { useFormContext } from "react-hook-form";
import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";

interface TimePickerProps {
  selectedDate?: Date
  onTimeChange?: (_startTime: string, _endTime: string, _duration: number) => void
  bookingSchedule: GetDayBookingsResponse[] | undefined
  setMaximumGearAmountAvailable: Dispatch<SetStateAction<number>>
}

export default function TimePicker({ selectedDate, onTimeChange, bookingSchedule, setMaximumGearAmountAvailable }: TimePickerProps) {
    const [ selectedStartTime, setSelectedStartTime ] = useState<string>("");
    const [ duration, setDuration ] = useState(0);
    const [ selectedHour, setSelectedHour ] = useState<GetDayBookingsResponse | undefined>(undefined);

    const calculateEndTime = (startTime: string, durationHours: number) => {
        const [ hours, minutes ] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationHours * 60;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
    };

    const handleTimeSelect = (time: string, selectedInitialTimeData: GetDayBookingsResponse) => {
        setSelectedHour(selectedInitialTimeData);
        setSelectedStartTime(time);
        setDuration(0);
        const endTime = calculateEndTime(time, duration);
        onTimeChange?.(time, endTime, 0);
    };
    const { setValue } = useFormContext<CreateBookingFormSchemaType>();

    const handleDurationButtonClick = (durationValue: number, maxGearAmount: number) => {
        setValue("gearAmount", 0);
        setMaximumGearAmountAvailable(maxGearAmount);
        setDuration(durationValue);
        if (selectedStartTime) {
            const endTime = calculateEndTime(selectedStartTime, durationValue);
            onTimeChange?.(selectedStartTime, endTime, durationValue);
        }
    };

    if (!selectedDate) {
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
                        <span className="text-sm">Selecione uma data primeiro para ver os horários disponíveis</span>
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
                    {selectedStartTime && (
                        <Badge variant="secondary" className="ml-auto">
                            <Timer className="h-3 w-3 mr-1" />
                            {selectedStartTime} - {calculateEndTime(selectedStartTime, duration)} ({duration}h)
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
                            bookingSchedule?.map((hour) => {
                                const hasSomeAvailableGapTime = hour.availability.some(item => item.available);
                                return (
                                    <Button
                                        type="button"
                                        key={ hour.hourInMinutes }
                                        variant={ selectedStartTime === hour.formattedTime ? "default" : "outline" }
                                        size="sm"
                                        disabled={ !hasSomeAvailableGapTime }
                                        onClick={ () => handleTimeSelect(hour.formattedTime, hour) }
                                        className={ `
                                                    relative text-xs h-9 transition-all duration-200
                                                    ${selectedStartTime === hour.formattedTime ? "ring-2 ring-primary ring-offset-2" : ""}
                                                    ${!hasSomeAvailableGapTime ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                                                ` }
                                    >
                                        {hour.formattedTime}
                                        {selectedStartTime === hour.formattedTime && (
                                            <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                                        )}
                                    </Button>
                                );
                            })
                        }
                    </div>

                    <Separator />

                    {/* Seleção de Duração */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Duração da reserva</Label>

                        {/* Botões de duração rápida */}
                        <div className="flex flex-wrap gap-2">
                            {selectedHour && selectedHour.availability.map((option) => {
                                return (
                                    <Button
                                        type="button"
                                        key={ option.durationInMinutes }
                                        disabled={ !option.available }
                                        variant={ (duration === option.durationInMinutes / 60 && duration > 0) ? "default" : "outline" }
                                        size="sm"
                                        onClick={ () => handleDurationButtonClick(option.durationInMinutes / 60, option.maxGearAmount) }
                                        className="text-xs"
                                    >
                                        {option.durationInMinutes / 60} horas
                                    </Button>
                                );})}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
