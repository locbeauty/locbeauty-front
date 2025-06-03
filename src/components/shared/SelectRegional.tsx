"use client";

import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { regionals } from "@/utils/mocks/regionals";

type SelectRegionalProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
};

export function SelectRegional<T extends FieldValues>({
    control,
    name,
}: SelectRegionalProps<T>) {
    return (
        <Controller
            name={ name }
            control={ control }
            render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                    <SelectTrigger className="w-full md:w-[200px] data-[placeholder]:text-placeholder">
                        <SelectValue placeholder="Selecione uma regional" />
                    </SelectTrigger>
                    <SelectContent>
                        {regionals.map((regional) => {
                            return (
                                <SelectItem key={ regional.regionalId } value={ regional.regionalId }>
                                    {regional.address.city}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
