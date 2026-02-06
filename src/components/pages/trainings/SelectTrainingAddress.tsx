"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useState } from "react";
import { Address } from "@/utils/@types/address";

interface SelectTrainingAddressProps {
  disabled?: boolean;
  addresses: Address[] | undefined;
  selectedAddress: string | undefined;
  onAddressChange: (addressId: string) => void;
}

export function SelectTrainingAddress({
  disabled = false,
  addresses,
  selectedAddress,
  onAddressChange,
}: SelectTrainingAddressProps) {
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isMounted) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="flex flex-col space-y-1 w-full">
      {isDesktop ? (
        <DesktopSelect
          disabled={ disabled }
          allAddresses={ addresses }
          selectedAddress={ selectedAddress }
          onAddressChange={ onAddressChange }
        />
      ) : (
        <MobileSelect
          allAddresses={ addresses }
          selectedAddress={ selectedAddress }
          onAddressChange={ onAddressChange }
        />
      )}
    </div>
  );
}

interface SelectProps {
  disabled?: boolean;
  allAddresses: Address[] | undefined;
  selectedAddress: string | undefined;
  onAddressChange: (addressId: string) => void;
}

function DesktopSelect({
  disabled,
  allAddresses,
  selectedAddress,
  onAddressChange,
}: SelectProps) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedAddress, allAddresses);

  return (
    <Popover open={ open } onOpenChange={ setOpen } modal={ true }>
      <PopoverTrigger asChild>
        <Button
          disabled={ disabled }
          variant="outline"
          className="w-full justify-start group cursor-pointer"
        >
          {selectedValue ? (
            <>{selectedValue}</>
          ) : (
            <span className="text-placeholder group-hover:text-white">
              Selecione o endereço
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <AddressesList
          allAddresses={ allAddresses }
          setOpen={ setOpen }
          onAddressChange={ onAddressChange }
        />
      </PopoverContent>
    </Popover>
  );
}

function MobileSelect({
  allAddresses,
  selectedAddress,
  onAddressChange,
}: Omit<SelectProps, "disabled">) {
  const [ open, setOpen ] = useState(false);

  const selectedValue = getDisplayValue(selectedAddress, allAddresses);

  return (
    <Drawer open={ open } onOpenChange={ setOpen }>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedValue ? (
            <>{selectedValue}</>
          ) : (
            <span className="text-placeholder">Selecione o endereço</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full" aria-describedby={ undefined }>
        <DrawerTitle>
          <div className="mt-4 border-t">
            <AddressesList
              allAddresses={ allAddresses }
              setOpen={ setOpen }
              onAddressChange={ onAddressChange }
            />
          </div>
        </DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

interface AddressesListProps {
  setOpen: (_open: boolean) => void;
  onAddressChange: (addressId: string) => void;
  allAddresses: Address[] | undefined;
}

function AddressesList({
  setOpen,
  onAddressChange,
  allAddresses,
}: AddressesListProps) {
  const handleSelect = (address: Address) => {
    onAddressChange(address.addressId);
    setOpen(false);
  };

  return (
    <Command>
      <CommandInput placeholder="Filtrar endereços..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup>
          {allAddresses?.map((address) => (
            <CommandItem
              key={ address.addressId }
              value={ formatAddress(address) }
              onSelect={ () => handleSelect(address) }
            >
              {formatAddress(address)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function getDisplayValue(
  addressId: string | undefined,
  allAddresses: Address[] | undefined,
): string | null {
  if (!addressId || !allAddresses) return null;

  const address = allAddresses.find((a) => a.addressId === addressId);
  if (address) {
    return formatAddress(address);
  }

  return null;
}

function formatAddress(address: Address): string {
  return `${address.street}, ${address.neighborhood}, ${address.addressComplement} - ${address.city}/${address.state}`;
}
