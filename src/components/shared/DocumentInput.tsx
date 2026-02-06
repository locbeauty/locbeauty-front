"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface DocumentInputProps {
  register?: UseFormRegisterReturn;
  disabled?: boolean;
  placeholder?: string;
  isCPF?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
}

export default function DocumentInput({
  register,
  disabled = false,
  isCPF = false,
  placeholder = "000.000.000-00 ou 00.000.000/0000-00",
  value,
  onChange,
  name,
  className,
}: DocumentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maskRef = useRef<any>(null);
  const isProgrammaticUpdate = useRef(false);

  // Extract register props to handle them manually
  const {
    ref: registerRef,
    onChange: registerOnChange,
    name: registerName,
    ...registerRest
  } = register || {};

  useEffect(() => {
    if (!inputRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maskOptions: any = {
      mask: isCPF
        ? "000.000.000-00"
        : [ { mask: "000.000.000-00" }, { mask: "00.000.000/0000-00" } ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch: (appended: string, dynamicMasked: any) => {
        const number = (dynamicMasked.value + appended).replace(/\D/g, "");
        if (number.length <= 11) return dynamicMasked.compiledMasks[0];
        return dynamicMasked.compiledMasks[1];
      },
    };

    maskRef.current = IMask(inputRef.current, maskOptions);

    maskRef.current.on("accept", () => {
      if (isProgrammaticUpdate.current) return;

      const event = {
        target: {
          name: name || registerName,
          value: maskRef.current.value,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      // Call the external onChange if provided
      if (onChange) {
        onChange(event);
      }

      // Call react-hook-form's onChange if provided
      if (registerOnChange) {
        registerOnChange(event);
      }
    });

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [ isCPF, name, onChange, registerOnChange, registerName ]);

  useEffect(() => {
    if (
      maskRef.current &&
      value !== undefined &&
      maskRef.current.value !== value
    ) {
      isProgrammaticUpdate.current = true;
      maskRef.current.value = value;
      isProgrammaticUpdate.current = false;
    }
  }, [ value ]);

  return (
    <Input
      { ...registerRest }
      ref={ (el) => {
        if (typeof registerRef === "function") registerRef(el);
        inputRef.current = el;
      } }
      disabled={ disabled }
      className={ className || "placeholder:text-placeholder" }
      placeholder={ placeholder }
      name={ name || registerName }
    />
  );
}
