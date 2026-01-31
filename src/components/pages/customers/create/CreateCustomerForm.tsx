"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import {
  createCustomerFormSchema,
  CreateCustomerFormSchemaType,
} from "@/lib/zod/CreateCustomerValidation";
import { toast } from "sonner";
import { CreateCustomer } from "@/services/customers.service";
import { queryClient } from "@/app/(main)/layout";

export function CreateCustomerForm() {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilials = getAccessibleFilialsForCreate(
    SYSTEM_MODULES.CUSTOMERS,
  );

  const accessibleFilialsIds =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? undefined
      : accessibleFilials.map((f) => f.filialId);

  const defaultFilialId =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? user?.sourceFilialId
      : accessibleFilialsIds?.includes(user?.sourceFilialId || "")
        ? user?.sourceFilialId
        : accessibleFilialsIds?.[0];

  const createCustomerMethods = useForm<CreateCustomerFormSchemaType>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: {
      companyName: null,
      birthdate: null,
      instagram: null,
      email: null,
      filialId: defaultFilialId,
      address: {
        addressComplement: null,
      },
    },
  });

  const { handleSubmit, reset, setError } = createCustomerMethods;

  async function handleCreateCustomer(
    newCustomerData: CreateCustomerFormSchemaType,
  ) {
    const response = await CreateCustomer(newCustomerData);

    if (response.statusCode !== 201) {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      if (response.statusCode === 409) {
        setError("documentNumber", { message: "Documento já cadastrado." });
      }
    } else {
      queryClient.invalidateQueries({ queryKey: [ "get-birthdays" ] });
      // Invalidate other relevant queries if needed, e.g., customer list
      queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });

      toast.success(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      reset();
    }
  }

  return (
    <form
      id="create-customer-form"
      onSubmit={ handleSubmit(handleCreateCustomer) }
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <FormProvider { ...createCustomerMethods }>
        <div className="space-y-6">
          <CustomerGeneralInformationForm
            accessibleFilialsIds={ accessibleFilialsIds }
            defaultFilialId={ defaultFilialId }
          />
        </div>
        <div className="space-y-6">
          <CustomerAddressForm />
        </div>
      </FormProvider>
    </form>
  );
}
