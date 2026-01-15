"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2, Timer } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { useMemo } from "react";

interface EndTimePickerProps {
  selectedDate?: Date;
}

export default function EndTimePicker({ selectedDate }: EndTimePickerProps) {
  const { setValue, watch } = useFormContext<CreateCheckoutFormSchemaType>();

  const watchEndHourInMinutes = watch("endHourInMinutes");
  const watchTotalDurationInMinutes = watch("totalDurationInMinutes");

  // Generate 24h time options (every 15 mins)
  const timeOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24 * 60; i += 30) {
      opts.push({
        value: i,
        label: minutesToHHMM(i),
      });
    }
    return opts;
  }, []);

  if (!selectedDate) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Horário Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
            <Clock className="h-5 w-5 mr-2 shrink-0" />
            <span className="text-sm">Selecione uma data final primeiro</span>
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
          Horário Final
          {watchEndHourInMinutes !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              <Timer className="h-3 w-3 mr-1" />
              {minutesToHHMM(watchEndHourInMinutes)} (
              {Math.floor(watchTotalDurationInMinutes / 60)}h{" "}
              {watchTotalDurationInMinutes % 60}min)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <Label className="text-sm font-medium">
            Selecione o horário final
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {timeOptions.map((option) => (
              <Button
                type="button"
                key={ option.value }
                variant={
                  watchEndHourInMinutes === option.value ? "default" : "outline"
                }
                size="sm"
                onClick={ () => setValue("endHourInMinutes", option.value) }
                className={ `
                  relative text-xs h-9 transition-all duration-200
                  ${
              watchEndHourInMinutes === option.value
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:scale-105"
              }
                ` }
              >
                {option.label}
                {watchEndHourInMinutes === option.value && (
                  <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
