import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PriceInput from "@/components/shared/PriceInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GetBookingById, UpdateBooking } from "@/services/bookings.service";
import { toast } from "sonner";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@/utils/@types/bookings";
import { centsToString } from "@/utils/centsToString";
import { queryClient } from "@/app/(main)/layout";
import { Checkout } from "@/utils/@types/checkouts";

interface MachineExtraCostsDialogProps {
  setMachineExtraCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isMachineExtraCostsDialogOpen: boolean;
  selectedBookingId: string | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
  setBookingDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function MachineExtraCostsDialog({
  isMachineExtraCostsDialogOpen,
  setMachineExtraCostsDialogOpen,
  selectedBookingId,
  setSelectedCheckout,
}: MachineExtraCostsDialogProps) {
  const [ individualPrice, setIndividualPrice ] = useState("0");
  const [ extraMachineCosts, setExtraMachineCosts ] = useState("0");
  const [ extraMachineCostsDescription, setExtraMachineCostsDescription ] =
    useState("");

  const { data } = useQuery<Booking | undefined, Error>({
    queryKey: [ "get-booking-by-id", selectedBookingId ],
    queryFn: () => GetBookingById({ bookingId: selectedBookingId! }),
    enabled: !!selectedBookingId,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!isMachineExtraCostsDialogOpen) return;

    setExtraMachineCosts(centsToString(data?.extraMachineCosts ?? 0));
    setExtraMachineCostsDescription(data?.extraMachineCostsDescription || "");
    setIndividualPrice(centsToString(data?.individualPrice ?? 0));
  }, [ isMachineExtraCostsDialogOpen, data ]);

  async function handleUpdateMachineExtraCosts() {
    const response = await UpdateBooking({
      body: {
        individualPrice: parseStringToCents(individualPrice),
        extraMachineCosts: parseStringToCents(extraMachineCosts),
        extraMachineCostsDescription,
      },
      bookingId: selectedBookingId!,
    });

    if (response.statusCode === 200) {
      queryClient.invalidateQueries({
        queryKey: [ "get-all-checkouts" ],
      });
      queryClient.invalidateQueries({
        queryKey: [ "get-booking-by-id", selectedBookingId ],
      });

      if (selectedBookingId) {
        const newExtraMachineCosts = parseStringToCents(extraMachineCosts);
        const newIndividualPrice = parseStringToCents(individualPrice);

        setSelectedCheckout((prev) => {
          if (!prev) return prev;

          const updatedCheckout = { ...prev };
          const bookingIndex = updatedCheckout.Bookings.findIndex(
            (b) => b.bookingId === selectedBookingId,
          );
          if (bookingIndex === -1) return prev;

          const booking = updatedCheckout.Bookings[bookingIndex];

          // Valores antigos
          const oldExtra = booking.extraMachineCosts;
          const oldIndividual = booking.individualPrice;
          const oldDescription = booking.extraMachineCostsDescription;

          // Verifica diferenças e atualiza booking
          const updatedBooking = { ...booking };

          if (centsToString(oldExtra) !== extraMachineCosts)
            updatedBooking.extraMachineCosts = newExtraMachineCosts;

          if (centsToString(oldIndividual) !== individualPrice)
            updatedBooking.individualPrice = newIndividualPrice;

          if (oldDescription !== extraMachineCostsDescription)
            updatedBooking.extraMachineCostsDescription =
              extraMachineCostsDescription;

          updatedCheckout.Bookings[bookingIndex] = updatedBooking;

          // Atualiza totais de forma acumulada
          let totalDelta = 0;

          if (centsToString(oldExtra) !== extraMachineCosts)
            totalDelta += newExtraMachineCosts - oldExtra;

          if (centsToString(oldIndividual) !== individualPrice)
            totalDelta += newIndividualPrice - oldIndividual;

          updatedCheckout.basePrice += newIndividualPrice - oldIndividual;
          updatedCheckout.totalPrice += totalDelta;

          return updatedCheckout;
        });
      }

      toast.success(response.message, { style: { fontSize: "1rem" } });
      setMachineExtraCostsDialogOpen(false);
      window.scroll({ top: 0 });
    } else {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
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
          <DialogTitle className="text-xl">Custos extras</DialogTitle>
          <DialogDescription>
            Defina aqui custos extras como quantidade de tiros, etc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label>Valor individual:</Label>
          <PriceInput
            withLabel={ false }
            onChange={ (value) => setIndividualPrice(value) }
            value={ individualPrice }
          />
        </div>
        <div className="space-y-4 py-4">
          <Label>Valor extra:</Label>
          <PriceInput
            withLabel={ false }
            onChange={ (value) => setExtraMachineCosts(value) }
            value={ extraMachineCosts }
          />
        </div>
        <div className="space-y-4 py-4">
          <Label>Descrição do valor extra:</Label>
          <Textarea
            className="max-h-[150px]"
            onChange={ (e) => setExtraMachineCostsDescription(e.target.value) }
            value={ extraMachineCostsDescription }
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant={ "outline" }
            onClick={ () => setMachineExtraCostsDialogOpen(false) }
          >
            Cancelar
          </Button>
          <Button onClick={ () => handleUpdateMachineExtraCosts() }>
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
