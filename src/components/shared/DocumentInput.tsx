"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface DocumentInputProps {
  register?: UseFormRegisterReturn;
  disabled?: boolean
  placeholder?: string
}

export default function DocumentInput({
    register,
    disabled = false,
    placeholder = "000.000.000-00 ou 00.000.000/0000-00"
}: DocumentInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        const maskOptions = {
            mask: [ "000.000.000-00", "00.000.000/0000-00" ]
        };

        const mask = IMask(inputRef.current, maskOptions);

        return () => {
            mask.destroy();
        };
    }, []);

    return (
        <Input
            { ...register }
            ref={ (el) => {
                register?.ref(el); // RHF
                inputRef.current = el; // IMask
            } }
            disabled={ disabled }
            className="placeholder:text-placeholder"
            placeholder={ placeholder }

        />
    );
}
