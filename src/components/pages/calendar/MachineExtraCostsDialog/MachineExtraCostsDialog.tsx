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
import { SelectAdditionalGear } from "../DetailsDialog/SelectAdditionalGear";
import { useUnavailableGearIds } from "@/hooks/useUnavailableGearIds";

interface MachineExtraCostsDialogProps {
  setMachineExtraCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isMachineExtraCostsDialogOpen: boolean;
  selectedBookingId: string | null;
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
  // Quando o agendamento está concluído, exige justificativa para a alteração.
  requireJustification?: boolean;
}

export function MachineExtraCostsDialog({
  isMachineExtraCostsDialogOpen,
  setMachineExtraCostsDialogOpen,
  selectedBookingId,
  selectedCheckout,
  setSelectedCheckout,
  requireJustification = false,
}: MachineExtraCostsDialogProps) {
  const [ individualPrice, setIndividualPrice ] = useState("0");
  const [ extraMachineCosts, setExtraMachineCosts ] = useState("0");
  const [ extraMachineCostsDescription, setExtraMachineCostsDescription ] =
    useState("");
  const [ selectedGear, setSelectedGear ] = useState<{
    gearId: string;
    gearName: string;
  } | null>(null);
  const [ justification, setJustification ] = useState("");

  const { data } = useQuery<Booking | undefined, Error>({
    queryKey: [ "get-booking-by-id", selectedBookingId ],
    queryFn: () => GetBookingById({ bookingId: selectedBookingId! }),
    enabled: !!selectedBookingId,
    staleTime: 1000 * 60,
  });

  const unavailableGearIds = useUnavailableGearIds(
    selectedCheckout,
    isMachineExtraCostsDialogOpen,
  );

  useEffect(() => {
    if (!isMachineExtraCostsDialogOpen) return;

    setExtraMachineCosts(centsToString(data?.extraMachineCosts ?? 0));
    setExtraMachineCostsDescription(data?.extraMachineCostsDescription || "");
    setIndividualPrice(centsToString(data?.individualPrice ?? 0));
    setJustification("");

    const currentGear =
      selectedCheckout?.Bookings.find((b) => b.bookingId === selectedBookingId)
        ?.Gear ?? data?.gear;
    setSelectedGear(
      currentGear
        ? { gearId: currentGear.gearId, gearName: currentGear.gearName }
        : null,
    );
  }, [ isMachineExtraCostsDialogOpen, data, selectedBookingId, selectedCheckout ]);

  async function handleUpdateMachineExtraCosts() {
    const trimmedJustification = justification.trim();
    if (requireJustification && !trimmedJustification) {
      toast.warning(
        "Informe uma justificativa para alterar o valor de um agendamento concluído.",
        { style: { fontSize: "1rem" } },
      );
      return;
    }

    const originalGearId =
      selectedCheckout?.Bookings.find((b) => b.bookingId === selectedBookingId)
        ?.Gear.gearId ?? data?.gear?.gearId;
    const gearChanged =
      !!selectedGear && selectedGear.gearId !== originalGearId;

    const response = await UpdateBooking({
      body: {
        individualPrice: parseStringToCents(individualPrice),
        extraMachineCosts: parseStringToCents(extraMachineCosts),
        extraMachineCostsDescription,
        ...(gearChanged ? { gearId: selectedGear!.gearId } : {}),
        ...(requireJustification
          ? { justification: trimmedJustification }
          : {}),
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
      queryClient.invalidateQueries({
        queryKey: [ "get-all-checkouts-for-availability" ],
      });
      queryClient.invalidateQueries({ queryKey: [ "get-day-checkouts" ] });
      queryClient.invalidateQueries({
        queryKey: [ "get-checkout-value-changes" ],
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

          if (gearChanged && selectedGear)
            updatedBooking.Gear = {
              gearId: selectedGear.gearId,
              gearName: selectedGear.gearName,
            };

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
          <DialogTitle className="text-xl">Editar equipamento</DialogTitle>
          <DialogDescription>
            Troque a máquina e defina o valor e os custos extras (ex: quantidade
            de tiros).
          </DialogDescription>
        </DialogHeader>

        {selectedCheckout && !requireJustification && (
          <div className="space-y-2 py-4">
            <Label>Máquina:</Label>
            <SelectAdditionalGear
              key={ `${selectedBookingId ?? "none"}-${
                selectedGear?.gearId ?? "loading"
              }` }
              selectedCheckout={ selectedCheckout }
              unavailableGearIds={ unavailableGearIds }
              currentGearName={ selectedGear?.gearName }
              onSelect={ (gear) =>
                setSelectedGear({
                  gearId: gear.gearId,
                  gearName: gear.gearName,
                })
              }
            />
          </div>
        )}

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
        {requireJustification && (
          <div className="space-y-2 py-2">
            <Label className="text-destructive">
              Justificativa da alteração *
            </Label>
            <Textarea
              className="max-h-[150px]"
              placeholder="Descreva o motivo da alteração do valor neste agendamento concluído"
              onChange={ (e) => setJustification(e.target.value) }
              value={ justification }
            />
            <p className="text-xs text-muted-foreground">
              Esta alteração ficará registrada no histórico do agendamento.
            </p>
          </div>
        )}
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
