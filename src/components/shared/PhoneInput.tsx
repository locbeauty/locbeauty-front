"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface PhoneInputProps {
  register?: UseFormRegisterReturn;
}

export default function PhoneInput({ register }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const maskOptions = {
      mask: [
        { mask: "(00) 0000-0000" }, // fixo
        { mask: "(00) 00000-0000" }, // celular
      ],
    };

    const mask = IMask(inputRef.current, maskOptions);
    // mask.on("accept", () => {
    //     if (inputRef.current) {
    //         inputRef.current.value = mask.unmaskedValue; // <- só dígitos
    //         inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    //     }
    // });
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
      autoComplete="nope"
      className="placeholder:text-placeholder"
      placeholder="(00) 00000-0000"
    />
  );
}
