// import { Dispatch, SetStateAction, useEffect, useState } from "react";

// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogTitle,
//     DialogTrigger
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { LucideMessageCircleQuestion } from "lucide-react";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import { useFormContext } from "react-hook-form";
// import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
// import PriceInput from "@/components/shared/PriceInput";
// import { parseStringToCents } from "@/utils/parseStringToCents";
// import { centsToString } from "@/utils/centsToString";
// import { toast } from "sonner";
// import { CityInput } from "./CityInput";

// interface AdditionalCostsDialogProps {
//   setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
//   isAdditionalCostsDialogOpen: boolean;
// }

// export function AdditionalCostsDialog({
//     isAdditionalCostsDialogOpen,
//     setAdditionalCostsDialogOpen,
// }: AdditionalCostsDialogProps) {

//     const {
//         watch,
//         setValue,
//         register,
//         formState: { errors },
//     } = useFormContext<CreateCheckoutFormSchemaType>();

//     const selectedGears = watch("gears");

//     const selectedGearsCost = selectedGears?.reduce(
//         (acc, item) => acc + parseStringToCents(item.individualPrice),
//         0
//     );

//     const [ distanceInKM, setDistanceInKM ] = useState(0);
//     const [ consumptionKmPerLiter, setConsumptionKmPerLiter ] = useState(10);
//     const [ fuelCost, setFuelCost ] = useState("");
//     const [ lodgingCost, setLodgingCost ] = useState("");
//     const [ foodCost, setFoodCost ] = useState("");
//     const [ additionalTransportCost, setAdditionalTransportCost ] = useState("");

//     const pricePerLiterCents = parseStringToCents(fuelCost || "0");
//     const litersNeeded = Number(distanceInKM) / Number(consumptionKmPerLiter || 1);
//     const fuelTotalCents = Math.round(pricePerLiterCents * litersNeeded);

//     const finalCost =
//   fuelTotalCents +
//   parseStringToCents(lodgingCost || "0") +
//   parseStringToCents(foodCost || "0") +
//   parseStringToCents(additionalTransportCost || "0") +
//   selectedGearsCost;

//     useEffect(() => {
//         console.log("finalCost: ", finalCost);
//     }, [ finalCost ]);

//     function handleApplyVariables() {
//         setValue("fuelCost", fuelCost);
//         setValue("lodgingCost", lodgingCost);
//         setValue("foodCost", foodCost);
//         setValue("additionalTransportCost", additionalTransportCost);
//         setValue("distanceInKm", Number(distanceInKM));
//         setValue("totalPrice", centsToString(finalCost));

//         toast.success("Valores variáveis aplicados!");
//     }

//     function handleCloseDialog() {
//         setAdditionalCostsDialogOpen(false);
//         setValue("fuelCost", "0");
//         setValue("lodgingCost", "0");
//         setValue("foodCost", "0");
//         setValue("additionalTransportCost", "0");
//         setValue("distanceInKm", 0);
//         setValue("totalPrice", centsToString(selectedGearsCost));

//         setFuelCost("");
//         setLodgingCost("");
//         setFoodCost("");
//         setAdditionalTransportCost("");
//         setDistanceInKM(0);
//     }

//     return (
//         <Dialog
//             open={ isAdditionalCostsDialogOpen }
//             onOpenChange={ setAdditionalCostsDialogOpen }
//         >
//             <DialogTrigger asChild>
//                 <Button>
//                 + Custos adicionais
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="md:w-[40%] w-[75%] space-y-5">
//                 <DialogTitle>Valores adicionais</DialogTitle>
//                 <DialogDescription>Informações necessárias para o cálculo de custos referentes à entrega</DialogDescription>
//                 <div className="space-y-3">
//                     <Label>Distância(KM)</Label>
//                     {/* <Input type="number" onChange={ (e) => setDistanceInKM(+e.target.value) } value={ distanceInKM }  /> */}
//                     <CityInput distanceInKM={ distanceInKM } setDistanceInKM={ setDistanceInKM } />
//                 </div>
//                 <div className="space-y-3">
//                     <Label>Valor do combustível</Label>
//                     <PriceInput withLabel={ false } onChange={ (value) => setFuelCost(value) } value={ fuelCost } />
//                 </div>
//                 <div className="space-y-3">
//                     <Label>Km/Litro</Label>
//                     <Input type="number" onChange={ (value) => setConsumptionKmPerLiter(+value.target.value) } value={ consumptionKmPerLiter } />
//                 </div>
//                 <div className="space-y-3">
//                     <Label>Custo de hospedagem</Label>
//                     <PriceInput withLabel={ false } onChange={ (value) => setLodgingCost(value) } value={ lodgingCost } />

//                 </div>
//                 <div className="space-y-3">
//                     <Label>Custo de alimentação</Label>
//                     <PriceInput withLabel={ false } onChange={ (value) => setFoodCost(value) } value={ foodCost } />
//                 </div>
//                 <div className="">
//                     <div className="inline-flex items-center gap-1 h-10">
//                         <Label>Custo adicionais de transporte</Label>
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="xs">
//                                     <LucideMessageCircleQuestion className="size-4" />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                                 <p>Pedágios, balsas, etc</p>
//                             </TooltipContent>
//                         </Tooltip>
//                     </div>
//                     <PriceInput withLabel={ false } onChange={ (value) => setAdditionalTransportCost(value) } value={ additionalTransportCost } />
//                 </div>
//                 <div className="flex items-center justify-between">
//                     <p>Valor final: <span className="font-bold">{ centsToString(finalCost) }</span></p>
//                     <div className="flex items-center gap-4">
//                         <Button type="button" onClick={ () => handleApplyVariables() }>Aplicar</Button>
//                         <Button type="button" onClick={ () => handleCloseDialog() }>Cancelar</Button>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CarFront,
    BedDouble,
    Utensils,
    MessageCircleQuestion,
    MapPin,
    Fuel,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";
import { CityInput } from "./CityInput";
import { Separator } from "@/components/ui/separator";

interface AdditionalCostsDialogProps {
  setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAdditionalCostsDialogOpen: boolean;
}

export function AdditionalCostsDialog({
    isAdditionalCostsDialogOpen,
    setAdditionalCostsDialogOpen,
}: AdditionalCostsDialogProps) {
    const { watch, setValue, getValues } =
    useFormContext<CreateCheckoutFormSchemaType>();

    // Estados locais para edição dentro do modal
    const [ distanceInKM, setDistanceInKM ] = useState(0);
    const [ consumptionKmPerLiter, setConsumptionKmPerLiter ] = useState(10);
    const [ fuelCost, setFuelCost ] = useState("");
    const [ lodgingCost, setLodgingCost ] = useState("");
    const [ foodCost, setFoodCost ] = useState("");
    const [ additionalTransportCost, setAdditionalTransportCost ] = useState("");

    // Observa os equipamentos selecionados do formulário principal
    const selectedGears = watch("gears");

    // Recalcula custo de equipamentos sempre que mudar
    const selectedGearsCost = useMemo(() => {
        return (
            selectedGears?.reduce(
                (acc, item) => acc + parseStringToCents(item.individualPrice),
                0
            ) || 0
        );
    }, [ selectedGears ]);

    // Cálculos derivados
    const pricePerLiterCents = parseStringToCents(fuelCost || "0");
    // Evita divisão por zero ou nulo
    const safeConsumption = Number(consumptionKmPerLiter) || 1;

    // Cálculo de combustível
    let fuelTotalCents = 0;
    if (distanceInKM > 0 && pricePerLiterCents > 0) {
        const litersNeeded = Number(distanceInKM) / safeConsumption;
        fuelTotalCents = Math.round(pricePerLiterCents * litersNeeded);
    }

    const finalCost =
    fuelTotalCents +
    parseStringToCents(lodgingCost || "0") +
    parseStringToCents(foodCost || "0") +
    parseStringToCents(additionalTransportCost || "0") +
    selectedGearsCost;

    // EFEITO DE SINCRONIZAÇÃO (CRÍTICO):
    // Quando o modal abre, preenche os estados locais com o que já está salvo no formulário.
    useEffect(() => {
        if (isAdditionalCostsDialogOpen) {
            const currentValues = getValues();

            setFuelCost(currentValues.fuelCost || "");
            setLodgingCost(currentValues.lodgingCost || "");
            setFoodCost(currentValues.foodCost || "");
            setAdditionalTransportCost(currentValues.additionalTransportCost || "");
            setDistanceInKM(Number(currentValues.distanceInKm) || 0);
            setConsumptionKmPerLiter(Number(currentValues.consumption) || 10);
        }
    }, [ isAdditionalCostsDialogOpen, getValues ]);

    function handleSaveVariables() {
        setValue("fuelCost", fuelCost);
        setValue("lodgingCost", lodgingCost);
        setValue("foodCost", foodCost);
        setValue("additionalTransportCost", additionalTransportCost);
        setValue("distanceInKm", Number(distanceInKM));
        setValue("consumption", Number(consumptionKmPerLiter));

        // Atualiza o total final no formulário
        setValue("totalPrice", centsToString(finalCost));

        toast.success("Custos adicionais aplicados!");
        setAdditionalCostsDialogOpen(false);
    }

    function handleCancel() {
        setAdditionalCostsDialogOpen(false);
    }

    function handleClear() {
        setFuelCost("");
        setLodgingCost("");
        setFoodCost("");
        setAdditionalTransportCost("");
        setDistanceInKM(0);
        setConsumptionKmPerLiter(10);
    }

    return (
        <Dialog
            open={ isAdditionalCostsDialogOpen }
            onOpenChange={ setAdditionalCostsDialogOpen }
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
          + Custos adicionais
                </Button>
            </DialogTrigger>

            <DialogContent className="md:w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <CarFront className="h-6 w-6 text-primary" />
            Custos de Logística e Viagem
                    </DialogTitle>
                    <DialogDescription>
            Calcule e adicione custos variáveis relacionados à entrega e
            estadia.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Coluna da Esquerda: Logística */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-primary/80 border-b pb-2">
                            <Fuel className="h-4 w-4" /> Transporte
                        </div>

                        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> Distância Total (Ida e
                  Volta)
                                </Label>
                                <CityInput
                                    setDistanceInKM={ setDistanceInKM }
                                    distanceInKM={ distanceInKM }
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground w-16">
                    Manual:
                                    </span>
                                    <Input
                                        type="number"
                                        className="h-7 w-20 text-xs"
                                        value={ distanceInKM }
                                        onChange={ (e) => setDistanceInKM(Number(e.target.value)) }
                                        placeholder="0"
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                    km
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Preço Combustível (Litro)</Label>
                                    <PriceInput
                                        withLabel={ false }
                                        onChange={ setFuelCost }
                                        value={ fuelCost }
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Consumo (Km/L)</Label>
                                    <Input
                                        type="number"
                                        min={ 1 }
                                        onChange={ (e) =>
                                            setConsumptionKmPerLiter(Number(e.target.value))
                                        }
                                        value={ consumptionKmPerLiter }
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="text-sm bg-primary/5 p-2 rounded text-primary flex justify-between items-center">
                                <span>Custo estimado de combustível:</span>
                                <span className="font-bold">
                                    {centsToString(fuelTotalCents)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2">
                                <Label className="flex items-center gap-1">
                                    <MessageCircleQuestion className="h-3.5 w-3.5" /> Extras
                  (Pedágio, Balsa)
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <MessageCircleQuestion className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Custos de pedágios, balsas e outros transportes.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <PriceInput
                                withLabel={ false }
                                onChange={ setAdditionalTransportCost }
                                value={ additionalTransportCost }
                                placeholder="R$ 0,00"
                            />
                        </div>
                    </div>

                    {/* Coluna da Direita: Estadia e Resumo */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-primary/80 border-b pb-2">
                            <BedDouble className="h-4 w-4" /> Estadia e Alimentação
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <BedDouble className="h-3.5 w-3.5" /> Custo de Hospedagem
                                </Label>
                                <PriceInput
                                    withLabel={ false }
                                    onChange={ setLodgingCost }
                                    value={ lodgingCost }
                                    placeholder="R$ 0,00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Utensils className="h-3.5 w-3.5" /> Custo de Alimentação
                                </Label>
                                <PriceInput
                                    withLabel={ false }
                                    onChange={ setFoodCost }
                                    value={ foodCost }
                                    placeholder="R$ 0,00"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                Resumo de Custos
                            </h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Equipamentos:</span>
                                <span>{centsToString(selectedGearsCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                  Combustível + Extras:
                                </span>
                                <span>
                                    {centsToString(
                                        Math.round(
                                            (parseStringToCents(fuelCost || "0") /
                                                (Number(consumptionKmPerLiter) || 1)) *
                                            Number(distanceInKM || "0")
                                        ) + parseStringToCents(additionalTransportCost || "0")
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                  Estadia + Alimentação:
                                </span>
                                <span>
                                    {centsToString(
                                        parseStringToCents(lodgingCost || "0") +
                      parseStringToCents(foodCost || "0")
                                    )}
                                </span>
                            </div>
                            <Separator className="bg-primary/20" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-semibold">Total Estimado:</span>
                                <span className="font-bold text-xl text-primary">
                                    {centsToString(finalCost)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 border-t pt-4">
                    <Button
                        variant="ghost"
                        onClick={ handleClear }
                        type="button"
                        className="sm:mr-auto"
                    >
            Limpar Campos
                    </Button>
                    <Button variant="outline" onClick={ handleCancel } type="button">
            Cancelar
                    </Button>
                    <Button onClick={ handleSaveVariables } type="button" className="gap-2">
                        <CarFront className="h-4 w-4" /> Aplicar Custos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
