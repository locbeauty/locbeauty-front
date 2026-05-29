import { Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Customer } from "@/utils/@types/customer";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateCustomerForm } from "./UpdateCustomerForm";
import {
  updateCustomerFormSchema,
  UpdateCustomerFormSchemaType,
} from "@/lib/zod/UpdateCustomerValidation";
import { toast } from "sonner";
import { UpdateCustomer } from "@/services/customers.service";
import { queryClient } from "@/app/(main)/layout";
import { Address } from "@/utils/@types/address";
import { ListCustomerAddressesCard } from "./ListAddressCard";
import { GetAllCustomerAddresses } from "@/services/addresses.service";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";

interface UpdateCustomerDialogProps {
  isUpdateCustomerDialogOpen: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
  handleToggleUpdateCustomerDialog: (
    _openStatus: boolean,
    _customer: Customer | null,
  ) => void;
}

export function UpdateCustomerDialog({
  isUpdateCustomerDialogOpen,
  selectedCustomer,
  handleToggleUpdateCustomerDialog,
}: UpdateCustomerDialogProps) {
  const updateCustomerMethods = useForm<UpdateCustomerFormSchemaType>({
    resolver: zodResolver(updateCustomerFormSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty, isLoading: isFormLoading, isSubmitting },
  } = updateCustomerMethods;

  const { data, isLoading: isAddressesLoading } = useQuery<
    ApiResponse<Address[]>,
    Error
  >({
    queryKey: [ "get-all-customer-addresses", selectedCustomer?.customerId ],
    queryFn: ({ queryKey }) => {
      const [ , customerId ] = queryKey as [string, string | undefined];
      if (!customerId) throw new Error("Nenhum cliente selecionado");
      return GetAllCustomerAddresses({ customerId });
    },
    enabled: !!selectedCustomer,
    staleTime: 1000 * 60, // 1 minuto de cache
  });

  const customerAddresses = data?.data ?? [];

  useEffect(() => {
    if (selectedCustomer) {
      reset({
        birthdate: selectedCustomer.birthdate
          ? new Date(selectedCustomer.birthdate)
          : null,
        cellphone: selectedCustomer.cellphone ?? "",
        cellphoneDescription: selectedCustomer.cellphoneDescription,
        secondaryCellphone: selectedCustomer.secondaryCellphone,
        secondaryCellphoneDescription:
          selectedCustomer.secondaryCellphoneDescription,
        cpf: selectedCustomer.cpf,
        cnpj: selectedCustomer.cnpj,
        companyName: selectedCustomer.companyName,
        customerStatus: selectedCustomer.customerStatus,
        fullname: selectedCustomer.fullname,
        email: selectedCustomer.email,
        emailDescription: selectedCustomer.emailDescription,
        secondaryEmail: selectedCustomer.secondaryEmail,
        secondaryEmailDescription: selectedCustomer.secondaryEmailDescription,
        instagram: selectedCustomer.instagram,
        filialIds: (selectedCustomer.Filials ?? [])
          .map((f) => f.filialId)
          .filter((id) => id !== selectedCustomer.sourceFilialId),
      });
    }
  }, [ selectedCustomer, reset ]);

  const handleSaveUpdatedCustomer = async (
    customerData: UpdateCustomerFormSchemaType,
  ) => {
    if (selectedCustomer) {
      const formattedData = {
        ...customerData,
        cpf: customerData.cpf === "" ? null : customerData.cpf,
        cnpj: customerData.cnpj === "" ? null : customerData.cnpj,
      };

      const response = await UpdateCustomer({
        body: formattedData,
        queryParams: {
          customerId: selectedCustomer.customerId,
        },
      });

      if (response.statusCode !== 201) {
        if (
          response.message &&
          (response.message.toLowerCase().includes("cpf") ||
            response.message.toLowerCase().includes("cnpj")) &&
          response.message.toLowerCase().includes("cadastrado")
        ) {
          const fieldName = response.message.toLowerCase().includes("cpf")
            ? "cpf"
            : "cnpj";

          updateCustomerMethods.setError(fieldName, {
            type: "manual",
            message: response.message,
          });

          const element = document.querySelector(
            `input[name="${fieldName}"]`,
          ) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
          }
        }

        toast.warning(response.message, { style: { fontSize: "1rem" } });
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });

        toast.success(response.message, { style: { fontSize: "1rem" } });
        handleToggleUpdateCustomerDialog(false, null);
        reset();
      }
    }
  };

  return (
    <Dialog
      open={ isUpdateCustomerDialogOpen }
      onOpenChange={ (status) =>
        handleToggleUpdateCustomerDialog(status, selectedCustomer)
      }
    >
      <DialogContent
        className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
        aria-describedby={ undefined }
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <DialogTitle className="text-3xl font-bold">
          Edite o cliente:
        </DialogTitle>
        <div className="space-y-6">
          <form
            id="update-customer-form"
            onSubmit={ handleSubmit(handleSaveUpdatedCustomer) }
            className="flex flex-col gap-5 mt-5"
          >
            <FormProvider { ...updateCustomerMethods }>
              <UpdateCustomerForm selectedCustomer={ selectedCustomer } />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={ () =>
                    handleToggleUpdateCustomerDialog(false, selectedCustomer)
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={ !isDirty || isSubmitting || isFormLoading }
                  onClick={ handleSubmit(handleSaveUpdatedCustomer) }
                >
                  {isSubmitting || isFormLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </FormProvider>
          </form>
          {selectedCustomer && (
            <ListCustomerAddressesCard
              customerId={ selectedCustomer.customerId }
              customerAddresses={ customerAddresses }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
