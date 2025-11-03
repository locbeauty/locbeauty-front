import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideMessageCircleQuestion } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";

interface AdditionalCostsDialogProps {
  setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAdditionalCostsDialogOpen: boolean;
}

export function AdditionalCostsDialog({
    isAdditionalCostsDialogOpen,
    setAdditionalCostsDialogOpen,
}: AdditionalCostsDialogProps) {

    const {
        watch,
        setValue,
        register,
        formState: { errors },
    } = useFormContext<CreateCheckoutFormSchemaType>();

    const selectedGears = watch("gears");

    const selectedGearsCost = selectedGears?.reduce(
        (acc, item) => acc + parseStringToCents(item.individualPrice),
        0
    );

    const [ distanceInKM, setDistanceInKM ] = useState("");
    const [ fuelCost, setFuelCost ] = useState("");
    const [ lodgingCost, setLodgingCost ] = useState("");
    const [ foodCost, setFoodCost ] = useState("");
    const [ additionalTransportCost, setAdditionalTransportCost ] = useState("");

    const finalCost =
    (parseStringToCents(fuelCost || "0") * Number(distanceInKM))
    + parseStringToCents(lodgingCost || "0")
    + parseStringToCents(foodCost || "0")
    + parseStringToCents(additionalTransportCost || "0")
    + selectedGearsCost;

    function handleApplyVariables() {
        setValue("fuelCost", fuelCost);
        setValue("lodgingCost", lodgingCost);
        setValue("foodCost", foodCost);
        setValue("additionalTransportCost", additionalTransportCost);
        setValue("distanceInKm", Number(distanceInKM));
        setValue("totalPrice", centsToString(finalCost));

        toast.success("Valores variáveis aplicados!");
    }

    function handleCloseDialog() {
        setAdditionalCostsDialogOpen(false);
        setValue("fuelCost", "0");
        setValue("lodgingCost", "0");
        setValue("foodCost", "0");
        setValue("additionalTransportCost", "0");
        setValue("distanceInKm", 0);
        setValue("totalPrice", centsToString(selectedGearsCost));

        setFuelCost("");
        setLodgingCost("");
        setFoodCost("");
        setAdditionalTransportCost("");
        setDistanceInKM("");
    }

    return (
        <Dialog
            open={ isAdditionalCostsDialogOpen }
            onOpenChange={ setAdditionalCostsDialogOpen }
        >
            <DialogTrigger asChild>
                <Button>
                + Custos adicionais
                </Button>
            </DialogTrigger>
            <DialogContent className="md:w-[40%] w-[75%] space-y-5">
                <DialogTitle>Valores adicionais</DialogTitle>
                <DialogDescription>Informações necessárias para o cálculo de custos referentes à entrega</DialogDescription>
                <div className="space-y-3">
                    <Label>Distância(KM)</Label>
                    <Input type="number" onChange={ (e) => setDistanceInKM(e.target.value) }  />
                </div>
                <div className="space-y-3">
                    <Label>Valor do combustível</Label>
                    <PriceInput withLabel={ false } onChange={ (value) => setFuelCost(value) } value={ fuelCost } />
                </div>
                <div className="space-y-3">
                    <Label>Custo de hospedagem</Label>
                    <PriceInput withLabel={ false } onChange={ (value) => setLodgingCost(value) } value={ lodgingCost } />

                </div>
                <div className="space-y-3">
                    <Label>Custo de alimentação</Label>
                    <PriceInput withLabel={ false } onChange={ (value) => setFoodCost(value) } value={ foodCost } />
                </div>
                <div className="">
                    <div className="inline-flex items-center gap-1 h-10">
                        <Label>Custo adicionais de transporte</Label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="xs">
                                    <LucideMessageCircleQuestion className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Pedágios, balsas, etc</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <PriceInput withLabel={ false } onChange={ (value) => setAdditionalTransportCost(value) } value={ additionalTransportCost } />
                </div>
                <div className="flex items-center justify-between">
                    <p>Valor final: <span className="font-bold">{ centsToString(finalCost) }</span></p>
                    <div className="flex items-center gap-4">
                        <Button type="button" onClick={ () => handleApplyVariables() }>Aplicar</Button>
                        <Button type="button" onClick={ () => handleCloseDialog() }>Cancelar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
