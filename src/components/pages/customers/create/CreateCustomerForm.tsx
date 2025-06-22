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

export function CreateCustomerForm() {

    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            companyName: null,
            birthdate: null,
            instagram: null,
            email: null
        }

    });

    const {
        handleSubmit,
    } = createCustomerMethods;

    async function handleCreateCustomer(newCustomerData: CreateCustomerFormSchemaType) {
        const response = await fetch("http://localhost:3333/api/customers/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCustomerData)
        });
        const data = await response.json();

        console.log("response:  ", response);

        if(!response.ok) {
            toast.warning(data.message);
        } else {
            toast.success("Cliente criado com sucesso!");
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
