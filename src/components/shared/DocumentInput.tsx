"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface DocumentInputProps {
  documentType: "CPF" | "CNPJ";
  register?: UseFormRegisterReturn;
}

export default function DocumentInput({
    documentType,
    register,
}: DocumentInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        const maskOptions = {
            mask: documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00",
        };

        const mask = IMask(inputRef.current, maskOptions);

        return () => {
            mask.destroy();
        };
    }, [ documentType ]);

    return (
        <Input
            { ...register }
            ref={ (el) => {
                register?.ref(el); // RHF
                inputRef.current = el; // IMask
            } }
            className="placeholder:text-placeholder"
            placeholder={
                documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"
            }
        />
    );
}
