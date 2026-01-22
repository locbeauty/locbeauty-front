/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Address } from "@/utils/@types/address";
import { RegisterNewAddressDialog } from "./RegisterNewAddressDialog";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { useMutation } from "@tanstack/react-query";
import { DeactivateCustomerAddress } from "@/services/addresses.service";

interface ListCustomerAddressesCardProps {
  customerAddresses: Address[] | null;
  customerId: string;
}
export function ListCustomerAddressesCard({
  customerAddresses,
  customerId,
}: ListCustomerAddressesCardProps) {
  const [ isRegisterNewAddressDialogOpen, setIsRegisterNewAddressDialogOpen ] =
    useState(false);

  const { mutateAsync: deactivateAddress, isPending } = useMutation({
    mutationFn: ({ addressId }: { addressId: string }) =>
      DeactivateCustomerAddress({ addressId }),

    onSuccess: (_, variables) => {
      toast.success("Endereço desativado com sucesso!", {
        style: { fontSize: "1rem" },
      });

      // revalida os endereços do cliente específico
      queryClient.invalidateQueries({
        queryKey: [ "get-all-customer-addresses" ],
      });
    },

    onError: (error: any) => {
      toast.warning(error.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
    },
  });

  async function handleDeactivateAddress(addressId: string) {
    await deactivateAddress({ addressId });
  }

  return (
    <Card className="">
      <CardHeader>
        <CardDescription className="text-xl font-bold">
          Endereços cadastrados:
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customerAddresses
          ?.sort((a, b) => (a.street || "").localeCompare(b.street || ""))
          .map((addr) => {
            return (
              <div
                key={ addr.addressId }
                className="flex justify-between items-center"
              >
                <p>
                  {addr.street}, {addr.neighborhood}, {addr.buildingNumber},{" "}
                  {addr.addressComplement} - {addr.city}/{addr.state}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={ () =>
                          addr.isActive &&
                          handleDeactivateAddress(addr.addressId)
                        }
                        className={
                          !addr.isActive
                            ? "pointer-events-none opacity-50 hover:bg-transparent"
                            : ""
                        }
                      >
                        <X className="size-5" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {addr.isActive ? (
                      <p>Desativar endereço</p>
                    ) : (
                      <p>Endereço já desativado</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}

        <RegisterNewAddressDialog
          customerId={ customerId }
          isRegisterNewAddressDialogOpen={ isRegisterNewAddressDialogOpen }
          setIsRegisterNewAddressDialogOpen={ setIsRegisterNewAddressDialogOpen }
        />
      </CardContent>
    </Card>
  );
}
