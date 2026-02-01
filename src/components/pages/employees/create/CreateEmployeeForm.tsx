"use client";

import { CardContent } from "@/components/ui/card";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { Label } from "@/components/ui/label";
import {
  createEmployeeFormSchema,
  CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EmployeeForm } from "../forms/EmployeeForm";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function CreateEmployeeForm() {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.EMPLOYEES);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const defaultFilialId =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? user?.sourceFilial?.filialId
      : accessibleFilialsIds?.includes(user?.sourceFilial?.filialId || "")
        ? user?.sourceFilial?.filialId
        : accessibleFilialsIds?.[0];

  const CreateEmployeeMethods = useForm<CreateEmployeeFormSchemaType>({
    resolver: zodResolver(createEmployeeFormSchema),
    defaultValues: {
      sourceFilialId: defaultFilialId || "",
    },
  });

  const { handleSubmit, reset, setError } = CreateEmployeeMethods;

  async function handleCreateEmployee(
    newEmployeeData: CreateEmployeeFormSchemaType,
  ) {
    console.log("Submit data:", newEmployeeData);
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/employees/create`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmployeeData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        toast.warning(data.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
        if (response.status === 409) {
          setError("username", { message: "Username já cadastrado." });
        }
      } else {
        toast.success("Funcionário criado com sucesso!", {
          style: { fontSize: "1rem" },
        });
        window.scroll({ top: 0 });
        reset();
      }
    } catch {
      toast.error("Erro ao criar funcionário.");
    }
  }

  return (
    <CardContent>
      <form
        id="create-employee-form"
        className="space-y-6"
        onSubmit={handleSubmit(handleCreateEmployee)}
      >
        <FormProvider {...CreateEmployeeMethods}>
          <EmployeeForm
            accessibleFilialsIds={accessibleFilialsIds}
            defaultFilialId={defaultFilialId}
          />
        </FormProvider>
      </form>
    </CardContent>
  );
}
