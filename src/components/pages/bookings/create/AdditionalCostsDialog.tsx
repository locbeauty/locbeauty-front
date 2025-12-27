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
import { LucideMessageCircleQuestion } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation"; // Ajuste conforme seu caminho real
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";
import { CityInput } from "./CityInput";

interface AdditionalCostsDialogProps {
  setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAdditionalCostsDialogOpen: boolean;
  setConsumptionKmPerLiter: Dispatch<SetStateAction<number>>;
  consumptionKmPerLiter: number;
}

export function AdditionalCostsDialog({
    isAdditionalCostsDialogOpen,
    setAdditionalCostsDialogOpen,
    consumptionKmPerLiter,
    setConsumptionKmPerLiter
}: AdditionalCostsDialogProps) {
    const {
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<CreateCheckoutFormSchemaType>();

    // Estados locais para edição dentro do modal
    const [ distanceInKM, setDistanceInKM ] = useState(0);
    // const [ consumptionKmPerLiter, setConsumptionKmPerLiter ] = useState(10);
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
    const litersNeeded = Number(distanceInKM) / safeConsumption;
    const fuelTotalCents = Math.round(pricePerLiterCents * litersNeeded);

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

            // Se você tiver um campo para consumo no form principal, carregue aqui também.
            // Caso contrário, mantém o padrão ou o último estado.
        }
    }, [ isAdditionalCostsDialogOpen, getValues ]);

    function handleSaveVariables() {
        setValue("fuelCost", fuelCost);
        setValue("lodgingCost", lodgingCost);
        setValue("foodCost", foodCost);
        setValue("additionalTransportCost", additionalTransportCost);
        setValue("distanceInKm", Number(distanceInKM));

        // Atualiza o total final no formulário
        setValue("totalPrice", centsToString(finalCost));

        toast.success("Custos adicionais aplicados!");
        setAdditionalCostsDialogOpen(false);
    }

    function handleCancel() {
    // Apenas fecha o modal. NÃO deve limpar o formulário (setValue).
    // O usuário pode ter clicado em cancelar por engano e não quer perder o que já estava salvo anteriormente.
        setAdditionalCostsDialogOpen(false);
    }

    // Função opcional caso queira um botão explícito para limpar
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
                <Button variant="outline">+ Custos adicionais</Button>
            </DialogTrigger>

            <DialogContent className="md:w-[70%] w-[90%] max-h-[90vh] overflow-y-auto space-y-4">
                <DialogHeader>
                    <DialogTitle>Valores adicionais</DialogTitle>
                    <DialogDescription>
            Insira as variáveis para compor o custo final da entrega.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Distância (KM)</Label>
                        {/* ATENÇÃO: O componente CityInput precisa ser capaz de receber
               setDistanceInKM como prop (Controlled Component) ou callback.
               Estou assumindo que você ajustou o CityInput para aceitar:
               onDistanceChange={(dist) => setDistanceInKM(dist)}
            */}
                        <CityInput
                            // Exemplo de como passar as props se o CityInput estiver ajustado:
                            // initialDistance={distanceInKM}
                            setDistanceInKM={ setDistanceInKM }
                            distanceInKM={ distanceInKM }
                        />
                        {/* Fallback caso CityInput não funcione ou para teste manual: */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Manual:</span>
                            <Input
                                type="number"
                                className="h-8 w-24"
                                value={ distanceInKM }
                                onChange={ (e) => setDistanceInKM(Number(e.target.value)) }
                            />
                            <span className="text-sm font-medium">{distanceInKM} km definidos</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Preço Combustível (Litro)</Label>
                            <PriceInput
                                withLabel={ false }
                                onChange={ setFuelCost }
                                value={ fuelCost }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Consumo (Km/L)</Label>
                            <Input
                                type="number"
                                min={ 1 }
                                onChange={ (e) => setConsumptionKmPerLiter(Number(e.target.value)) }
                                value={ consumptionKmPerLiter }
                            />
                        </div>
                    </div>

                    {/* Exibição do custo calculado de combustível para feedback imediato */}
                    <div className="text-sm text-muted-foreground text-right">
            Custo estimado de combustível: <strong>{centsToString(fuelTotalCents)}</strong>
                    </div>

                    <div className="space-y-2">
                        <Label>Custo de hospedagem</Label>
                        <PriceInput
                            withLabel={ false }
                            onChange={ setLodgingCost }
                            value={ lodgingCost }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Custo de alimentação</Label>
                        <PriceInput
                            withLabel={ false }
                            onChange={ setFoodCost }
                            value={ foodCost }
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Custos extras (Pedágio, Balsa)</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <LucideMessageCircleQuestion className="h-4 w-4 text-muted-foreground cursor-help" />
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
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="flex flex-col text-sm">
                        <span className="text-muted-foreground">Equipamentos: {centsToString(selectedGearsCost)}</span>
                        <span>Total Estimado: <span className="font-bold text-lg text-primary">{centsToString(finalCost)}</span></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={ handleClear } type="button">
                Limpar
                        </Button>
                        <Button variant="outline" onClick={ handleCancel } type="button">
              Cancelar
                        </Button>
                        <Button onClick={ handleSaveVariables } type="button">
              Salvar Custos
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}