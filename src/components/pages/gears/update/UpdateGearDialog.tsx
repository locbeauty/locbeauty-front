import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  updateGearFormSchema,
  UpdateGearFormSchemaType,
} from "@/lib/zod/UpdateGearValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectFilial } from "@/components/shared/SelectFilial";

import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";

interface UpdateGearDialogProps {
  isUpdateGearDialogOpen: boolean;
  setIsUpdateGearDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedGear: Gear | null;
  setSelectedGear: Dispatch<SetStateAction<Gear | null>>;
  setGears: Dispatch<SetStateAction<Gear[] | null>>;
}

export function UpdateGearDialog({
  isUpdateGearDialogOpen,
  setIsUpdateGearDialogOpen,
  selectedGear,
  setSelectedGear,
  setGears,
}: UpdateGearDialogProps) {
  const { user } = useAuth();

  const updateGearMethods = useForm<UpdateGearFormSchemaType>({
    resolver: zodResolver(updateGearFormSchema),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isDirty },
  } = updateGearMethods;

  const availableUnits = watch("availableUnits") || 0;
  const outOfServiceUnits = watch("outOfServiceUnits") || 0;

  useEffect(() => {
    setValue("totalUnits", availableUnits + outOfServiceUnits);
  }, [ availableUnits, outOfServiceUnits, setValue ]);

  useEffect(() => {
    if (selectedGear) {
      reset({
        sourceFilialId: selectedGear?.SourceFilial?.filialId,
        availableUnits: selectedGear?.availableUnits,
        gearName: selectedGear?.gearName,
        outOfServiceUnits: selectedGear?.outOfServiceUnits,
        totalUnits: selectedGear?.totalUnits,
      });
    }
  }, [ selectedGear, reset ]);

  const handleSaveGear = async (targetGearData: UpdateGearFormSchemaType) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/gears/update?gearId=${selectedGear?.gearId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(targetGearData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        toast.warning(data.message, { style: { fontSize: "1rem" } });
      } else {
        toast.success("Equipamento atualizado com sucesso!", {
          style: { fontSize: "1rem" },
        });

        if (setGears) {
          setGears((prevGears) => {
            if (!prevGears) return [ data.gear ];
            return prevGears.map((g) =>
              g.gearId === data.gear.gearId ? data.gear : g,
            );
          });
        }

        await queryClient.invalidateQueries({ queryKey: [ "get-all-gears" ] });
        await queryClient.invalidateQueries({
          queryKey: [ "get-day-checkouts" ],
        });

        reset();
        setIsUpdateGearDialogOpen(false);
      }
    } catch {
      toast.error("Erro ao atualizar equipamento.");
    }
  };

  return (
    <Dialog
      open={ isUpdateGearDialogOpen }
      onOpenChange={ setIsUpdateGearDialogOpen }
    >
      <DialogContent
        className="sm:max-w-[600px]"
        aria-describedby={ undefined }
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <DialogHeader>
          <DialogTitle>Editar Equipamento</DialogTitle>
        </DialogHeader>

        {selectedGear && (
          <form
            onSubmit={ handleSubmit(handleSaveGear) }
            className="grid gap-6 py-4"
          >
            {/* Informações Gerais */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input { ...register("gearName") } />
              </div>

              {user?.role === USER_ROLES.GERENTE && (
                <div className="space-y-2">
                  <Label>Filial</Label>
                  <FormProvider { ...updateGearMethods }>
                    <SelectFilial<UpdateGearFormSchemaType>
                      control={ control }
                      name="sourceFilialId"
                    />
                  </FormProvider>
                  {errors.sourceFilialId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.sourceFilialId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Gestão de Estoque */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Gestão de Estoque
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="availableUnits"
                    className="text-muted-foreground font-normal"
                  >
                    Disponíveis
                  </Label>
                  <Controller
                    control={ control }
                    name="availableUnits"
                    render={ ({ field }) => (
                      <div className="flex justify-start">
                        <AmountControlButton
                          value={ field.value || 0 }
                          onChange={ field.onChange }
                          error={ !!errors.availableUnits }
                        />
                      </div>
                    ) }
                  />
                  {errors.availableUnits && (
                    <p className="text-sm text-destructive">
                      {errors.availableUnits.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="outOfServiceUnits"
                    className="text-muted-foreground font-normal"
                  >
                    Defeituosas
                  </Label>
                  <Controller
                    control={ control }
                    name="outOfServiceUnits"
                    render={ ({ field }) => (
                      <div className="flex justify-start">
                        <AmountControlButton
                          value={ field.value || 0 }
                          onChange={ field.onChange }
                          error={ !!errors.outOfServiceUnits }
                        />
                      </div>
                    ) }
                  />
                  {errors.outOfServiceUnits && (
                    <p className="text-sm text-destructive">
                      {errors.outOfServiceUnits.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={ () => setIsUpdateGearDialogOpen(false) }
              >
                Cancelar
              </Button>
              <Button disabled={ !isDirty }>
                <Save className="mr-2 h-4 w-4" />
                Salvar alterações
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
