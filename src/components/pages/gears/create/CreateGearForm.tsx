"use client";
import React from "react";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectFilial } from "@/components/shared/SelectFilial";
import {
  createGearFormSchema,
  CreateGearFormSchemaType,
} from "@/lib/zod/CreateGearValidation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { queryClient } from "@/app/(main)/layout";

export function CreateGearForm() {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  // Get accessible filials for create
  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.GEARS);

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

  const createGearMethods = useForm<CreateGearFormSchemaType>({
    resolver: zodResolver(createGearFormSchema),
    defaultValues: {
      sourceFilialId: defaultFilialId,
      availableUnits: 0,
      outOfServiceUnits: 0,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = createGearMethods;

  const availableUnits = watch("availableUnits") || 0;
  const outOfServiceUnits = watch("outOfServiceUnits") || 0;

  // Update totalUnits when available or outOfService changes
  React.useEffect(() => {
    setValue("totalUnits", availableUnits + outOfServiceUnits);
  }, [ availableUnits, outOfServiceUnits, setValue ]);

  async function handleCreateGear(newGearData: CreateGearFormSchemaType) {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/gears/create`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newGearData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        toast.warning(data.message, { style: { fontSize: "1rem" } });
        window.scroll({ top: 0 });
      } else {
        toast.success("Equipamento criado com sucesso!", {
          style: { fontSize: "1rem" },
        });
        window.scroll({ top: 0 });
        queryClient.invalidateQueries({ queryKey: [ "get-all-gears" ] });
        reset();
      }
    } catch {
      toast.error("Erro ao criar equipamento.");
    }
  }

  return (
    <CardContent className="">
      <form id="create-gear-form" onSubmit={ handleSubmit(handleCreateGear) }>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Nome do equipamento</Label>
              <Input
                id="name"
                placeholder="Nome do equipamento"
                className={ `placeholder:text-sm placeholder:text-placeholder ${
                  errors.gearName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }` }
                { ...register("gearName") }
              />
              {errors.gearName && (
                <p className="text-sm text-destructive mt-2">
                  {errors.gearName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Filial</Label>
              <FormProvider { ...createGearMethods }>
                <SelectFilial<CreateGearFormSchemaType>
                  control={ control }
                  name="sourceFilialId"
                  accessibleFilials={ accessibleFilialsIds }
                  defaultFilial={ user?.sourceFilial?.filialId }
                />
              </FormProvider>
              {errors.sourceFilialId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.sourceFilialId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="availableUnits">Unidades Disponíveis</Label>
            <Controller
              control={ control }
              name="availableUnits"
              render={ ({ field }) => (
                <AmountControlButton
                  value={ field.value || 0 }
                  onChange={ field.onChange }
                  error={ !!errors.availableUnits }
                />
              ) }
            />
            {errors.availableUnits && (
              <p className="text-sm text-destructive mt-2">
                {errors.availableUnits.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="outOfServiceUnits">Unidades Fora de Serviço</Label>
            <Controller
              control={ control }
              name="outOfServiceUnits"
              render={ ({ field }) => (
                <AmountControlButton
                  value={ field.value || 0 }
                  onChange={ field.onChange }
                  error={ !!errors.outOfServiceUnits }
                />
              ) }
            />
            {errors.outOfServiceUnits && (
              <p className="text-sm text-destructive mt-2">
                {errors.outOfServiceUnits.message}
              </p>
            )}
          </div>
        </div>
        <input type="hidden" { ...register("totalUnits") } />
      </form>
    </CardContent>
  );
}
