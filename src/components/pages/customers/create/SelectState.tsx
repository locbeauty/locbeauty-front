"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller, useFormContext } from "react-hook-form";
import { CreateCustomerFormSchemaType } from "./CreateCustomerValidation";

const ESTADOS_BRASILEIROS = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
];

interface SelectStateProps {
    disabled?: boolean;
  }

export function SelectState({ disabled = false }: SelectStateProps) {
    const { control } = useFormContext<CreateCustomerFormSchemaType>();

    return (
        <Controller
            name="UF"
            control={ control }
            render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                    <SelectTrigger className="w-full md:w-[200px] data-[placeholder]:text-placeholder" disabled={ disabled }>
                        <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                        { ESTADOS_BRASILEIROS.map((estado) => (
                            <SelectItem key={ estado.sigla } value={ estado.sigla }>
                                { estado.nome } ({ estado.sigla })
                            </SelectItem>
                        )) }
                    </SelectContent>
                </Select>
            ) }
        />
    );
}
