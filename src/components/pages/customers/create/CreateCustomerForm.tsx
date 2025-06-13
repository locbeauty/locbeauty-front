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
    const role = "ROOT";
    const user = { regional: "Recife" };

    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            personType: "PF",
            regionalId: role === "ROOT" ? "" : user.regional,
            customerStatus: "ACTIVE"
        },
    });

    const {
        handleSubmit,
    } = createCustomerMethods;

    async function handleCreateCustomer(newCustomerData: CreateCustomerFormSchemaType) {
    // TODO: selecionar as informações antes de enviar pra
        console.log("newCustomerData: ", newCustomerData);
        // const response = fetch("http://localhost:3333/api/customers/create", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(newCustomerData)
        // });

        // console.log("RESPONSE: ", response);
        // toast.success("Cliente criado com sucesso!");

    };

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
