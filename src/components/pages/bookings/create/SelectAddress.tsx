"use client";

import { Controller, useFormContext } from "react-hook-form";

import { useMounted } from "@/hooks/useMounted";
import { useEffect, useState } from "react";
import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { Address } from "@/utils/@types/address";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function SelectAddress({ disabled = false }: {disabled?: boolean}) {
    const isMounted = useMounted();
    const {
        control,
        watch
    } = useFormContext<CreateBookingFormSchemaType>();

    const [ customerAddresses, setCustomerAddresses ] = useState<Address[] | null>(null);

    const watchCustomer = watch("customer");

    useEffect(() => {
        async function getCustomerAddresses() {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customer/addresses?customerId=${watchCustomer.customerId}`, {
                credentials: "include",
            });
            const { data }: {data: Address[]} = await response.json();
            setCustomerAddresses(data);
        }
        if(watchCustomer && watchCustomer.customerId) {
            getCustomerAddresses();
        }
    }, [ watchCustomer ]);

    if (!isMounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <Controller
            name="addressId"
            control={ control }
            render={ ({ field }) => {
                return (
                    <Select disabled={ !watchCustomer || disabled } onValueChange={ field.onChange } value={ field.value }>
                        <SelectTrigger className="w-full data-[placeholder]:text-placeholder">
                            <SelectValue
                                placeholder="Selecione a função do funcionário"
                                className="text-placeholder"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            { customerAddresses && customerAddresses.map((addr) => {
                                return (
                                    <SelectItem key={ addr.addressId } value={ addr.addressId }>
                                        { addr.street.streetName }, { addr.neighborhood.neighborhoodName }, {addr.addressComplement} - { addr.city.cityName }/{ addr.state.UF }
                                    </SelectItem>
                                );

                            }) }
                        </SelectContent>
                    </Select>
                );
            }
            }
        />
    );
}
