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
};

export function SelectFilial<T extends FieldValues>({
    control,
    name,
}: SelectFilialProps<T>) {
    const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

    useEffect(() => {
        async function handleGetAllFilials() {
            const response = await fetch("http://localhost:3333/api/filials", {
                credentials: "include",
                next: {
                    tags: [ "get-all-filials" ],
                },
            });
            const { data }: { data: Filial[] } = await response.json();
            console.log("DATA: ", data);
            setAllFilials(data);
        }
        handleGetAllFilials();
    }, []);
    return (
        <Controller
            name={ name }
            control={ control }
            render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                    <SelectTrigger className="w-full md:w-[200px] data-[placeholder]:text-placeholder">
                        <SelectValue placeholder="Selecione uma filial" />
                    </SelectTrigger>
                    <SelectContent>
                        {allFilials.map((filial) => {
                            return (
                                <SelectItem key={ filial.filialId } value={ filial.filialId }>
                                    {filial.description}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
