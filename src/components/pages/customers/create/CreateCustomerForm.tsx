"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
    createCustomerFormSchema,
    CreateCustomerFormSchemaType,
} from "@/lib/zod/CreateCustomerValidation";
import { toast } from "sonner";
import { CreateCustomer } from "@/services/customers.service";

export function CreateCustomerForm() {

    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            companyName: null,
            birthdate: null,
            instagram: null,
            email: null,
            address: {
                addressComplement: null
            }
        }
    });

    const {
        handleSubmit,
        reset,
        setError
    } = createCustomerMethods;

    async function handleCreateCustomer(newCustomerData: CreateCustomerFormSchemaType) {
        const response = await CreateCustomer(newCustomerData);

        if(response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            if(response.statusCode === 409) {
                setError("documentNumber", { message: "Documento já cadastrado." });
            }
        } else {
            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            reset();
        }
    }

    return (
        <form
            id="create-customer-form"
            onSubmit={ handleSubmit(handleCreateCustomer) }
            className="flex flex-col gap-5"
        >
            <FormProvider { ...createCustomerMethods }>
                <CustomerGeneralInformationForm />
                <CustomerAddressForm />
            </FormProvider>
        </form>
    );
}
