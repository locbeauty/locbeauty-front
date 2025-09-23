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
import { AddCustomerAddressForm } from "./AddCustomerAddressForm";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { toast } from "sonner";

interface RegisterNewAddressDialogProps {
    isRegisterNewAddressDialogOpen: boolean,
    setIsRegisterNewAddressDialogOpen: (isOpen: boolean) => void
    customerId: string,
}

export function RegisterNewAddressDialog({ isRegisterNewAddressDialogOpen, setIsRegisterNewAddressDialogOpen, customerId }: RegisterNewAddressDialogProps) {

    const createAddressMethods = useForm<AddressTypeSchema>({
        resolver: zodResolver(addressSchema)
    });

    const handleSaveUpdatedCustomer = async (newAddressData: AddressTypeSchema) => {
        const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/address/create?customerId=${customerId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(newAddressData)
        });
        const data = await response.json();

        if(!response.ok) {
            toast.warning(data.message, { style: { fontSize: "1rem" } });
        } else {
            toast.success("Endereço criado com sucesso!", { style: { fontSize: "1rem" } });
            setIsRegisterNewAddressDialogOpen(false);
        }
    };

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
                        <AddCustomerAddressForm handleSaveUpdatedCustomer={ handleSaveUpdatedCustomer } />
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
}
