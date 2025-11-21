"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkout } from "@/utils/@types/checkouts";
import { Gear } from "@/utils/@types/gears";
import { SelectAdditionalGear } from "./SelectAdditionalGear";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

export const AdditionalGearSchema = z
    .object({
        gearId: z.string().min(1, "Selecione um equipamento"),
        individualPrice: z.string().min(1, "Informe o preço unitário"),
        extraCost: z.string().min(0), // permite vazio
        extraCostDescription: z.string().optional(),
    })
    .refine(
        (data) =>
            !data.extraCost || (data.extraCost && data.extraCostDescription && data.extraCostDescription.length > 0),
        {
            message: "Descreva o custo extra",
            path: [ "extraCostDescription" ],
        }
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
    isOpen,
    setIsOpen,
}: AddGearToCheckoutDialogProps) {
    const AddGearMethods = useForm<AdditionalGearData>({
        resolver: zodResolver(AdditionalGearSchema),
        mode: "onChange",
        defaultValues: {
            gearId: "",
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
        setValue("gearId", gear.gearId);
    }

    useEffect(() => {
        if(!isOpen) {
            setValue("gearId", "");
            setValue("individualPrice", "");
            setValue("extraCost", "");
            setValue("extraCostDescription", "");
        }
    }, [ setValue, isOpen ]);

    function handleAddGearInCheckout(newGearData: AdditionalGearData) {
        console.log("Enviar para backend:", newGearData);
        // setIsOpen(false);
        // reset();
    }

    return (
        <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar equipamento</DialogTitle>
                </DialogHeader>

                <form onSubmit={ handleSubmit(handleAddGearInCheckout) } className="space-y-4 mt-2">
                    {/* EQUIPAMENTO */}
                    <div className="flex flex-col gap-2">
                        <Label>Equipamento</Label>

                        <div className="border rounded-md p-2">
                            <FormProvider { ...AddGearMethods }>
                                <SelectAdditionalGear
                                    onSelect={ handleSelectGear }
                                    selectedCheckout={ selectedCheckout! }
                                />
                            </FormProvider>
                        </div>

                        <div className="h-4">
                            {errors.gearId && (
                                <span className="text-sm text-red-500">{errors.gearId.message}</span>
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
                                <span className="text-sm text-red-500">{errors.individualPrice.message}</span>
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
                                <span className="text-sm text-red-500">{errors.extraCost.message}</span>
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
                                <span className="text-sm text-red-500">{errors.extraCostDescription.message}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={ () => setIsOpen(false) }>
                            Cancelar
                        </Button>

                        <Button type="submit">
                            Adicionar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
