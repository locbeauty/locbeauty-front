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
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/customers/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(newCustomerData)
        });
        const data = await response.json();

        if(!response.ok) {
            toast.warning(data.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            if(response.status === 409) {
                setError("documentNumber", { message: "Documento já cadastrado." });
            }
        } else {
            toast.success("Cliente criado com sucesso!", { style: { fontSize: "1rem" } });
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
