"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { createCustomerFormSchema, CreateCustomerFormSchemaType } from "./CreateCustomerValidation";
import { useEffect } from "react";

export function CreateCustomerForm() {
    const role = "ROOT";
    const user = { regional: "Recife" };

    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            personType: "PF",
            regional: role === "ROOT" ? "" : user.regional,
        },
    });

    const { handleSubmit, formState: { errors } } = createCustomerMethods;

    useEffect(() => {
        console.log("errors: ", errors);
    }, [ errors ]);

    function handleCreateCustomer(newCustomerData: CreateCustomerFormSchemaType) {
        // TODO: selecionar as informações antes de enviar pra
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
