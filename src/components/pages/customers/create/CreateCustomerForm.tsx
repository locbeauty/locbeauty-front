"use client";

import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import {
  CreateCustomer,
  PromoteCustomerToTrainee,
} from "@/services/customers.service";
import { queryClient } from "@/app/(main)/layout";
import { PromoteToTraineeDialog } from "@/components/shared/PromoteToTraineeDialog";

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

  const [ promoteState, setPromoteState ] = useState<{
    open: boolean;
    customerId: string | null;
    birthdate: Date | null;
  }>({ open: false, customerId: null, birthdate: null });
  const [ isPromoting, setIsPromoting ] = useState(false);

  async function handleCreateCustomer(
    newCustomerData: CreateCustomerFormSchemaType,
  ) {
    const payload = {
      ...newCustomerData,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await CreateCustomer(payload as any);

    if (response.statusCode === 201) {
      queryClient.invalidateQueries({ queryKey: [ "get-birthdays" ] });
      // Invalidate other relevant queries if needed, e.g., customer list
      queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });

      toast.success(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      reset();
      return;
    }

    // "É Aluno?" marcado e CPF/CNPJ já é de um cliente: oferecer conversão
    const conflict = response.data as
      | { promotableToTrainee?: boolean; customerId?: string }
      | undefined;
    if (
      response.statusCode === 409 &&
      conflict?.promotableToTrainee &&
      conflict.customerId
    ) {
      setPromoteState({
        open: true,
        customerId: conflict.customerId,
        birthdate: newCustomerData.birthdate ?? null,
      });
      return;
    }

    toast.warning(response.message, { style: { fontSize: "1rem" } });
    window.scroll({ top: 0 });
    if (response.statusCode === 409) {
      if (newCustomerData.cpf) {
        setError("cpf", { message: "CPF já cadastrado." });
      } else if (newCustomerData.cnpj) {
        setError("cnpj", { message: "CNPJ já cadastrado." });
      }
    }
  }

  async function handleConfirmPromote() {
    if (!promoteState.customerId) return;

    setIsPromoting(true);
    const response = await PromoteCustomerToTrainee({
      customerId: promoteState.customerId,
      birthdate: promoteState.birthdate,
    });
    setIsPromoting(false);

    if (response.statusCode === 201) {
      queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });
      queryClient.invalidateQueries({ queryKey: [ "get-all-trainees" ] });

      toast.success("Cliente cadastrado também como aluno!", {
        style: { fontSize: "1rem" },
      });
      setPromoteState({ open: false, customerId: null, birthdate: null });
      window.scroll({ top: 0 });
      reset();
    } else {
      toast.warning(
        response.message ?? "Não foi possível concluir a conversão.",
        { style: { fontSize: "1rem" } },
      );
    }
  }

  return (
    <>
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

      <PromoteToTraineeDialog
        isOpen={ promoteState.open }
        onOpenChange={ (open) => setPromoteState((prev) => ({ ...prev, open })) }
        onConfirm={ handleConfirmPromote }
        isLoading={ isPromoting }
      />
    </>
  );
}
