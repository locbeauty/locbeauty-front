/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressTypeSchema } from "@/lib/zod/address";
import { AddCustomerAddressForm } from "./AddCustomerAddressForm";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { CreateCustomerAddress } from "@/services/addresses.service";
import { queryClient } from "@/app/(main)/layout";

interface RegisterNewAddressDialogProps {
  isRegisterNewAddressDialogOpen: boolean;
  setIsRegisterNewAddressDialogOpen: (isOpen: boolean) => void;
  customerId: string;
}

export function RegisterNewAddressDialog({
  isRegisterNewAddressDialogOpen,
  setIsRegisterNewAddressDialogOpen,
  customerId,
}: RegisterNewAddressDialogProps) {
  const createAddressMethods = useForm<AddressTypeSchema>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (isRegisterNewAddressDialogOpen) {
      createAddressMethods.reset();
    }
  }, [ isRegisterNewAddressDialogOpen, createAddressMethods ]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { customerId: string; body: unknown }) =>
      CreateCustomerAddress(data),
    onSuccess: (data) => {
      toast.success("Endereço criado com sucesso!", {
        style: { fontSize: "1rem" },
      });
      setIsRegisterNewAddressDialogOpen(false);

      // revalida os endereços
      queryClient.invalidateQueries({
        queryKey: [ "get-all-customer-addresses", customerId ],
      });
    },
    onError: (error: any) => {
      toast.warning(error.message ?? "Erro ao criar endereço", {
        style: { fontSize: "1rem" },
      });
    },
  });

  const handleSaveUpdatedCustomer = (values: AddressTypeSchema) => {
    mutate({ customerId, body: values });
  };

  return (
    <Dialog
      open={ isRegisterNewAddressDialogOpen }
      onOpenChange={ setIsRegisterNewAddressDialogOpen }
    >
      <DialogTrigger asChild className="flex">
        <Button variant="default" className="ml-auto mt-5" type="button">
          Registrar novo endereço
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
        aria-describedby={ undefined }
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <DialogTitle className="text-3xl font-bold">
          Cadastre um novo endereço para o cliente:
        </DialogTitle>
        <div className="space-y-6">
          <FormProvider { ...createAddressMethods }>
            <form
              onSubmit={ (e) => {
                e.stopPropagation();
                createAddressMethods.handleSubmit(
                  handleSaveUpdatedCustomer,
                  (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (firstError) {
                      toast.warning(firstError.message || "Erro de validação", {
                        style: { fontSize: "1rem" },
                      });
                    }
                  },
                )(e);
              } }
            >
              <AddCustomerAddressForm
                handleSaveUpdatedCustomer={ handleSaveUpdatedCustomer }
              />
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
