/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivateCustomerAddress,
  DeactivateCustomerAddress,
} from "@/services/addresses.service";

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

  const queryClient = useQueryClient();

  const { mutateAsync: deactivateAddress, isPending: isDeactivating } =
    useMutation({
      mutationFn: ({ addressId }: { addressId: string }) =>
        DeactivateCustomerAddress({ addressId }),

      onMutate: async ({ addressId }) => {
        await queryClient.cancelQueries({
          queryKey: [ "get-all-customer-addresses", customerId ],
        });

        const previousAddresses = queryClient.getQueryData([
          "get-all-customer-addresses",
          customerId,
        ]);

        queryClient.setQueryData(
          [ "get-all-customer-addresses", customerId ],
          (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map((addr: Address) =>
                addr.addressId === addressId
                  ? { ...addr, isActive: false }
                  : addr,
              ),
            };
          },
        );

        return { previousAddresses };
      },

      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [ "get-all-customer-addresses", customerId ],
        });
      },

      onSuccess: () => {
        toast.success("Endereço desativado com sucesso!", {
          style: { fontSize: "1rem" },
        });
      },

      onError: (error: any, _, context) => {
        if (context?.previousAddresses) {
          queryClient.setQueryData(
            [ "get-all-customer-addresses", customerId ],
            context.previousAddresses,
          );
        }
        toast.warning(error.message, { style: { fontSize: "1rem" } });
      },
    });

  const { mutateAsync: activateAddress, isPending: isActivating } = useMutation(
    {
      mutationFn: ({ addressId }: { addressId: string }) =>
        ActivateCustomerAddress({ addressId }),

      onMutate: async ({ addressId }) => {
        await queryClient.cancelQueries({
          queryKey: [ "get-all-customer-addresses", customerId ],
        });

        const previousAddresses = queryClient.getQueryData([
          "get-all-customer-addresses",
          customerId,
        ]);

        queryClient.setQueryData(
          [ "get-all-customer-addresses", customerId ],
          (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map((addr: Address) =>
                addr.addressId === addressId
                  ? { ...addr, isActive: true }
                  : addr,
              ),
            };
          },
        );

        return { previousAddresses };
      },

      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [ "get-all-customer-addresses", customerId ],
        });
      },

      onSuccess: () => {
        toast.success("Endereço ativado com sucesso!", {
          style: { fontSize: "1rem" },
        });
      },

      onError: (error: any, _, context) => {
        if (context?.previousAddresses) {
          queryClient.setQueryData(
            [ "get-all-customer-addresses", customerId ],
            context.previousAddresses,
          );
        }
        toast.warning(error.message, { style: { fontSize: "1rem" } });
      },
    },
  );

  async function handleToggleAddressStatus(
    addressId: string,
    isActive: boolean,
  ) {
    if (isActive) {
      await deactivateAddress({ addressId });
    } else {
      await activateAddress({ addressId });
    }
  }

  const isLoading = isDeactivating || isActivating;

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
                // Stable sort by street name, ignoring active status to prevent jumping
                return (a.street || "").localeCompare(b.street || "");
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
                      <div className="flex flex-col">
                        <h3 className="font-bold">{addr.zipCode}</h3>
                        <h4
                          className={ `font-semibold ${!addr.isActive ? "line-through" : ""}` }
                        >
                          {addr.street}, {addr.buildingNumber}
                        </h4>
                      </div>
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
                        disabled={ isLoading }
                        onClick={ () =>
                          handleToggleAddressStatus(
                            addr.addressId,
                            !!addr.isActive,
                          )
                        }
                        className={
                          !addr.isActive
                            ? "text-primary hover:text-primary hover:bg-primary/10"
                            : "text-destructive hover:text-destructive hover:bg-destructive/10"
                        }
                      >
                        {addr.isActive ? (
                          <X className="size-4" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        <span className="sr-only">
                          {addr.isActive
                            ? "Desativar endereço"
                            : "Ativar endereço"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {addr.isActive
                          ? "Desativar endereço"
                          : "Ativar endereço"}
                      </p>
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
