"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useMounted } from "@/hooks/useMounted";
import { useEffect, useState } from "react";
import { Gear } from "@/utils/@types/gears";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { useAuth } from "@/contexts/auth-provider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";

export function SelectTrainingGear() {
    const [ originalGears, setOriginalGears ] = useState<Gear[]>([]);
    const { user } = useAuth();
    const isMounted = useMounted();
    const { control } = useFormContext<CreateTrainingDataType>();

    useEffect(() => {
        async function getAllGears() {
            const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/gears`);
            if (user && user?.role !== "Gerente") {
                url.searchParams.append("filialId", user?.sourceFilial.filialId);
            }
            const response = await fetchWithToken(url, {
                credentials: "include",
            });
            const { data } = await response.json();
            setOriginalGears(data);
        }
        getAllGears();
    }, [ user ]);

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex flex-col space-y-1">
            <Controller
                control={ control }
                name="gearId"
                render={ ({ field }) => (
                    <Select value={ field.value } onValueChange={ field.onChange }>
                        <SelectTrigger>
                            <SelectValue placeholder="Equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                            {originalGears.map((item) => (
                                <SelectItem key={ item.gearId } value={ item.gearId }>
                                    {item.gearName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) }
            />
        </div>
    );
}
