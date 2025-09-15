import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Customer } from "@/utils/@types/customer";

import { FormProvider, useForm } from "react-hook-form";
import {
    CreateCustomerFormSchemaType,
    createCustomerFormSchema
} from "@/lib/zod/CreateCustomerValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateCustomerForm } from "./UpdateCustomerForm";

interface UpdateCustomerDialogProps {
  isUpdateCustomerDialogOpen: boolean;
  selectedCustomer: Customer;
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

    const updateCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            // birthdate: selectedCustomer.birthdate
            //     ? new Date(selectedCustomer.birthdate)
            //     : null,
            cellphone: selectedCustomer.cellphone,
            documentNumber: selectedCustomer.documentNumber,
            companyName: selectedCustomer.companyName,
            fullname: selectedCustomer.fullname,
            email: selectedCustomer.email,
            instagram: selectedCustomer.instagram,
            // address: selectedCustomer.Addresses[0]
        },
    });

    const { handleSubmit, } = updateCustomerMethods;

    const handleSaveUpdatedCustomer = (data: any) => {
        console.log("UPDATED4:", data);
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
                                <Button>
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
