"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface PhoneInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export default function PhoneInput<T extends FieldValues>({
  control,
  name,
}: PhoneInputProps<T>) {
  return (
    <Controller
      control={ control }
      name={ name }
      render={ ({
        field: { onChange, value, ref, onBlur, disabled, name: fieldName },
      }) => (
        <MaskedInput
          // Pass individual props instead of spread to avoid conflicts
          name={ fieldName }
          onBlur={ onBlur }
          disabled={ disabled }
          value={ (value as string) || "" }
          onChange={ onChange }
          inputRef={ ref }
        />
      ) }
    />
  );
}

// Omit 'onChange' from standard props to avoid signature conflict
interface MaskedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  inputRef: React.Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  value: string;
}

function MaskedInput({
  inputRef,
  onChange,
  value,
  ...props
}: MaskedInputProps) {
  const elementRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maskRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const maskOptions = {
      mask: [
        { mask: "(00) 0000-0000" }, // fixo
        { mask: "(00) 00000-0000" }, // celular
      ],
    };

    maskRef.current = IMask(elementRef.current, maskOptions);

    maskRef.current.on("accept", () => {
      onChange(maskRef.current?.value || "");
    });

    return () => {
      maskRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Sync value from RHF to IMask if it changes externally (e.g. reset)
  useEffect(() => {
    if (maskRef.current && value !== maskRef.current.value) {
      maskRef.current.value = value || "";
    }
  }, [ value ]);

  return (
    <Input
      { ...props }
      ref={ (el) => {
        // Handle both refs: internal for IMask and external from RHF
        elementRef.current = el;
        if (typeof inputRef === "function") {
          inputRef(el);
        } else if (inputRef) {
          (
            inputRef as React.MutableRefObject<HTMLInputElement | null>
          ).current = el;
        }
      } }
      autoComplete="nope"
      className="placeholder:text-placeholder"
      placeholder="(00) 00000-0000"
      defaultValue={ value } // Use defaultValue to let IMask control it
    />
  );
}
