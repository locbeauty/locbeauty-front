"use client";

import { Controller, useFormContext } from "react-hook-form";

import { useMounted } from "@/hooks/useMounted";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Address } from "@/utils/@types/address";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";

interface SelectAddressProps {
  setAddressString: Dispatch<SetStateAction<string>>;
  onAddressSelect?: (address: Address) => void;
  disabled?: boolean;
}

export function SelectAddress({
  disabled = false,
  setAddressString,
  onAddressSelect,
}: SelectAddressProps) {
  const isMounted = useMounted();
  const { control, watch } = useFormContext<CreateCheckoutFormSchemaType>();

  const [ customerAddresses, setCustomerAddresses ] = useState<Address[] | null>(
    null,
  );

  const watchCustomer = watch("customer");

  useEffect(() => {
    async function getCustomerAddresses() {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/customer/addresses?customerId=${watchCustomer.customerId}`,
        {
          credentials: "include",
        },
      );
      const { data }: { data: Address[] } = await response.json();
      setCustomerAddresses(data);
    }
    if (watchCustomer && watchCustomer.customerId) {
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
          <Select
            disabled={ !watchCustomer || disabled }
            value={ field.value }
            onValueChange={ (value) => {
              field.onChange(value);
              const selectedAddress = customerAddresses?.find(
                (addr) => addr.addressId === value,
              );
              if (selectedAddress) {
                const addressString = `${selectedAddress.street}, ${selectedAddress.neighborhood}, ${selectedAddress.buildingNumber} - ${selectedAddress.city}/${selectedAddress.state}${selectedAddress.addressComplement ? `, ${selectedAddress.addressComplement}` : ""}`;
                setAddressString(addressString);
                onAddressSelect?.(selectedAddress);
              }
            } }
          >
            <SelectTrigger className="w-full data-[placeholder]:text-placeholder">
              <SelectValue
                placeholder="Selecione o endereço"
                className="text-placeholder"
              />
            </SelectTrigger>
            <SelectContent>
              {customerAddresses &&
                customerAddresses.map((addr) => {
                  if (!addr.isActive) return null;
                  return (
                    <SelectItem key={ addr.addressId } value={ addr.addressId }>
                      {addr.street}, {addr.neighborhood},{" "}
                      {addr.addressComplement} - {addr.city}/{addr.state}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        );
      } }
    />
  );
}
