// import { Dispatch, SetStateAction, useEffect, useState } from "react";

// import {
//     Dialog,
//     DialogContent,
//     DialogDescription, DialogHeader,
//     DialogTitle
// } from "@/components/ui/dialog";
// import { Checkout } from "@/utils/@types/checkouts";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import PriceInput from "@/components/shared/PriceInput";
// import { centsToString } from "@/utils/centsToString";
// import { parseStringToCents } from "@/utils/parseStringToCents";
// import { toast } from "sonner";
// import { UpdateCheckout } from "@/services/checkouts.service";
// import { queryClient } from "@/app/(main)/layout";

// interface AdditionalCostsDialogProps {
//     setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
//     isAdditionalCostsDialogOpen: boolean;
//     setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>
//     selectedCheckout: Checkout
// }

// export function AdditionalCostsDialog({
//     isAdditionalCostsDialogOpen,
//     setAdditionalCostsDialogOpen,
//     selectedCheckout,
//     setSelectedCheckout,
// }: AdditionalCostsDialogProps) {

//     const [ distanceInKm, setDistanceInKm ] = useState(0);
//     const [ foodCost, setFoodCost ] = useState("0");
//     const [ fuelCost, setFuelCost ] = useState("0");
//     const [ lodgingCost, setLodgingCost ] = useState("0");
//     const [ additionalTransportCost, setAdditionalTransportCost ] = useState("0");

//     useEffect(() => {
//         setDistanceInKm(selectedCheckout.distanceInKm);
//         setFoodCost(centsToString(selectedCheckout.foodCost));
//         setFuelCost(centsToString(selectedCheckout.fuelCost));
//         setLodgingCost(centsToString(selectedCheckout.lodgingCost));
//         setAdditionalTransportCost(centsToString(selectedCheckout.additionalTransportCost));
//     }, [ selectedCheckout.additionalTransportCost, selectedCheckout.distanceInKm, selectedCheckout.foodCost, selectedCheckout.fuelCost, selectedCheckout.lodgingCost ]);

//     async function handleUpdateAdditionalCosts() {
//         const newDistanceInKm = distanceInKm ?? selectedCheckout.distanceInKm;
//         const newFuelCost = fuelCost ? parseStringToCents(fuelCost) : selectedCheckout.fuelCost;
//         const newLodgingCost = lodgingCost ? parseStringToCents(lodgingCost) : selectedCheckout.lodgingCost;
//         const newAdditionalTransportCost = additionalTransportCost
//             ? parseStringToCents(additionalTransportCost)
//             : selectedCheckout.additionalTransportCost;
//         const newFoodCost = foodCost ? parseStringToCents(foodCost) : selectedCheckout.foodCost;

//         const response = await UpdateCheckout({
//             body: {
//                 distanceInKm: newDistanceInKm,
//                 fuelCost: newFuelCost,
//                 lodgingCost: newLodgingCost,
//                 additionalTransportCost: newAdditionalTransportCost,
//                 foodCost: newFoodCost,
//             },
//             checkoutId: selectedCheckout.checkoutId,
//         });

//         if (response.statusCode !== 200) {
//             toast.warning(response.message, { style: { fontSize: "1rem" } });
//             window.scroll({ top: 0 });
//             return;
//         }

//         toast.success(response.message, { style: { fontSize: "1rem" } });
//         queryClient.invalidateQueries({
//             queryKey: [ "get-all-checkouts" ],
//         });

//         // ==============================
//         // CÁLCULO CONSISTENTE COM BACKEND
//         // ==============================

//         const oldDistance = selectedCheckout.distanceInKm || 0;
//         const oldFuel = selectedCheckout.fuelCost || 0;
//         const oldLodging = selectedCheckout.lodgingCost || 0;
//         const oldAdditionalTransport = selectedCheckout.additionalTransportCost || 0;
//         const oldFood = selectedCheckout.foodCost || 0;
//         const oldTotalPrice = selectedCheckout.totalPrice || 0;

//         // Contribuições antigas
//         const oldFuelContribution = oldDistance * oldFuel;
//         const oldLodgingContribution = oldLodging;
//         const oldAdditionalTransportContribution = oldAdditionalTransport;
//         const oldFoodContribution = oldFood;

//         // Contribuições novas
//         const newFuelContribution = newDistanceInKm * newFuelCost;
//         const newLodgingContribution = newLodgingCost;
//         const newAdditionalTransportContribution = newAdditionalTransportCost;
//         const newFoodContribution = newFoodCost;

//         // Recalcula delta e novo totalPrice
//         const delta =
//         (newFuelContribution - oldFuelContribution) +
//         (newLodgingContribution - oldLodgingContribution) +
//         (newAdditionalTransportContribution - oldAdditionalTransportContribution) +
//         (newFoodContribution - oldFoodContribution);

//         const newTotalPrice = Math.round(oldTotalPrice + delta);

//         // Atualiza o estado local do checkout
//         setSelectedCheckout((prev) => {
//             if (!prev) return prev;
//             return {
//                 ...prev,
//                 distanceInKm: newDistanceInKm,
//                 fuelCost: newFuelCost,
//                 lodgingCost: newLodgingCost,
//                 additionalTransportCost: newAdditionalTransportCost,
//                 foodCost: newFoodCost,
//                 totalPrice: newTotalPrice,
//             };
//         });

//         // Limpa campos e fecha o diálogo
//         setDistanceInKm(0);
//         setFoodCost("");
//         setFuelCost("");
//         setLodgingCost("");
//         setAdditionalTransportCost("");
//         setAdditionalCostsDialogOpen(false);
//     }

//     return (
//         <Dialog
//             open={ isAdditionalCostsDialogOpen }
//             onOpenChange={ setAdditionalCostsDialogOpen }
//         >
//             <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
//                 <DialogHeader>
//                     <DialogTitle className="text-xl">
//                                 Custos adicionais
//                     </DialogTitle>
//                     <DialogDescription>
//                                 Defina aqui custos adicionais como hospedagem, alimentação, combustível, custos de transportes adicionais, etc
//                     </DialogDescription>
//                 </DialogHeader>

//                 {/* Inputs adicionados */}
//                 <div className="space-y-4 mt-4">
//                     <div>
//                         <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valor do combustível (litro)</Label>
//                         <PriceInput withLabel={ false } onChange={ (value) => setFuelCost(value) } value={ fuelCost } />
//                     </div>
//                     <div>
//                         <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Distância (km)</Label>
//                         <Input
//                             type="number"
//                             value={ distanceInKm }
//                             onChange={ (e) => setDistanceInKm(Number(e.target.value) || 0) }
//                             className="mt-1 block w-full rounded border px-3 py-2 bg-white dark:bg-gray-800"
//                         />
//                     </div>
//                     <div>
//                         <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Alimentação</Label>
//                         <PriceInput withLabel={ false } onChange={ (value) => setFoodCost(value) } value={ foodCost } />

//                     </div>

//                     <div>
//                         <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Hospedagem</Label>
//                         <PriceInput withLabel={ false } onChange={ (value) => setLodgingCost(value) } value={ lodgingCost } />

//                     </div>

//                     <div>
//                         <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Custos adicionais de transporte</Label>
//                         <PriceInput withLabel={ false } onChange={ (value) => setAdditionalTransportCost(value) } value={ additionalTransportCost } />

//                     </div>

//                     <div className="flex justify-end gap-2 mt-2">
//                         <Button
//                             type="button"
//                             onClick={ () => setAdditionalCostsDialogOpen(false) }
//                             className="px-4 py-2 rounded border bg-transparent text-gray-700 dark:text-gray-200"
//                         >
//                             Cancelar
//                         </Button>
//                         <Button
//                             type="button"
//                             onClick={ handleUpdateAdditionalCosts }
//                         >
//                             Salvar
//                         </Button>
//                     </div>
//                 </div>

//             </DialogContent>
//         </Dialog>
//     );
// }

import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkout } from "@/utils/@types/checkouts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PriceInput from "@/components/shared/PriceInput";
import { centsToString } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { toast } from "sonner";
import { UpdateCheckout } from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { Separator } from "@/components/ui/separator";

interface UpdateAdditionalCostsDialogProps {
    setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
    isAdditionalCostsDialogOpen: boolean;
    setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
    selectedCheckout: Checkout;
}

export function UpdateAdditionalCostsDialog({
    isAdditionalCostsDialogOpen,
    setAdditionalCostsDialogOpen,
    selectedCheckout,
    setSelectedCheckout,
}: UpdateAdditionalCostsDialogProps) {
    const [ distanceInKm, setDistanceInKm ] = useState(0);
    const [ foodCost, setFoodCost ] = useState("0");
    const [ fuelCost, setFuelCost ] = useState("0");
    const [ lodgingCost, setLodgingCost ] = useState("0");
    const [ additionalTransportCost, setAdditionalTransportCost ] = useState("0");

    useEffect(() => {
        setDistanceInKm(selectedCheckout.distanceInKm);
        setFoodCost(centsToString(selectedCheckout.foodCost));
        setFuelCost(centsToString(selectedCheckout.fuelCost));
        setLodgingCost(centsToString(selectedCheckout.lodgingCost));
        setAdditionalTransportCost(centsToString(selectedCheckout.additionalTransportCost));
    }, [ selectedCheckout ]);

    // =====================================
    // CÁLCULO DO NOVO TOTAL (PREVIEW LOCAL)
    // =====================================
    const newTotalPricePreview = useMemo(() => {
        const newDistanceInKm = distanceInKm ?? selectedCheckout.distanceInKm;
        const newFuelCost = fuelCost ? parseStringToCents(fuelCost) : selectedCheckout.fuelCost;
        const newLodgingCost = lodgingCost ? parseStringToCents(lodgingCost) : selectedCheckout.lodgingCost;
        const newAdditionalTransportCost = additionalTransportCost
            ? parseStringToCents(additionalTransportCost)
            : selectedCheckout.additionalTransportCost;
        const newFoodCost = foodCost ? parseStringToCents(foodCost) : selectedCheckout.foodCost;

        const basePrice = selectedCheckout.basePrice || 0;
        const extraPrice = selectedCheckout.Bookings.filter(booking => booking.status === "ACTIVE").reduce((acc, current) => acc + current.extraMachineCosts, 0) || 0;
        const total =
            basePrice + extraPrice +
            newDistanceInKm * newFuelCost +
            newLodgingCost +
            newAdditionalTransportCost +
            newFoodCost;

        return Math.round(total);
    }, [
        distanceInKm,
        fuelCost,
        lodgingCost,
        additionalTransportCost,
        foodCost,
        selectedCheckout,
    ]);

    async function handleUpdateAdditionalCosts() {
        const newDistanceInKm = distanceInKm ?? selectedCheckout.distanceInKm;
        const newFuelCost = fuelCost ? parseStringToCents(fuelCost) : selectedCheckout.fuelCost;
        const newLodgingCost = lodgingCost ? parseStringToCents(lodgingCost) : selectedCheckout.lodgingCost;
        const newAdditionalTransportCost = additionalTransportCost
            ? parseStringToCents(additionalTransportCost)
            : selectedCheckout.additionalTransportCost;
        const newFoodCost = foodCost ? parseStringToCents(foodCost) : selectedCheckout.foodCost;

        const response = await UpdateCheckout({
            body: {
                distanceInKm: newDistanceInKm,
                fuelCost: newFuelCost,
                lodgingCost: newLodgingCost,
                additionalTransportCost: newAdditionalTransportCost,
                foodCost: newFoodCost,
            },
            checkoutId: selectedCheckout.checkoutId,
        });

        if (response.statusCode !== 200) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            return;
        }

        toast.success(response.message, { style: { fontSize: "1rem" } });
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });

        setSelectedCheckout((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                distanceInKm: newDistanceInKm,
                fuelCost: newFuelCost,
                lodgingCost: newLodgingCost,
                additionalTransportCost: newAdditionalTransportCost,
                foodCost: newFoodCost,
                totalPrice: newTotalPricePreview,
            };
        });

        setDistanceInKm(0);
        setFoodCost("");
        setFuelCost("");
        setLodgingCost("");
        setAdditionalTransportCost("");
        setAdditionalCostsDialogOpen(false);
    }

    return (
        <Dialog
            open={ isAdditionalCostsDialogOpen }
            onOpenChange={ setAdditionalCostsDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">Custos adicionais</DialogTitle>
                    <DialogDescription>
                        Defina aqui custos adicionais como hospedagem, alimentação, combustível, custos de transporte adicionais, etc.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label>Valor do combustível (litro)</Label>
                        <PriceInput withLabel={ false } onChange={ setFuelCost } value={ fuelCost } />
                    </div>

                    <div>
                        <Label>Distância (km)</Label>
                        <Input
                            type="number"
                            value={ distanceInKm }
                            onChange={ (e) => setDistanceInKm(Number(e.target.value) || 0) }
                        />
                    </div>

                    <div>
                        <Label>Alimentação</Label>
                        <PriceInput withLabel={ false } onChange={ setFoodCost } value={ foodCost } />
                    </div>

                    <div>
                        <Label>Hospedagem</Label>
                        <PriceInput withLabel={ false } onChange={ setLodgingCost } value={ lodgingCost } />
                    </div>

                    <div className="pb-3">
                        <Label>Custos adicionais de transporte</Label>
                        <PriceInput
                            withLabel={ false }
                            onChange={ setAdditionalTransportCost }
                            value={ additionalTransportCost }
                        />
                    </div>
                    <Separator />
                    {/* PREVIEW DO NOVO TOTAL */}
                    <div className="pt-3 mt-4 text-right">
                        <p className="text-sm text-muted-foreground">
                            Total atual: <span className="font-medium">R$ {centsToString(selectedCheckout.totalPrice)}</span>
                        </p>
                        <p className="text-sm">
                            Novo total:{" "}
                            <span className="font-semibold text-green-500">
                                R$ {centsToString(newTotalPricePreview)}
                            </span>
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            onClick={ () => setAdditionalCostsDialogOpen(false) }
                            variant="outline"
                        >
                            Cancelar
                        </Button>
                        <Button type="button" onClick={ handleUpdateAdditionalCosts }>
                            Salvar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
