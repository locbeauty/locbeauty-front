"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn } from "react-hook-form";
import { DollarSign } from "lucide-react";

interface PriceInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (_value: string) => void
  error?: string
  register: UseFormRegisterReturn<any>
}

export default function PriceInput({
    value: initialValue = "",
    onChange,
    error,
    register,
}: PriceInputProps) {
    const [ displayValue, setDisplayValue ] = useState(initialValue);

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

        setDisplayValue(reais);

        // Call the onChange handler with the raw value (in the format XX,XX)
        if (onChange) {
            onChange(reais);
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-4">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                    { ...register }
                    id="price-input"
                    type="text"
                    inputMode="numeric"
                    value={ displayValue }
                    onChange={ handleChange }
                    placeholder="0,00"
                    className="pl-9 md:w-fit w-full"
                    aria-invalid={ !!error }
                />
            </div>
        </div>
    );
}