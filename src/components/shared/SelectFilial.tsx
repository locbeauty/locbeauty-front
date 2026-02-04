"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Filial } from "@/utils/@types/filials";
import { fetchWithToken } from "@/utils/fetchWithToken";

type SelectFilialProps<T extends FieldValues> = {
  control?: Control<T>;
  name?: FieldPath<T>;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultFilial?: string;
  accessibleFilials?: string[];
  placeholder?: string;
  className?: string;
};

export function SelectFilial<T extends FieldValues = FieldValues>({
  control,
  name,
  value: externalValue,
  onValueChange: externalOnValueChange,
  defaultFilial,
  accessibleFilials,
  placeholder,
  className,
}: SelectFilialProps<T>) {
  const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

  useEffect(() => {
    async function handleGetAllFilials() {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/filials`,
        {
          credentials: "include",
          next: {
            tags: [ "get-all-filials" ],
          },
        },
      );
      const { data }: { data: Filial[] } = await response.json();
      setAllFilials(data);
    }
    handleGetAllFilials();
  }, []);

  const filteredFilials = (allFilials || []).filter(
    (filial) =>
      !accessibleFilials || accessibleFilials.includes(filial.filialId),
  );

  const renderSelect = (
    value: string,
    onValueChange: (val: string) => void,
  ) => (
    <Select
      defaultValue={ defaultFilial }
      onValueChange={ onValueChange }
      value={ value ?? "" }
    >
      <SelectTrigger
        className={
          className || "w-full md:w-[90%] data-[placeholder]:text-placeholder"
        }
      >
        <SelectValue placeholder={ placeholder || "Selecione uma filial" } />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Todas</SelectItem>
        {filteredFilials.map((filial) => (
          <SelectItem key={ filial.filialId } value={ filial.filialId }>
            {filial.filialName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (control && name) {
    return (
      <Controller
        name={ name }
        control={ control }
        render={ ({ field }) =>
          renderSelect(field.value as string, field.onChange)
        }
      />
    );
  }

  return renderSelect(externalValue || "", externalOnValueChange || (() => {}));
}
