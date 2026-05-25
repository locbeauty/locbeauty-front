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
import { Label } from "@/components/ui/label";
import { Checkout } from "@/utils/@types/checkouts";
import { Gear } from "@/utils/@types/gears";
import { SelectAdditionalGear } from "./SelectAdditionalGear";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  AddGearInCheckout,
  GetAllCheckouts,
} from "@/services/checkouts.service";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { queryClient } from "@/app/(main)/layout";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const AdditionalGearSchema = z
  .object({
    individualPrice: z.string().min(1, "Informe o preço unitário"),
    extraCost: z.string().min(0), // permite vazio
    extraCostDescription: z.string().optional(),
    gear: z.object({
      gearId: z.string().min(1, "Selecione um equipamento"),
      gearName: z.string().min(1, "Selecione um equipamento"),
    }),
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
  // Fetch all checkouts for the day
  const { data: checkoutsData } = useQuery({
    queryKey: [
      "get-all-checkouts-for-availability",
      selectedCheckout?.date,
      selectedCheckout?.SourceFilial?.filialId,
    ],
    queryFn: () =>
      GetAllCheckouts({
        queryParams: {
          date: selectedCheckout?.date,
          filialIds: selectedCheckout?.SourceFilial?.filialId
            ? [ selectedCheckout.SourceFilial.filialId ]
            : undefined,
        },
      }),
    enabled:
      !!selectedCheckout?.date &&
      !!selectedCheckout?.SourceFilial?.filialId &&
      isOpen,
  });

  const unavailableGearIds = useMemo(() => {
    if (!checkoutsData?.data?.items || !selectedCheckout) return [];

    const otherCheckouts = checkoutsData.data.items.filter(
      (c) =>
        c.checkoutId !== selectedCheckout.checkoutId &&
        c.checkoutStatus !== "Cancelado",
    );

    const currentStart = selectedCheckout.startHourInMinutes;
    const currentEnd =
      selectedCheckout.startHourInMinutes +
      selectedCheckout.totalDurationInMinutes;

    const unavailable = new Set<string>();

    otherCheckouts.forEach((checkout) => {
      const start = checkout.startHourInMinutes;
      const end = checkout.startHourInMinutes + checkout.totalDurationInMinutes;

      // Check for overlap
      // (StartA < EndB) and (EndA > StartB)
      if (currentStart < end && currentEnd > start) {
        checkout.Bookings.forEach((booking) => {
          if (booking.status === "ACTIVE") {
            unavailable.add(booking.Gear.gearId);
          }
        });
      }
    });

    return Array.from(unavailable);
  }, [ checkoutsData, selectedCheckout ]);

  const AddGearMethods = useForm<AdditionalGearData>({
    resolver: zodResolver(AdditionalGearSchema),
    mode: "onChange",
    defaultValues: {
      gear: {
        gearId: "",
        gearName: "",
      },
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
      individualPrice: parseStringToCents(newGearData.individualPrice),
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

          {/* VALOR INDIVIDUAL */}
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
