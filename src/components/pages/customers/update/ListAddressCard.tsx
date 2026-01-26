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
      <CardContent className="space-y-4">
        {customerAddresses && customerAddresses.length > 0 ? (
          <div className="space-y-3">
            {customerAddresses
              .sort((a, b) => {
                // First sort by active status (active first), then by street name
                if (a.isActive === b.isActive) {
                  return (a.street || "").localeCompare(b.street || "");
                }
                return a.isActive ? -1 : 1;
              })
              .map((addr) => (
                <div
                  key={ addr.addressId }
                  className={ `flex justify-between items-start p-3 rounded-lg border ${
                    !addr.isActive
                      ? "bg-muted/50 text-muted-foreground border-dashed"
                      : "bg-card border-border"
                  }` }
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={ `font-semibold ${!addr.isActive ? "line-through" : ""}` }
                      >
                        {addr.street}, {addr.buildingNumber}
                      </h4>
                      {!addr.isActive && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </div>

                    <p className="text-sm">
                      {addr.neighborhood}
                      {addr.addressComplement && ` - ${addr.addressComplement}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.city} / {addr.state}
                    </p>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={ () =>
                          addr.isActive &&
                          handleDeactivateAddress(addr.addressId)
                        }
                        className={
                          !addr.isActive
                            ? "pointer-events-none opacity-0"
                            : "tex t-destructive  hover:text-destructive hover:bg-destructive/10"
                        }
                        disabled={ !addr.isActive }
                      >
                        <X className="size-4" />
                        <span className="sr-only">Desativar endereço</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Desativar endereço</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
            <p className="text-sm">Nenhum endereço cadastrado.</p>
          </div>
        )}

        <div className=" flex justi fy-end pt-2">
          <RegisterNewAddressDialog
            customerId={ customerId }
            isRegisterNewAddressDialogOpen={ isRegisterNewAddressDialogOpen }
            setIsRegisterNewAddressDialogOpen={
              setIsRegisterNewAddressDialogOpen
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
