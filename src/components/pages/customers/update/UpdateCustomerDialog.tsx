import { Save } from "lucide-react";
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
import {
    CreateCustomerFormSchemaType,
    createCustomerFormSchema
} from "@/lib/zod/CreateCustomerValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateCustomerForm } from "./UpdateCustomerForm";
import { updateCustomerFormSchema, UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { toast } from "sonner";

interface UpdateCustomerDialogProps {
  isUpdateCustomerDialogOpen: boolean;
  selectedCustomer: Customer | null;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
  handleToggleUpdateCustomerDialog: (
    _openStatus: boolean,
    _customer: Customer | null
  ) => void;
}

export function UpdateCustomerDialog({
    isUpdateCustomerDialogOpen,
    selectedCustomer,
    handleToggleUpdateCustomerDialog,
}: UpdateCustomerDialogProps) {

    const updateCustomerMethods = useForm<UpdateCustomerFormSchemaType>({
        resolver: zodResolver(updateCustomerFormSchema)
    });

    const { handleSubmit, reset, formState: { errors, isDirty } } = updateCustomerMethods;

    useEffect(() => {
        if (selectedCustomer) {
            reset({
                birthdate: selectedCustomer.birthdate
                    ? new Date(selectedCustomer.birthdate)
                    : null,
                cellphone: selectedCustomer.cellphone,
                documentNumber: selectedCustomer.documentNumber,
                companyName: selectedCustomer.companyName,
                fullname: selectedCustomer.fullname,
                email: selectedCustomer.email,
                instagram: selectedCustomer.instagram,
            });
        }
    }, [ selectedCustomer, reset ]);

    const handleSaveUpdatedCustomer = async (customerData: UpdateCustomerFormSchemaType) => {
        if(selectedCustomer) {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customers/update?customerId=${selectedCustomer.customerId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(customerData)
            });
            const data = await response.json();

            if(!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
            } else {
                toast.success("Cliente atualizado com sucesso!", { style: { fontSize: "1rem" } });
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
                                <Button disabled={ !isDirty }>
                                    <Save className="mr-2 h-4 w-4" />
                            Salvar alterações
                                </Button>
                            </DialogFooter>
                        </FormProvider>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
