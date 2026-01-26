"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { Input } from "@/components/ui/input";
import { Path, UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";
import { Label } from "../ui/label";
import { DollarSign } from "lucide-react";

interface PriceInputProps<TFieldValues extends Record<string, any>> {
    label?: string
    placeholder?: string
    value?: string
    onChange?: (_value: string) => void
    error?: string
    register?: UseFormRegisterReturn<any>
    setValue?: UseFormSetValue<TFieldValues>;
    name?: Path<TFieldValues>;
    disabled?: boolean
    isUncontrolled?: boolean
    targetState?: string
    setTargetState?: (_value: string) => void
    withLabel?: boolean
}

export default function PriceInput<TFieldValues extends Record<string, any>>({
  onChange,
  disabled,
  error,
  register,
  setValue,
  name,
  value: displayValue,
  isUncontrolled,
  setTargetState,
  targetState,
  withLabel = true
}: PriceInputProps<TFieldValues>) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters
    const numericValue = e.target.value.replace(/\D/g, "");

    // Convert to number (in cents)
    const cents = Number.parseInt(numericValue || "0", 10);

    // Format as currency (R$ X,XX)
    const reais = (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (onChange) onChange(reais);
    if(setTargetState) {
      setTargetState(reais);
    }
    if (setValue) setValue(name!, reais as any);
  };
  if(isUncontrolled && setTargetState) {
    return (
      <div className="flex flex-col gap-2">
        {
          withLabel && (
            <Label htmlFor="price-input" className="gap-1 flex items-center">
              <DollarSign className="h-4 w-4" />
                Preço
            </Label>
          )
        }
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
          <Input
            disabled={ disabled }
            maxLength={ 2 }
            id="price-input"
            type="text"
            inputMode="numeric"
            value={ targetState }
            onChange={ handleChange }
            placeholder="0,00"
            className="pl-9 w-full"
            aria-invalid={ !!error }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {
        withLabel && (
          <Label htmlFor="price-input" className="gap-1 flex items-center mt-4">
            <DollarSign className="h-4 w-4" />
                Preço
          </Label>
        )
      }
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
        <Input
          { ...register }
          disabled={ disabled }
          maxLength={ 12 }
          id="price-input"
          type="text"
          inputMode="numeric"
          value={ displayValue }
          onChange={ handleChange }
          placeholder="0,00"
          className="pl-9 w-full"
          aria-invalid={ !!error }
        />
      </div>
    </div>
  );
}