"use client";

import { InputHTMLAttributes, useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface CEPInputProps extends InputHTMLAttributes<HTMLInputElement> {
  register?: UseFormRegisterReturn;
}

export default function CEPInput({
    register,
    ...props
}: CEPInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

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
        <Input
            { ...register }
            { ...props }
            ref={ (el) => {
                register?.ref(el); // RHF
                inputRef.current = el; // IMask
            } }
            className="placeholder:text-placeholder w-[110px]"
            placeholder="00000-000"
        />
    );
}
