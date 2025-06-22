import { FormProvider, useForm } from "react-hook-form";
import { CustomerGeneralInformationForm } from "../create/CustomerGeneralInformationForm";
import { CustomerAddressForm } from "../create/CustomerAddressForm";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createCustomerFormSchema,
    CreateCustomerFormSchemaType,
} from "@/lib/zod/CreateCustomerValidation";
import { Customer } from "@/utils/@types/customers";

interface UpdateCustomerFormProps {
  selectedCustomer: Customer;
}

export function UpdateCustomerForm({
    selectedCustomer,
}: UpdateCustomerFormProps) {
    const updateCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            personType: selectedCustomer.personType,
            birthdate: new Date(selectedCustomer.birthdate),
            cellphone: selectedCustomer.cellphone,
            address: {
                zipCode: selectedCustomer.address.zipCode,
                stateName: selectedCustomer.address.state.stateName,
                cityName: selectedCustomer.address.city,
                neighborhoodName: selectedCustomer.address.neighborhood,
                streetName: selectedCustomer.address.street,
                buildingNumber: selectedCustomer.address.buildingNumber,
                addressComplement: selectedCustomer.address.addressComplement,
            },
            CNPJ: selectedCustomer.CNPJ,
            companyName: selectedCustomer.companyName,
            CPF: selectedCustomer.CPF,
            fullname: selectedCustomer.fullname,
            email: selectedCustomer.email,
            instagram: selectedCustomer.instagram,
            personAccountableName:
            selectedCustomer.personAccountableName,
        },
    });

    const { handleSubmit } = updateCustomerMethods;

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
                <CustomerAddressForm />
            </FormProvider>
        </form>
    );
}
