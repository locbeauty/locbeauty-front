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

type SelectFilialProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  defaultFilial?: string
};

export function SelectFilial<T extends FieldValues>({
    control,
    name,
    defaultFilial
}: SelectFilialProps<T>) {
    const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

    useEffect(() => {
        async function handleGetAllFilials() {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/filials`, {
                credentials: "include",
                next: {
                    tags: [ "get-all-filials" ],
                },
            });
            const { data }: { data: Filial[] } = await response.json();
            setAllFilials(data);
        }
        handleGetAllFilials();
    }, []);
    return (
        <Controller
            name={ name }
            control={ control }
            render={ ({ field }) => (
                <Select defaultValue={ defaultFilial } onValueChange={ field.onChange } value={ field.value ?? "" }>
                    <SelectTrigger className="w-full md:w-[90%] data-[placeholder]:text-placeholder">
                        <SelectValue placeholder="Selecione uma filial" />
                    </SelectTrigger>
                    <SelectContent>
                        {allFilials.map((filial) => {
                            return (
                                <SelectItem key={ filial.filialId } value={ filial.filialId }>
                                    {filial.filialName}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
