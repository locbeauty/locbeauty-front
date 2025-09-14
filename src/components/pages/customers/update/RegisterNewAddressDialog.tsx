import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { UpdateCustomerForm } from "./UpdateCustomerForm";
import { Customer } from "@/utils/@types/customer";
import { CustomerAddressForm } from "../create/CustomerAddressForm";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressTypeSchema } from "@/lib/zod/address";

interface RegisterNewAddressDialogProps {
    isRegisterNewAddressDialogOpen: boolean,
    setIsRegisterNewAddressDialogOpen: (isOpen: boolean) => void
}

export function RegisterNewAddressDialog({ isRegisterNewAddressDialogOpen, setIsRegisterNewAddressDialogOpen }: RegisterNewAddressDialogProps) {
    const handleSaveUpdatedCustomer = () => {
        console.log("UPDATED:");
    };

    const createAddressMethods = useForm<AddressTypeSchema>({
        resolver: zodResolver(addressSchema)
    });

    return (
        <Dialog open={ isRegisterNewAddressDialogOpen } onOpenChange={ setIsRegisterNewAddressDialogOpen }>
            <DialogTrigger asChild className="flex">
                <Button variant="default" className="ml-auto mt-5">
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
                        <CustomerAddressForm isUpdateCustomerForm={ true } />
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
}
