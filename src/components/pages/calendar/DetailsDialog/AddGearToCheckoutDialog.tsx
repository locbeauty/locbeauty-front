"use client";

import { FormProvider, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Checkout } from "@/utils/@types/checkouts";
import { Gear } from "@/utils/@types/gears";
import { SelectAdditionalGear } from "./SelectAdditionalGear";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { AddGearInCheckout } from "@/services/checkouts.service";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { queryClient } from "@/app/(main)/layout";
import { toast } from "sonner";
import { useUnavailableGearIds } from "@/hooks/useUnavailableGearIds";

export const AdditionalGearSchema = z
  .object({
    isCourtesy: z.boolean(),
    individualPrice: z.string(), // obrigatório apenas quando não é cortesia
    extraCost: z.string().min(0), // permite vazio
    extraCostDescription: z.string().optional(),
    gear: z.object({
      gearId: z.string().min(1, "Selecione um equipamento"),
      gearName: z.string().min(1, "Selecione um equipamento"),
    }),
  })
  .refine((data) => data.isCourtesy || data.individualPrice.length >= 1, {
    message: "Informe o preço unitário",
    path: [ "individualPrice" ],
  })
  .refine(
    (data) =>
      !data.extraCost ||
      (data.extraCost &&
        data.extraCostDescription &&
        data.extraCostDescription.length > 0),
    {
      message: "Descreva o custo extra",
      path: [ "extraCostDescription" ],
    },
  );

export type AdditionalGearData = z.infer<typeof AdditionalGearSchema>;

interface AddGearToCheckoutDialogProps {
  selectedCheckout: Checkout | null;
  setSelectedCheckout: (checkout: Checkout | null) => void;
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

export function AddGearToCheckoutDialog({
  selectedCheckout,
  setSelectedCheckout,
  isOpen,
  setIsOpen,
}: AddGearToCheckoutDialogProps) {
  const unavailableGearIds = useUnavailableGearIds(selectedCheckout, isOpen);

  const AddGearMethods = useForm<AdditionalGearData>({
    resolver: zodResolver(AdditionalGearSchema),
    mode: "onChange",
    defaultValues: {
      gear: {
        gearId: "",
        gearName: "",
      },
      isCourtesy: false,
      individualPrice: "",
      extraCost: "",
      extraCostDescription: "",
    },
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = AddGearMethods;

  function handleSelectGear(gear: Gear) {
    setValue("gear", { gearId: gear.gearId, gearName: gear.gearName });
  }

  useEffect(() => {
    if (!isOpen) {
      setValue("gear", { gearId: "", gearName: "" });
      setValue("isCourtesy", false);
      setValue("individualPrice", "");
      setValue("extraCost", "");
      setValue("extraCostDescription", "");
    }
  }, [ setValue, isOpen ]);

  async function handleAddGearInCheckout(newGearData: AdditionalGearData) {
    if (!selectedCheckout) return null;
    const newData = {
      checkoutId: selectedCheckout?.checkoutId,
      extraMachineCosts: parseStringToCents(newGearData.extraCost),
      extraMachineCostsDescription: newGearData.extraCostDescription,
      gear: {
        gearId: newGearData.gear.gearId,
        gearName: newGearData.gear.gearName,
      },
      individualPrice: newGearData.isCourtesy
        ? 0
        : parseStringToCents(newGearData.individualPrice),
    };

    const response = await AddGearInCheckout(newData);

    if (response.statusCode !== 201) {
      toast.error("Erro ao adicionar equipamento ao agendamento.", {
        style: { fontSize: "1rem" },
      });
    } else {
      if (response.data && response.data.bookingId) {
        setSelectedCheckout({
          ...selectedCheckout,
          basePrice: selectedCheckout.basePrice + newData.individualPrice,
          totalPrice:
            selectedCheckout.totalPrice +
            newData.individualPrice +
            newData.extraMachineCosts,
          Bookings: [
            ...(selectedCheckout.Bookings || []),
            {
              bookingId: response.data.bookingId,
              extraMachineCosts: newData.extraMachineCosts,
              extraMachineCostsDescription:
                newData.extraMachineCostsDescription,
              status: "ACTIVE",
              Gear: {
                gearId: newData.gear.gearId,
                gearName: newData.gear.gearName,
              },
              individualPrice: newData.individualPrice,
            },
          ],
        });
        toast.success(response.message, { style: { fontSize: "1rem" } });
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        setIsOpen(false);
        reset();
      }
    }
  }

  return (
    <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar equipamento</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Adicione um novo equipamento ao agendamento.
        </DialogDescription>

        <form
          onSubmit={ handleSubmit(handleAddGearInCheckout) }
          className="space-y-4 mt-2"
        >
          {/* EQUIPAMENTO */}
          <div className="flex flex-col gap-2">
            <Label>Equipamento</Label>

            <FormProvider { ...AddGearMethods }>
              <SelectAdditionalGear
                onSelect={ handleSelectGear }
                selectedCheckout={ selectedCheckout! }
                unavailableGearIds={ unavailableGearIds }
              />
            </FormProvider>

            <div className="h-4">
              {errors.gear?.gearId && (
                <span className="text-sm text-red-500">
                  {errors.gear.gearId.message}
                </span>
              )}
            </div>
          </div>

          {/* CORTESIA */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isCourtesy"
              checked={ watch("isCourtesy") }
              onCheckedChange={ (checked) => {
                const isChecked = checked === true;
                setValue("isCourtesy", isChecked, { shouldValidate: true });
                if (isChecked) {
                  setValue("individualPrice", "", { shouldValidate: true });
                }
              } }
            />
            <Label htmlFor="isCourtesy" className="cursor-pointer">
              Cortesia
            </Label>
          </div>

          {/* VALOR INDIVIDUAL */}
          {!watch("isCourtesy") && (
            <div className="flex flex-col gap-2">
              <Label>Valor individual</Label>

              <PriceInput
                register={ register("individualPrice") }
                value={ watch("individualPrice") }
                setValue={ setValue }
                name="individualPrice"
                withLabel={ false }
              />

              <div className="h-4">
                {errors.individualPrice && (
                  <span className="text-sm text-red-500">
                    {errors.individualPrice.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* VALOR EXTRA */}
          <div className="flex flex-col gap-2">
            <Label>Valor extra (opcional)</Label>

            <PriceInput
              register={ register("extraCost") }
              value={ watch("extraCost") }
              setValue={ setValue }
              name="extraCost"
              withLabel={ false }
            />

            <div className="h-4">
              {errors.extraCost && (
                <span className="text-sm text-red-500">
                  {errors.extraCost.message}
                </span>
              )}
            </div>
          </div>

          {/* DESCRIÇÃO DO EXTRA */}
          <div className="flex flex-col gap-2">
            <Label>Descrição do valor extra</Label>

            <Textarea
              className="max-h-[150px]"
              placeholder="ex: Entrega rápida"
              { ...register("extraCostDescription") }
            />

            <div className="h-4">
              {errors.extraCostDescription && (
                <span className="text-sm text-red-500">
                  {errors.extraCostDescription.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={ () => setIsOpen(false) }
            >
              Cancelar
            </Button>

            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
