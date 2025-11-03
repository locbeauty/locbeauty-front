import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Plus
} from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GetBookingById, UpdateBooking } from "@/services/bookings.service";
import { toast } from "sonner";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Booking } from "@/utils/@types/bookings";
import { centsToString } from "@/utils/centsToString";
import { queryClient } from "@/app/(main)/layout";
import { FlattenedBooking } from "../WeekView";

interface MachineExtraCostsDialogProps {
    setMachineExtraCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
    isMachineExtraCostsDialogOpen: boolean;
    selectedBookingId: string
    setSelectedCheckout: Dispatch<SetStateAction<FlattenedBooking | null>>
}

export function MachineExtraCostsDialog({
    isMachineExtraCostsDialogOpen,
    setMachineExtraCostsDialogOpen,
    selectedBookingId,
    setSelectedCheckout
}: MachineExtraCostsDialogProps) {

    const [ individualPrice, setIndividualPrice ] = useState("0");
    const [ extraMachineCosts, setExtraMachineCosts ] = useState("0");
    const [ extraMachineCostsDescription, setExtraMachineCostsDescription ] = useState("");

    const { data } = useQuery<Booking | undefined, Error>({
        queryKey: [ "get-booking-by-id", selectedBookingId ],
        queryFn: () => GetBookingById({ bookingId: selectedBookingId }), // Agora retorna Promise<Booking>
        enabled: !!selectedBookingId, // só roda quando selectedBookingId existe
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        setExtraMachineCosts(centsToString(data?.extraMachineCosts ?? 0));
        setExtraMachineCostsDescription(data?.extraMachineCostsDescription || "");
        setIndividualPrice(centsToString(data?.individualPrice ?? 0));
    }, [ data ]);

    async function handleUpdateMachineExtraCosts() {
        const response = await UpdateBooking({ body: {
            individualPrice: parseStringToCents(individualPrice),
            extraMachineCosts: parseStringToCents(extraMachineCosts),
            extraMachineCostsDescription
        }, bookingId: selectedBookingId });

        if(response.statusCode !== 201) {
            queryClient.invalidateQueries({
                queryKey: [ "get-all-checkouts" ],
            });
            queryClient.invalidateQueries({ queryKey: [ "get-booking-by-id", selectedBookingId ] });
            // Atualize também o agendamento selecionado (estado pai)
            const updatedBooking = await GetBookingById({ bookingId: selectedBookingId });
            setSelectedCheckout(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    bookings: prev.bookings.map(b =>
                        b.bookingId === selectedBookingId ? { ...b, ...updatedBooking } : b
                    )
                };
            });
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            setExtraMachineCosts("");
            setExtraMachineCostsDescription("");
            setMachineExtraCostsDialogOpen(false);
        }
    }

    return (
        <Dialog
            open={ isMachineExtraCostsDialogOpen }
            // onOpenChange={ () => setMachineExtraCostsDialogOpen(data?.bookingId) }
            onOpenChange={ setMachineExtraCostsDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                                Custos extras
                    </DialogTitle>
                    <DialogDescription>
                                Defina aqui custos extras como quantidade de tiros, etc
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Label>Valor individual:</Label>
                    <PriceInput withLabel={ false } onChange={ (value) => setIndividualPrice(value) } value={ individualPrice } />
                </div>
                <div className="space-y-4 py-4">
                    <Label>Valor extra:</Label>
                    <PriceInput withLabel={ false } onChange={ (value) => setExtraMachineCosts(value) } value={ extraMachineCosts } />
                </div>
                <div className="space-y-4 py-4">
                    <Label>Descrição do valor extra:</Label>
                    <Textarea className="max-h-[150px]" onChange={ (e) => setExtraMachineCostsDescription(e.target.value) } value={ extraMachineCostsDescription } />
                </div>
                <div className="flex justify-end gap-4">
                    <Button variant={ "outline" } onClick={ () => setMachineExtraCostsDialogOpen(false) }>Cancelar</Button>
                    <Button onClick={ () => handleUpdateMachineExtraCosts() }>Aplicar</Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}