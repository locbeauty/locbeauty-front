"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { Label } from "@/components/ui/label";
import {
    createCustomerFormSchema,
    CreateCustomerFormSchemaType,
} from "@/lib/zod/CreateCustomerValidation";
import { toast } from "sonner";
import { CreateCustomer } from "@/services/customers.service";

export function CreateCustomerForm() {
    const { user } = useAuth();
    const { getAccessibleFilialsForCreate } = useAccess();

    const accessibleFilials = getAccessibleFilialsForCreate(
        SYSTEM_MODULES.CUSTOMERS
    );
    const shouldShowFilialSelect =
    user?.role === USER_ROLES.GERENTE || accessibleFilials.length > 1;

    const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
        resolver: zodResolver(createCustomerFormSchema),
        defaultValues: {
            companyName: null,
            birthdate: null,
            instagram: null,
            email: null,
            filialId: user?.sourceFilial.filialId,
            address: {
                addressComplement: null,
            },
        },
    });

    const { handleSubmit, reset, setError } = createCustomerMethods;

    async function handleCreateCustomer(
        newCustomerData: CreateCustomerFormSchemaType
    ) {
        const response = await CreateCustomer(newCustomerData);

        if (response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            if (response.statusCode === 409) {
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
                {shouldShowFilialSelect && (
                    <div className="space-y-2">
                        <Label>Filial *</Label>
                        <Controller
                            control={ createCustomerMethods.control }
                            name="filialId"
                            render={ ({ field }) => (
                                <SelectFilial
                                    control={ createCustomerMethods.control }
                                    name="filialId"
                                    defaultFilial={ user?.sourceFilial.filialId }
                                />
                            ) }
                        />
                        {createCustomerMethods.formState.errors.filialId && (
                            <p className="text-sm text-destructive">
                                {createCustomerMethods.formState.errors.filialId.message}
                            </p>
                        )}
                    </div>
                )}
                <CustomerGeneralInformationForm />
                <CustomerAddressForm />
            </FormProvider>
        </form>
    );
}
