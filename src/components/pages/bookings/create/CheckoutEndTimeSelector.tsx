"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import EndTimePicker from "./EndTimePicker";

interface CheckoutEndTimeSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export default function CheckoutEndTimeSelector<T extends FieldValues>({
  name,
  control,
}: CheckoutEndTimeSelectorProps<T>) {
  const { setValue, watch } = useFormContext<CreateCheckoutFormSchemaType>();

  const watchEndDate = watch("endDate");
  const watchStartDate = watch("date");

  const isDateInPast =
    watchEndDate && watchEndDate < new Date(new Date().setHours(0, 0, 0, 0));
  const isBeforeStartDate =
    watchEndDate && watchStartDate && watchEndDate < watchStartDate;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Seleção de Data Final */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Data Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="">
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Selecione a data final
              </Label>
              <Controller
                control={ control }
                name={ name }
                render={ ({ field }) => (
                  <DatePicker
                    value={ field.value! }
                    onChange={ (e) => {
                      field.onChange(e);
                      if (e) {
                        // Ensure we don't accidentally set time components if DatePicker returns them?
                        // DatePicker usually returns date at 00:00 local or 12:00.
                        // Just setting it is fine.
                      }
                    } }
                    placeholder="Selecione a data final da reserva"
                    clearable
                  />
                ) }
              />
            </div>

            {isDateInPast && (
              <div className="flex items-center gap-2 p-3 mt-2 text-destructive bg-destructive/5 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  A data final deve ser igual ou posterior a hoje.
                </span>
              </div>
            )}

            {isBeforeStartDate && (
              <div className="flex items-center gap-2 p-3 mt-2 text-destructive bg-destructive/5 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  A data final não pode ser anterior à data de início.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Horário Final */}
      <EndTimePicker selectedDate={ watchEndDate } />
    </div>
  );
}
