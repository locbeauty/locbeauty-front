"use client";

import { Controller, useFormContext } from "react-hook-form";

import { useMounted } from "@/hooks/useMounted";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Address } from "@/utils/@types/address";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";

interface SelectAddressProps {
    setAddressString: Dispatch<SetStateAction<string>>
    disabled?: boolean
}

export function SelectAddress({ disabled = false, setAddressString }: SelectAddressProps) {
  const isMounted = useMounted();
  const {
    control,
    watch
  } = useFormContext<CreateCheckoutFormSchemaType>();

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
          <Select disabled={ !watchCustomer || disabled }
            value={ field.value }
            onValueChange={ (value) => {
              field.onChange(value);
              const selectedAddress = customerAddresses?.find(addr => addr.addressId === value);
              if (selectedAddress) {
                const addressString = `${selectedAddress.Street.streetName}, ${selectedAddress.Neighborhood.neighborhoodName}, ${selectedAddress.buildingNumber} - ${selectedAddress.City.cityName}/${selectedAddress.State.UF}${selectedAddress.addressComplement ? `, ${selectedAddress.addressComplement}` : ""}`;
                setAddressString(addressString);
              }
            } }
          >
            <SelectTrigger className="w-full data-[placeholder]:text-placeholder">
              <SelectValue
                placeholder="Selecione a função do funcionário"
                className="text-placeholder"
              />
            </SelectTrigger>
            <SelectContent>
              { customerAddresses && customerAddresses.map((addr) => {
                if(!addr.isActive) return null;
                return (
                  <SelectItem key={ addr.addressId } value={ addr.addressId }>
                    { addr.Street.streetName }, { addr.Neighborhood.neighborhoodName }, {addr.addressComplement} - { addr.City.cityName }/{ addr.State.UF }
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
