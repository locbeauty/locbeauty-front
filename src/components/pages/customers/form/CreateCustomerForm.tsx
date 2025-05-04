"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { createCustomerFormSchema } from "./CreateCustomerValidation";

export type CreateCustomerFormSchemaType = z.infer<
  typeof createCustomerFormSchema
>

export function CreateCustomerForm() {
    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            personType: "PF",
            UF: "",
        },
    });

    const {
        handleSubmit,
    } = createCustomerMethods;

    function handleCreateCustomer(newCustomerData: CreateCustomerFormSchemaType) {
        console.log("newCustomerData: ", newCustomerData);
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
