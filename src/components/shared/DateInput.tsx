"use client";

import { useEffect, useRef } from "react";
import IMask from "imask";
import { Input } from "@/components/ui/input";
import { UseFormRegisterReturn } from "react-hook-form";

interface DateInputProps {
  register?: UseFormRegisterReturn;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
  placeholder?: string;
}

export default function DateInput({
  register,
  disabled = false,
  value,
  onChange,
  name,
  className,
  placeholder = "dd/mm/aaaa",
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maskRef = useRef<any>(null);

  const {
    ref: registerRef,
    onChange: registerOnChange,
    name: registerName,
    ...registerRest
  } = register || {};

  useEffect(() => {
    if (!inputRef.current) return;

    const maskOptions = {
      mask: Date,
      pattern: "d`/m`/Y",
      blocks: {
        d: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 31,
          maxLength: 2,
        },
        m: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
          maxLength: 2,
        },
        Y: {
          mask: IMask.MaskedRange,
          from: 1900,
          to: 2100,
          maxLength: 4,
        },
      },
      format: (date: Date) => {
        let day: string | number = date.getDate();
        let month: string | number = date.getMonth() + 1;
        const year = date.getFullYear();

        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;

        return [ day, month, year ].join("/");
      },
      parse: (str: string) => {
        const yearMonthDay = str.split("/");
        return new Date(
          parseInt(yearMonthDay[2], 10),
          parseInt(yearMonthDay[1], 10) - 1,
          parseInt(yearMonthDay[0], 10),
        );
      },
      autofix: true,
      overwrite: true,
    };

    maskRef.current = IMask(inputRef.current, maskOptions);

    maskRef.current.on("accept", () => {
      const event = {
        target: {
          name: name || registerName,
          value: maskRef.current.value,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      if (onChange) onChange(event);
      if (registerOnChange) registerOnChange(event);
    });

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [ name, onChange, registerOnChange, registerName ]);

  useEffect(() => {
    if (
      maskRef.current &&
      value !== undefined &&
      maskRef.current.value !== value
    ) {
      maskRef.current.value = value || "";
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
