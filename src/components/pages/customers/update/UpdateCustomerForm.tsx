import { FormProvider, useForm } from "react-hook-form";
import { CustomerGeneralInformationForm } from "../create/CustomerGeneralInformationForm";
import { CustomerAddressForm } from "../create/CustomerAddressForm";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerFormSchema, CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { Customer } from "@/utils/mocks/customers";

interface UpdateCustomerFormProps {
    selectedCustomer: Customer
}

export function UpdateCustomerForm({ selectedCustomer }: UpdateCustomerFormProps) {

    const updateCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        //TODO: corrigir para null, ao inves de undefined
        defaultValues: {
            personType: selectedCustomer.personType,
            regionalId: selectedCustomer.regionalId,
            addressComplement: selectedCustomer.addressComplement,
            birthdate: new Date(selectedCustomer.birthdate),
            cellphone: selectedCustomer.cellphone,
            CEP: selectedCustomer.CEP,
            city: selectedCustomer.city,
            CNPJ: selectedCustomer.CNPJ || undefined,
            companyName: selectedCustomer.companyName || undefined,
            CPF: selectedCustomer.CPF || undefined,
            fullname: selectedCustomer.fullname || undefined,
            email: selectedCustomer.email,
            houseNumber: selectedCustomer.houseNumber,
            instagram: selectedCustomer.instagram || undefined,
            neighborhood: selectedCustomer.neighborhood,
            personAccountableName: selectedCustomer.personAccountableName || undefined,
            state: selectedCustomer.UF,
            street: selectedCustomer.street,

        },
    });

    const {
        handleSubmit,
    } = updateCustomerMethods;

    function handleCreateCustomer(updatedCustomerData: CreateCustomerFormSchemaType) {
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