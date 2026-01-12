"use client";

import { useEffect, useRef, useState } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { Controller, Control, UseFormSetValue, UseFormTrigger, UseFormSetError, UseFormClearErrors, FieldValues, Path } from "react-hook-form";
import { handleCepChange } from "@/utils/addressHandlers";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CEPInputProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    trigger: UseFormTrigger<T>;
    setError: UseFormSetError<T>;
    clearErrors: UseFormClearErrors<T>;
    zipCodeError?: string;
    isUpdateForm?: boolean
}

export default function CEPInput<T extends FieldValues>({ clearErrors, control, setError, setValue, trigger, zipCodeError, isUpdateForm = false, ...props }: CEPInputProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ isLoadingZipCode, setIsLoadingZipCode ] = useState(false);

  // const zipCode = isUpdateForm ? "zipCode" : "address.zipCode" as Path<T>;
  const zipCode: Path<T> = isUpdateForm ? "zipCode" as Path<T> : "address.zipCode" as Path<T>;

  useEffect(() => {
    if (!inputRef.current) return;

    const maskOptions = {
      mask: "00000-000",
    };

    const mask = IMask(inputRef.current, maskOptions);

    return () => {
      mask.destroy();
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="cep">CEP</Label>
      <div className="relative">
        <Controller
          name={ zipCode }
          control={ control }
          render={ ({ field }) => (
            <Input
              { ...props }
              id="zipCode"
              value={ field.value || "" }
              onChange={ (e) => {
                field.onChange(e);
                handleCepChange<T>({
                  e,
                  setIsLoadingZipCode,
                  setValue,
                  trigger,
                  isUpdateForm,
                  setError,
                  clearErrors,
                });
              } }
              ref={ (el) => {
                // Atribuir ao ref do React Hook Form
                field.ref(el);
                // Atribuir ao ref local para o IMask
                inputRef.current = el;
              } }
              className="placeholder:text-placeholder md:w-[110px] w-full"
              placeholder="00000-000"
            />
          ) }
        />
        {isLoadingZipCode && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {zipCodeError && (
        <p className="text-sm font-medium text-destructive">
          {zipCodeError}
        </p>
      )}
    </div>
  );
}
