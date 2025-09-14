import { FormProvider, useForm } from "react-hook-form";
import { CustomerGeneralInformationForm } from "../create/CustomerGeneralInformationForm";
import { CustomerAddressForm } from "../create/CustomerAddressForm";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createCustomerFormSchema,
    CreateCustomerFormSchemaType,
} from "@/lib/zod/CreateCustomerValidation";
import { Customer } from "@/utils/@types/customer";
import { useEffect, useState } from "react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Address } from "@/utils/@types/address";
import { ListCustomerAddressesCard } from "./ListAddressCard";
import { Button } from "@/components/ui/button";
import { RegisterNewAddressDialog } from "./RegisterNewAddressDialog";

interface UpdateCustomerFormProps {
  selectedCustomer: Customer;
}

export function UpdateCustomerForm({
    selectedCustomer,
}: UpdateCustomerFormProps) {
    const updateCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            birthdate: selectedCustomer.birthdate
                ? new Date(selectedCustomer.birthdate)
                : null,
            cellphone: selectedCustomer.cellphone,
            documentNumber: selectedCustomer.documentNumber,
            companyName: selectedCustomer.companyName,
            fullname: selectedCustomer.fullname,
            email: selectedCustomer.email,
            instagram: selectedCustomer.instagram,
            // address: selectedCustomer.Addresses[0]
        },
    });

    const { handleSubmit } = updateCustomerMethods;
    const [ customerAddresses, setCustomerAddresses ] = useState<Address[] | null>(null);

    useEffect(() => {
        async function getCustomerAddresses() {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customer/addresses?customerId=${selectedCustomer.customerId}`, {
                credentials: "include",
            });
            const { data }: {data: Address[]} = await response.json();
            setCustomerAddresses(data);
        }
        if(selectedCustomer && selectedCustomer.customerId) {
            getCustomerAddresses();
        }
    }, [ selectedCustomer ]);

    function handleCreateCustomer(
        updatedCustomerData: CreateCustomerFormSchemaType
    ) {
    // TODO: selecionar as informações antes de enviar pra
        console.log("updatedCustomerData: ", updatedCustomerData);
        toast.success("Cliente editado com sucesso!");
    }
    return (
        <form
            id="update-customer-form"
            onSubmit={ handleSubmit(handleCreateCustomer) }
            className="flex flex-col gap-5 mt-5"
        >
            <FormProvider { ...updateCustomerMethods }>
                <CustomerGeneralInformationForm />
                <ListCustomerAddressesCard customerAddresses={ customerAddresses } />
            </FormProvider>
        </form>
    );
}
