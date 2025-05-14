"use client";

import { useEffect, useRef, useState } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { useFormContext, Controller } from "react-hook-form";
import type { CreateCustomerFormSchemaType } from "../../lib/zod/CreateCustomerValidation";
import { handleCepChange } from "@/utils/addressHandlers";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function CEPInput({ ...props }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [ isLoadingCep, setIsLoadingCep ] = useState(false);

    const {
        control,
        setValue,
        trigger,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<CreateCustomerFormSchemaType>();

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
                    name="CEP"
                    control={ control }
                    render={ ({ field }) => (
                        <Input
                            { ...props }
                            id="cep"
                            value={ field.value || "" }
                            onChange={ (e) => {
                                field.onChange(e);
                                handleCepChange({
                                    e,
                                    setIsLoadingCep,
                                    setValue,
                                    trigger,
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
                {isLoadingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>
            {errors.CEP && (
                <p className="text-sm font-medium text-destructive">
                    {errors.CEP.message}
                </p>
            )}
        </div>
    );
}
